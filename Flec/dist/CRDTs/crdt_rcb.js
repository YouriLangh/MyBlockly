"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRDT_RCB = exports.GarbageCollectReason = void 0;
const vc_1 = require("../clocks/vc");
const AuthInfo_1 = require("./AuthInfo");
const console_1 = require("console");
const Operation_1 = require("./Operation");
var GarbageCollectReason;
(function (GarbageCollectReason) {
    GarbageCollectReason[GarbageCollectReason["NewOperation"] = 0] = "NewOperation";
})(GarbageCollectReason = exports.GarbageCollectReason || (exports.GarbageCollectReason = {}));
class BufferEntry {
    constructor(clock, op, local, data) {
        this.clock = clock;
        this.op = op;
        this.local = local;
        this.data = data;
    }
}
class CRDT_RCB {
    constructor() {
        this.count_recv = 0;
        this.count_processed = 0;
        this.count_send = 0;
        this.replicas = [];
        this.callback = (crdt) => { };
        this.remoteClocks = new Map();
        this.bufferedOperations = [];
        ///////////////////////////////
        // Nested CRDT functionality //
        ///////////////////////////////
        this.isChild = false;
        this.children = new Map();
        this.stableCounter = 0;
        this.stableMsgInterval = 1;
        this.pendingStable = false;
    }
    setCallBack(callback) {
        this.callback = callback;
    }
    setParent(parent) {
        (0, console_1.assert)(this.isChild === false);
        this.clock = parent.clock;
        this.id = this.clock.getId();
        this.isChild = true;
    }
    addChild(name, child) {
        this.children.set(name, child);
        child.setParent(this);
    }
    resolveChild(name) {
        return this.children.get(name);
    }
    addChildren(o) {
        for (let k in o) {
            this.addChild(k, o[k]);
        }
        ;
    }
    ////////////////
    // Networking //
    ////////////////
    goOnline(actor, tag) {
        this.tag = tag;
        this.actor = actor;
        const me = this;
        const ref = actor.getFarRef(this);
        this.id = ref.getNetworkId();
        this.clock = new vc_1.VectorClock(this.id);
        actor.doExport(this.tag, this);
        actor.whenDiscovered(this.tag, fr => {
            this.replicas.push(fr);
            this.onNewReplica(fr, this.replicas);
        });
        actor.registerPreApplyHook(this, (msg) => {
            return me.parseAuth(msg);
        });
        this.onLoaded();
        this.authInfo = new AuthInfo_1.AuthInfo();
    }
    onNewReplica(ref, refs) {
        const id = ref.__id__();
        this.remoteClocks[id] = new vc_1.VectorClock(id);
        //console.log(ref.__meta__);
        ref.__meta__().registerPreSendHook((ref, msg, oneway) => {
            msg.annotations = this.authInfo;
            //console.log(`${ref.actorId},${this.actor.id},${JSON.stringify(msg).length},${global["count"]}`);
        });
    }
    ;
    ///////////
    // Other //
    ///////////
    onLoaded() { }
    ;
    performOperation(cop) {
        if (!this.isChild) {
            this.clock.increment();
        } // if child, incrementing is the responsibility of the parent
        let clock = this.clock.copy();
        if (!this.isChild) {
            this.doOperation(clock, cop, true);
            this.performReplicasOp(clock, cop);
        }
        else if (cop.isCRDTOperation()) {
            // skip RCB if we are a child, and do not replicate (responsibility of parent)
            this.onOperation(clock, cop, null);
        }
        else if (cop.isNestedCRDTOperation()) {
            this.onNestedOperation(clock, cop);
        }
        //if (this.callback != null) {
        //    this.callback(this);
        //}
        return this.clock.getUniqueId();
    }
    performOp(op, args) {
        let cop = new Operation_1.CRDTOperation(op, args);
        return this.performOperation(cop);
    }
    performNestedOp(op, path, args) {
        let cop = new Operation_1.NestedCRDTOperation(op.toString(), path, args);
        return this.performOperation(cop);
    }
    performReplicasOp(clock, op) {
        return Promise.all(this.replicas.map(r => {
            this.count_send++;
            return r.doOperation(clock.copy(), op, false);
        })).then(_ => this.observedByAll(clock));
    }
    tryOperation(rclock, op, isLocal, data) {
        this.remoteClocks[rclock.getId()] = rclock;
        // patch, fix follows to allow multiple concurrent updates
        let follows = (!op.isRCBOperation() && this.clock.hasPrecedingDependenciesFor(rclock)) || (op.isRCBOperation() && this.clock.contains(rclock));
        //console.log(">> tryOp", this.id, op, follows, this.clock, rclock);
        if (follows || isLocal) {
            this.count_processed++;
            //console.log("ffff follows")
            this.clock.merge(rclock);
            //console.log("after merge", JSON.parse(JSON.stringify(this.clock)))
            if (op.isRCBOperation()) {
                this.onRCBOperation(rclock, op);
            }
            else if (op.isCRDTOperation()) {
                this.onOperation(rclock, op, data);
                if (this.callback != null) {
                    this.callback(this);
                }
            }
            else if (op.isNestedCRDTOperation()) {
                this.onNestedOperation(rclock, op);
            }
            this.gcStable(GarbageCollectReason.NewOperation);
        }
        else {
            //console.log("ffff does not follow", rclock, op)
        }
        return follows || isLocal;
    }
    tryBufferedOperations() {
        let i = this.bufferedOperations.length - 1;
        while (i >= 0) {
            const e = this.bufferedOperations[i];
            //console.log("try",e);
            if (this.tryOperation(e.clock, e.op, e.local, e.data)) {
                this.bufferedOperations.splice(i, 1);
                i = this.bufferedOperations.length - 1; // restart try all
                //console.log("<<", this.bufferedOperations)
            }
            else {
                i--;
            }
        }
    }
    parseAuth(msg) {
        if (msg.key == this.doOperation.name) {
            let ai = new AuthInfo_1.AuthInfo();
            if (typeof msg.annotations !== "undefined") {
                ai.user = msg.annotations.user || "";
                //ai.user = msg.annotations.token || "";
            }
            const clock = msg.args[0];
            const op = msg.args[1];
            if (op.isRCBOperation())
                return this.authRCBOp(ai, clock, op);
            else if (op.isCRDTOperation())
                return this.authOp(ai, clock, op);
            else if (op.isNestedCRDTOperation())
                return this.authNestedOp(ai, clock, op);
            return true;
        }
        else {
            return false;
        }
    }
    getFopAuthPolicy(authInfo) {
        return;
    }
    authRCBOp(authInfo, clock, op) {
        const policy = this.getFopAuthPolicy(authInfo);
        if (typeof policy !== "undefined")
            return policy.allows(op.operation);
        else
            return true; // if there is no policy defined, we don't care about it
    }
    authOp(authInfo, clock, op) {
        return true;
    }
    authNestedOp(authInfo, clock, op) {
        return true;
    }
    doOperation(clock, op, isLocal) {
        this.count_recv++;
        if (this.tryOperation(clock, op, isLocal, null)) {
            return this.tryBufferedOperations();
        }
        else {
            let data = null;
            if (op.isCRDTOperation()) {
                data = this.onBufferedOperation(clock, op);
            }
            const entry = new BufferEntry(clock, op, isLocal, data);
            this.bufferedOperations.push(entry);
        }
    }
    getBufferData() {
        return this.bufferedOperations.filter(b => b.op.isCRDTOperation()).map(b => b.data);
    }
    onBufferedOperation(rclock, op) {
        // call when operation goes into buffers
        return;
    }
    onOperation(clock, op, data) {
    }
    setChildInitialiser(ini) { }
    ;
    onNestedOperation(clock, op) {
        //console.log(op);
        const path = op.path;
        if (path.length == 0) {
            console.warn("[WARN] Ignoring empty nested operation");
        }
        else {
            const local_op = op.operation;
            const top_path = path[0];
            // perform 'shell' operation locally -> mostly this is just an update function, not the final operation
            const local_update = new Operation_1.CRDTOperation(local_op, [top_path.key]);
            local_update.properties = op.properties;
            this.onOperation(clock, local_update, null); // create new operation for this?
            // 1. need update operation locally
            // 2. need nested operation for nested device
            // Q: do we need to keep the property maps? -> best idea might be to copy the references, keep the same object
            //    as it's talking about the same update in the end ... maybe also good as a way to share other things
            // another thing to think about, for the future, if I want to reject a CRDT at a lower, nested level, I should not apply the parent 
            // updates until I confirmed that this should be the case, now we simply call update, and continue to the nested update 
            // so the parent updates might be called unneededly ...
            // apply the nested operation
            const child = this.resolveChild(top_path.key);
            if (child) {
                const remaining_path = path.slice(1);
                let operation;
                if (remaining_path.length > 0)
                    operation = new Operation_1.NestedCRDTOperation(top_path.op, remaining_path, op.args);
                //child.performNestedOp(top_path.op, remaining_path, op.args);
                else
                    operation = new Operation_1.CRDTOperation(top_path.op, op.args);
                //child.performOp(top_path.op, op.args);
                operation.properties = op.properties;
                child.performOperation(operation);
            }
            else {
                console.warn("[WARN] Ignoring nested operation, could not find child", op);
            }
        }
    }
    onRCBOperation(rclock, op) {
        switch (op.operation) {
            case Operation_1.RCBOp.Stable:
                //console.log("receive stable", rclock.id);
                this.setStable(rclock.getId(), rclock.localValue());
                break;
        }
    }
    isCausallyStable(clock) {
        let id = clock.getId();
        let ts = clock.localValue();
        let mts = ts;
        //console.log(this.remoteClocks);
        this.replicas.forEach(r => {
            const rid = r.__id__();
            let rc = this.remoteClocks[rid];
            if (typeof rc === "undefined")
                mts = 0;
            else
                mts = Math.min(mts, rc.clockAt(id));
        });
        return mts == ts;
    }
    //set remoteclock at id stable
    setStable(id, sclock) {
        for (let key in this.remoteClocks) {
            let rc = this.remoteClocks[key];
            let current = rc.clockAt(id);
            if (sclock > current)
                rc.setClockAt(id, sclock);
        }
    }
    gcStable(reason) {
        // perform gc on stable items
    }
    observedByAll(clock) {
        //return;
        // clock should be updated with values for other nodes
        // this way it cannot be wrongly ordered
        const bclock = this.clock.copy();
        bclock.setClockAt(clock.getId(), clock.localValue());
        this.setStable(clock.getId(), clock.localValue());
        this.pendingStable = (((this.stableCounter++) % this.stableMsgInterval) != 0);
        //console.log("Should I send message:", this.pendingStable);
        if (!this.pendingStable) {
            this.performStableMsg(bclock);
        }
        else {
            this.pendingClock = bclock;
        }
    }
    performStableMsg(clock) {
        //console.log("Sending stable message", this.id);
        let cop = new Operation_1.RCBOperation(Operation_1.RCBOp.Stable, []);
        this.replicas.forEach(r => {
            this.count_send++;
            r.doOperation(clock, cop, false);
        });
    }
    performPendingStableMsg() {
        if (this.pendingStable) {
            this.performStableMsg(this.pendingClock);
            this.pendingStable = false;
        }
    }
    setStableMsgInterval(intr) {
        this.stableMsgInterval = intr;
    }
    serialize() {
        var _a;
        const out = {};
        for (let k of this.children.keys()) {
            out[k] = (_a = this.children.get(k)) === null || _a === void 0 ? void 0 : _a.serialize();
        }
        return out;
    }
}
exports.CRDT_RCB = CRDT_RCB;
//# sourceMappingURL=crdt_rcb.js.map