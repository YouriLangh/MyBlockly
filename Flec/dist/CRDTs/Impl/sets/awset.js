class AWSet extends PureOpCRDT {
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
