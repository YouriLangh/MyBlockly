"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWMap = void 0;
const pureopcrdt_1 = require("../../pureopcrdt");
const lwwregister_1 = require("../registers/lwwregister");
class AWMap extends pureopcrdt_1.PureOpCRDT {
    constructor(initializer) {
        super();
        this.values = new Map();
        this.children = this.values;
    }
    //mycrdt[a][b][c].doSomething();
    //update(mycrdt, update(a, update(b, update(c, doSomething))))
    isPrecedingOperationRedundant(existing, arriving, isRedundant) {
        return arriving.isClear() ||
            existing.hasSameArgAs(arriving);
    }
    isArrivingOperationRedundant(arriving) {
        return arriving.isDelete() ||
            arriving.isClear();
    }
    // add entry and remove entry are used for creating and removing the nested CRDTs
    addEntry(entry) {
        if (entry.isUpdate()) {
            const key = entry.args[0];
            // if we don't have a value set for a key, initialize a new CRDT instance for it
            if (!this.values.get(key)) {
                const val = new lwwregister_1.Register();
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
    delete(k) {
        this.perform.delete(k);
    }
    update(path, ...args) {
        this.performNestedOp("update", path, args);
    }
}
exports.AWMap = AWMap;
//# sourceMappingURL=awmap.js.map