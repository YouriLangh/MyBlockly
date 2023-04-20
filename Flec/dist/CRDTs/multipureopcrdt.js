"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiPureOpCRDT = void 0;
const ruwmap_1 = require("./Impl/maps/ruwmap");
class MultiPureOpCRDT extends ruwmap_1.RUWMap {
    constructor() {
        super(() => this.makeChild());
    }
    performOperationForLevel(level, op) {
        level = level.toString();
        if (this.children.has(level)) {
            this.children.get(level).performOperation(op);
        }
        else {
            console.warn("Trying to apply operation on non-existant child", op, level);
        }
    }
    onOperation(clock, operation, data) {
        const level = operation.getProperty("level").toString();
        this.performOperationForLevel(level, operation);
        this.propagateStrategy(operation);
    }
    propagateStrategy(operation) {
        // sorted keys (maybe update to bucket sort)
        const keys = Array.from(this.keys()).sort((a, b) => parseInt(b) - parseInt(a));
        // create template operation
        const op = operation.operation;
        const args = operation.args;
        const level = parseInt(operation.getProperty("level").toString());
        const nop = operation.clone();
        // never store the operation in the other children
        nop.addProperty("redundant", true);
        for (const key of keys) {
            const sibling_level = parseInt(key);
            if (sibling_level != level) {
                if (sibling_level < level) { }
                if (sibling_level > level) {
                    nop.addProperty("deactivate", true);
                }
                this.performOperationForLevel(sibling_level, nop);
                // now we need the result of the above .. we need to know if the operation itself is redundant
                // this way we can decide if the operatioon needs to be stored in the main level 
            }
        }
    }
    authOp(ai, clock, op) {
        //op.args["level"] = parseInt(ai.user);
        op.addProperty("level", parseInt(ai.user));
        return true;
    }
    drop(level) {
        this.children.delete(level.toString());
    }
}
exports.MultiPureOpCRDT = MultiPureOpCRDT;
//# sourceMappingURL=multipureopcrdt.js.map