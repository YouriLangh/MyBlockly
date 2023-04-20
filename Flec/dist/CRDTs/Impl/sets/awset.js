"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWSet = void 0;
const PureOpCRDT_1 = require("../../PureOpCRDT");
class AWSet extends PureOpCRDT_1.PureOpCRDT {
    isPrecedingOperationRedundant(existing, arriving, isRedundant) {
        return arriving.isClear() ||
            existing.hasSameArgAs(arriving);
    }
    isArrivingOperationRedundant(arriving) {
        return arriving.isRemove() ||
            arriving.isClear();
    }
    toSet() {
        let set = new Set();
        this.getLog().forEach(entry => {
            set.add(entry.args[0]);
        });
        return set;
    }
    serialize() {
        return this.toSet();
    }
    contains(element) {
        return this.toSet().has(element);
    }
    add(element) {
        this.perform.add(element);
    }
    remove(element) {
        this.perform.remove(element);
    }
    clear() {
        this.perform.clear();
    }
}
exports.AWSet = AWSet;
//# sourceMappingURL=awset.js.map