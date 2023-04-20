"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleCRDT = void 0;
const crdt_rcb_1 = require("./crdt_rcb");
class SimpleCRDT extends crdt_rcb_1.CRDT_RCB {
    constructor() {
        super();
    }
    onOperation(clock, operation, data) {
        const op = operation.operation;
        const args = operation.args;
        const h = (this.handler[op]);
        h.apply(this, args);
    }
}
exports.SimpleCRDT = SimpleCRDT;
//# sourceMappingURL=simplecrdt.js.map