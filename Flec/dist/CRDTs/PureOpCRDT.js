"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PureOpCRDT = void 0;
const crdt_rcb_1 = require("./crdt_rcb");
const POLogEntry_1 = require("./POLogEntry");
class PerformProxy {
    get(target, p, receiver) {
        return (...args) => {
            //console.log("proxy perform op", p, args);
            return target.performOp(p.toLowerCase(), args);
        };
    }
}
class PureOpCRDT extends crdt_rcb_1.CRDT_RCB {
    constructor() {
        super();
        this.log = [];
        this.compact = {};
        this.network = [];
        this.logCompactSize = 100;
        this.perform = new Proxy(this, new PerformProxy());
    }
    ///
    preApplyFilter(msg) {
        const annotations = msg.annotations;
        if (msg.key !== "doOperation") {
            return true;
        }
        if (typeof annotations !== "undefined") {
            let level;
            if ((level = this.validateAuth(annotations)) !== false) {
                msg.args = [
                    msg.args[0],
                    msg.args[1],
                    msg.args[2],
                    level
                ];
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
    validateAuth(x) {
        return 0;
    }
    ///
    onNewReplica(ref, refs) {
        super.onNewReplica(ref, refs);
        /*
        let first = refs.length == 1

        if (first) {
            this.joinNode = ref

            ref.getNetwork().then(network => {
                network.forEach(node => {
                    this.network[node] = false;
                });
            });

            ref.join(this.id).then(id => {
                this.join(id);
                let all = true;

                this.network.forEach(n => {
                    all = all && n;
                })

                if (all) {
                    this.joinNode.getState().then(state => {
                        this.setupState(state);
                    });
                }
            });
        }*/
    }
    setupState(state) {
        this.compact = state.compact;
        this.log = state.log;
        this.clock.merge(state.clock);
        this.clock.addProcess(this.id, state.clock.getLocalClock());
    }
    createLogEntry(clock, op) {
        const entry = POLogEntry_1._POLogEntry.create(clock, op.operation, op.args);
        // copy over properties
        // TODO: think about optimizing this
        for (const prop of op.getPropertyNames()) {
            entry.addProperty(prop, op.getProperty(prop));
        }
        return entry;
    }
    getNetwork() {
        return this.network;
    }
    join(id) {
        this.remoteClocks[id] = null;
        this.network[id] = true;
        return this.id;
    }
    getState() {
        return [this.clock, this.compact, this.log];
    }
    getConcurrentEntries(entry) {
        let conc = [];
        for (let i = 0; i < this.log.length; i++) {
            let e = this.log[i];
            if (entry.isConcurrent(e))
                conc.push({ idx: i, entry: entry });
        }
        return conc;
    }
    authOp(authInfo, clock, op) {
        let entry = this.createLogEntry(clock, op);
        return this.isAllowedByPolicy(authInfo, entry);
    }
    getLog() {
        return this.log;
    }
    getBufferedLog() {
        return this.getBufferData();
    }
    handleExisitingRedundantOperations(entry, isRedundant) {
        ///////////////////////////////////////////////////////////////////
        // ARE EXISTING LOG ENTRIES REDUNDANT BY THE NEW OPERATION ?     //
        // E.g. in the AW-Set rem(x) will make all prev add(x) redundant //
        ///////////////////////////////////////////////////////////////////
        for (let i = this.log.length - 1; i >= 0; i--) {
            let e = this.log[i];
            if (this.isRedundantByOperation(e, entry, isRedundant)) {
                this.removeEntry(this.log[i], entry);
                delete this.log[i];
            }
        }
        this.log = this.log.filter(e => typeof e !== "undefined"); // can we avoid mutating the log every time? 
    }
    onOperation(clock, operation, data) {
        //console.log("received operation", operation);
        const op = operation.operation;
        const args = operation.args;
        let entry = data || this.createLogEntry(clock, operation);
        //console.log("onop", entry);
        this.newOperation(entry);
        //////////////////////////////////////////////////////////
        // IS THE NEW OPERATION REDUNDANT ?                     //
        // E.g. in the AW-Set we never store 'clear' operations //
        //////////////////////////////////////////////////////////
        let isRedundant = this.isArrivingOperationRedundant(entry);
        ///////////////////////////////////////////////////////////////////
        // ARE EXISTING LOG ENTRIES REDUNDANT BY THE NEW OPERATION ?     //
        // E.g. in the AW-Set rem(x) will make all prev add(x) redundant //
        ///////////////////////////////////////////////////////////////////
        this.handleExisitingRedundantOperations(entry, isRedundant);
        ////////////////////////////////////////////////////////////
        // IS THE NEW OPERATION REDUNDANT BY A BUFFERED OPERATION //
        ////////////////////////////////////////////////////////////
        const bufOps = this.getBufferData();
        //console.log(bufOps);
        for (let i = 0; i < bufOps.length; i++) {
            isRedundant = isRedundant || this.isRedundantByBufferedOperation(entry, bufOps[i], false);
        }
        // Don't put in log if redundant
        if (!isRedundant && operation.getProperty("discard") !== true) {
            this.log.push(entry);
            this.addEntry(entry);
        }
        this.cleanup();
    }
    onBufferedOperation(clock, op) {
        const entry = this.createLogEntry(clock, op);
        this.newBufferedOperation(entry);
        //if (this.id == "vma:::actor0:::0") console.log("buffff", this.log.length);
        for (let i = this.log.length - 1; i >= 0; i--) {
            let e = this.log[i];
            //if (this.id == "vma:::actor0:::0") console.log("buff", e);
            if (this.isRedundantByBufferedOperation(e, entry, false)) {
                this.removeEntry(this.log[i], entry); //hook
                delete this.log[i];
                this.callback(this); // TODO better change hook here
            }
        }
        this.log = this.log.filter(e => typeof e !== "undefined");
        return entry;
    }
    markStable() {
        let stableItems = false;
        this.log.forEach(e => {
            if (this.isCausallyStable(e.clock)) {
                //console.log("is stable on", this.id)
                e.setStable();
                stableItems = true;
            }
        });
        return stableItems;
    }
    compactStable() {
        //console.log(">>> stable");
        this.log.filter(e => e.isStable && this.getConcurrentEntries(e).map(e => e.entry.stable).reduce((a, b) => a && b, true)).forEach(e => {
            if (this.setEntryStable(e)) {
                delete this.log[this.log.indexOf(e)];
            }
        }); //TODO SUPER OPTIMIZE THIS
        this.log = this.log.filter(e => typeof e !== "undefined");
    }
    gcStable(reason) {
        if (this.markStable())
            this.compactStable();
    }
    cleanup() {
        if (this.log.length === this.logCompactSize)
            this.performPendingStableMsg();
    }
    setGCParams(logSize, intervalSize) {
        this.logCompactSize = logSize;
        this.setStableMsgInterval(intervalSize);
        this.cleanup();
    }
    /////////////////////////////////////////
    // General hooks for CRDT implementors //
    /////////////////////////////////////////
    setEntryStable(entry) {
        return false;
    }
    ;
    removeEntry(entry, cause) { }
    ;
    addEntry(entry) { }
    ;
    newOperation(entry) { }
    ;
    newBufferedOperation(entry) { }
    ;
    /////////////////
    // R_ relation //
    /////////////////
    isRedundantByOperation(e1, e2, isRedundant = false) {
        return (e1.precedes(e2) && this.isPrecedingOperationRedundant(e1, e2, isRedundant)) ||
            (e1.isConcurrent(e2) && this.isConcurrentOperationRedundant(e1, e2, isRedundant));
    }
    isPrecedingOperationRedundant(e1, e2, isRedundant) {
        return false;
    }
    isConcurrentOperationRedundant(e1, e2, isRedundant) {
        return false;
    }
    /////////////////////
    // R_BETA relation //
    /////////////////////
    isRedundantByBufferedOperation(e, entry, isRedundant) {
        return false;
    }
    ;
    /////////////////
    // Policy hook //
    /////////////////
    isAllowedByPolicy(ai, entry) {
        return true;
    }
}
exports.PureOpCRDT = PureOpCRDT;
//# sourceMappingURL=PureOpCRDT.js.map