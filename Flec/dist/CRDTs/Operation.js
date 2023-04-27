class anotherEnum{
    constructor(){
        this.RCB_Operation = 0;
        this.CRDT_Operation = 1;
        this.Nested_CRDT_Operation = 2;
    }
}
const OperationType = new anotherEnum();

class anotherEnum2{
    constructor(){
        this.Stable = 0;
    }
}
const RCBOp = new anotherEnum2();
class Operation {
    constructor(args) {
        this.args = args;
        this.properties = new Map();
    }
    ////////////////
    // PROPERTIES //
    ////////////////
    addProperty(key, value) {
        if (this.properties === undefined)
            this.properties = new Map();
        this.properties.set(key, value);
    }
    getProperty(key) {
        return this.properties.get(key);
    }
    getPropertyNames() {
        return this.properties.keys();
    }
    ////////////
    // Typing //
    ////////////
    is(t) {
        return t === this.type;
    }
    isCRDTOperation() {
        return this.type === OperationType.CRDT_Operation;
    }
    isNestedCRDTOperation() {
        return this.type === OperationType.Nested_CRDT_Operation;
    }
    isRCBOperation() {
        return this.type === OperationType.RCB_Operation;
    }
    clone() {
        const c = this._clone();
        this.properties.forEach((v, k) => c.addProperty(k, v));
        return c;
    }
}
class CRDTOperation extends Operation {
    constructor(op, args) {
        super(args);
        this.type = OperationType.CRDT_Operation;
        this.operation = op;
    }
    _clone() {
        const o = this;
        return new CRDTOperation(o.operation, o.args);
    }
}
class RCBOperation extends Operation {
    constructor(op, args) {
        super(args);
        this.type = OperationType.RCB_Operation;
        this.operation = op;
    }
    _clone() {
        const o = this;
        return new RCBOperation(o.operation, o.args);
    }
}
class NestedCRDTOperation extends Operation {
    constructor(op, path, args) {
        super(args);
        this.type = OperationType.Nested_CRDT_Operation;
        this.path = path;
        this.operation = op;
    }
    _clone() {
        const o = this;
        return new NestedCRDTOperation(o.operation, o.path.map(e => { return { key: e.key, op: e.op }; }), o.args);
    }
    getTopCRDTOperation() {
        return new CRDTOperation(this.path[0].op, this.args);
    }
}
//# sourceMappingURL=Operation.js.map