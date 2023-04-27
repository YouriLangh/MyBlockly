"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRDT = void 0;
//import * as TSAT from "../sb";
class CRDT {
    constructor(tag) {
        this.replicas = [];
        this.callback = (crdt) => { };
        this.tag = tag;
        this.cnt = 0;
        //this.id = getNetworkId();
        //replicasRef = TSAT.MultiRef(this.replicas);
        //TSAT.whenDiscovered(String, ref => {
        //    this.replicas.push(ref);
        //    this.onNewReplica(ref);
        //});
        //TSAT.doExport(this, this.tag);
        this.onLoaded();
    }
    goOnline(actor) {
        const ref = actor.getFarRef(this);
        this.id = ref.getNetworkId();
        actor.doExport(this.tag, this);
        actor.whenDiscovered(this.tag, fr => {
            this.replicas.push(fr);
            this.onNewReplica(fr);
        });
        this.onLoaded();
    }
    onNewReplica(ref) { }
    ;
    onLoaded() { }
    ;
    performOp(op, args) {
        this.doOperation(op, args);
        this.performReplicasOp(op, args);
    }
    performReplicasOp(op, args) {
        return this.replicas.forEach(fr => fr.doOperation(op, args));
    }
    doOperation(op, args) {
        let res = this.onOperation(this.exportedOperations, op, args);
        this.callback(this);
        return res;
    }
    onOperation(exportedOps, op, args) {
        return exportedOps[op](this, args);
    }
    getUniqueId() {
        return this.id + "__" + (this.cnt++);
    }
}
//# sourceMappingURL=crdt.js.map