"strict";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RUWMap = void 0;
const PureOpCRDT_1 = require("../../PureOpCRDT");
class RUWMap extends PureOpCRDT_1.PureOpCRDT {
    constructor(initializer) {
        super();
        this.values = new Map();
        this.children = this.values;
        this.initializer = initializer;
    }
    /*
    protected isConcurrentOperationRedundant(existing: MapEntry, arriving: MapEntry, isRedundant: boolean) {
        return arriving.isUpdate() && existing.hasSameArgAs(arriving);
    }
    */ // maybe we can remove concurrent updates from the log, but this might be risky
    // as concurrency is not transitive
    isPrecedingOperationRedundant(existing, arriving, isRedundant) {
        return existing.hasSameArgAs(arriving);
        // any preceding update on the same args is redundant
    }
    isArrivingOperationRedundant(arriving) {
        return arriving.isDelete();
        // we don't need to store deletes as they have no impact
        // e.g. all preceding elements are removed by isPrecedingOperationRedundant
    }
    addEntry(entry) {
        if (entry.isUpdate()) {
            const key = entry.args[0];
            if (!this.values.get(key)) {
                // if we don't have a value set for a key, initialize a new CRDT instance for it
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
    resolveChild(name) {
        return this.values.get(name);
    }
    lookup(k) {
        return this.values.get(k);
    }
    keys() {
        return this.values.keys();
    }
    delete(k) {
        this.perform.delete(k);
    }
    update(path, ...args) {
        this.performNestedOp("update", path, args);
    }
}
exports.RUWMap = RUWMap;
//# sourceMappingURL=ruwmap.js.map