"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImmutableCRDT = void 0;
const crdt_rcb_1 = require("./crdt_rcb");
class ImmutableCRDT extends crdt_rcb_1.CRDT_RCB {
    constructor(children) {
        super();
        this.childs = children;
        for (let k in children) {
            this[k] = children[k];
        }
    }
    setParent(parent) {
        super.setParent(parent);
        this.addChildren(this.childs);
    }
}
exports.ImmutableCRDT = ImmutableCRDT;
//# sourceMappingURL=immutablecrdt.js.map