const PROXY_IS_PREFIX = "is";
class EntryProxy {
    get(target, p, receiver) {
        const base = Reflect.get(target, p, receiver);
        if (!base && typeof p == "string" && p.indexOf(PROXY_IS_PREFIX) == 0) {
            return () => {
                const operation = (p.substr(PROXY_IS_PREFIX.length)).toLowerCase();
                const res = target.is(operation);
                //console.log("proxy is check: is " + operation +" -> " + res);
                return res;
            };
        }
        return base;
    }
}
class _POLogEntry {
    constructor(clock, operation, args) {
        this.stable = false;
        this.operation = operation;
        this.clock = clock;
        this.args = args;
        this.properties = new Map();
        return new Proxy(this, new EntryProxy());
    }
    static create(clock, k, a) {
        return new this(clock, k, a);
    }
    addProperty(key, value) {
        if (this.properties === undefined)
            this.properties = new Map();
        this.properties.set(key, value);
    }
    getProperty(key) {
        return this.properties.get(key);
    }
    setStable() {
        this.stable = true;
    }
    isStable() {
        return this.stable;
    }
    // VC operations
    precedes(entry) {
        return this.clock.precedes(entry.clock);
    }
    isConcurrent(entry) {
        return this.clock.isConcurrent(entry.clock);
    }
    follows(entry) {
        return this.clock.precedesDirectly(entry.clock);
    }
    //OP
    is(op) {
        return this.operation === op;
    }
    // args
    hasSameArgAs(entry, idx = 0) {
        return this.args[idx] === entry.args[idx];
    }
    getOrigin() {
        return this.clock.getId();
    }
    getUniqueId() {
        return this.clock.getUniqueId();
    }
    toString() {
        return this.clock.toString() + "\t" + (this.stable ? "stable" : "     ") + "\t" + this.operation.toString() + "(" + this.args.join(", ") + ")";
    }
}
//# sourceMappingURL=POLogEntry.js.map