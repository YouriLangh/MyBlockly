"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RWSet = void 0;
const pureopcrdt_1 = require("../../pureopcrdt");
class RWSet extends pureopcrdt_1.PureOpCRDT {
    constructor() {
        super(...arguments);
        this.isRedundantByBufferedOperation = this.isRedundantByOperation;
        this.newOperation = this.cleanCompactEntries;
        this.newBufferedOperation = this.newOperation;
        this.removeEntry = this.newOperation;
    }
    isRedundantByOperation(e1, e2, isRedundant) {
        return (e1.precedes(e2)
            && ((e1.isAdd() && e2.isClear()) || e1.hasSameArgAs(e2)))
            ||
                (e1.isConcurrent(e2)
                    && e1.isAdd() && e2.isRemove() && e1.hasSameArgAs(e2));
    }
    isArrivingOperationRedundant(entry) {
        return entry.isClear() || (entry.isAdd() &&
            !!this.log.find(e => e.isRemove() && // for each remove operation
                e.hasSameArgAs(entry) && // that has the same value
                e.isConcurrent(entry))); // and that is concurrent*/
    }
    setEntryStable(entry) {
        let element;
        if (entry.isAdd()) {
            const element = entry.args[0];
            this.compact[element] = true;
        }
        return true;
    }
    cleanCompactEntries(entry) {
        if (!entry.isClear()) {
            let element = entry.args[0];
            delete this.compact[element];
        }
        else {
            this.compact = {};
        }
    }
    toList() {
        let list = Object.assign({}, this.compact);
        this.getLog().forEach(entry => list[entry.args[0]] = true);
        let sb = this.getBufferedLog();
        sb.forEach(entry => {
            if (entry.isAdd() &&
                !sb.find(e => e.isRemove() &&
                    (e.isConcurrent(entry) || e.follows(entry))))
                list[entry.args[0]] = true;
        });
        return Object.keys(list);
    }
    contains(element) {
        return this.toList().indexOf(element) !== -1;
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
    serialize() {
        return this.toList();
    }
}
exports.RWSet = RWSet;
//# sourceMappingURL=rwset.js.map