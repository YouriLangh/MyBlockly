"strict";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RRWMap = void 0;
const PureOpCRDT_1 = require("../../PureOpCRDT");
class RRWMap extends PureOpCRDT_1.PureOpCRDT {
    constructor(initializer) {
        super();
        this.values = new Map();
        this.children = this.values;
        this.initializer = initializer;
    }
    isRedundantByOperation(existing, arriving, isRedundant) {
        return arriving.isDelete() && existing.hasSameArgAs(arriving);
    }
    isArrivingOperationRedundant(arriving) {
        const concurrentDeletes = this.getConcurrentEntries(arriving).
            filter(e => e.entry.isDelete() && e.entry.hasSameArgAs(arriving));
        return concurrentDeletes.length > 1;
    }
    addEntry(entry) {
        if (entry.isUpdate()) {
            const key = entry.args[0];
            // if we don't have a value set for a key, initialize a new CRDT instance for it
            if (!this.values.get(key)) {
                const val = this.initializer();
                val.setParent(this);
                this.values.set(key, val);
            }
        }
    }
    removeEntry(entry, cause) {
        if (cause.isDelete()) {
            const key = entry.args[0];
            this.values.delete(key); //removing delete the nested CRDT object
        }
    }
    // needed for the nesting system to determine how to obtain a child based on a key
    resolveChild(name) {
        return this.values.get(name);
    }
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
//# sourceMappingURL=rrwmap.js.map