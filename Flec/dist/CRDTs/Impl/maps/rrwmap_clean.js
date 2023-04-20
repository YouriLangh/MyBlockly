"strict";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RRWMap = void 0;
const PureOpCRDT_1 = require("../../PureOpCRDT");
class RRWMap extends PureOpCRDT_1.PureOpCRDT {
    constructor(initializer) {
        super();
        this.values = new Map();
        this.setChildInitialiser(initializer);
    }
    // Redundancy relations
    isRedundantByOperation(existing, arriving, isRedundant) {
        return arriving.isDelete() && existing.hasSameArgAs(arriving);
    }
    isArrivingOperationRedundant(arriving) {
        const concurrentDeletes = this.getConcurrentEntries(arriving).
            filter(e => e.entry.isDelete() && e.entry.hasSameArgAs(arriving));
        return concurrentDeletes.length > 1;
    }
    doesChildNeedReset(child, arriving) {
        return {
            condition: arriving.isDelete() && arriving.args[0] == child,
            reset_concurrent: true
        };
    }
    // Resolve child CRDTs
    resolveChild(name) {
        return this.values.get(name);
    }
    // User functions
    lookup(k) {
        return this.values.get(k);
    }
    delete(k) {
        this.perform.delete(k);
    }
    update(path, ...args) {
        this.performNestedOp("update", path, args);
    }
}
exports.RRWMap = RRWMap;
//# sourceMappingURL=rrwmap_clean.js.map