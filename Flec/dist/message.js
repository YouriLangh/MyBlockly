
class Msg {
    constructor(key, args, future, anotations) {
        this.key = key;
        this.args = args;
        this.future = future;
        this.annotations = anotations;
    }
    apply(obj) {
        let func;
        if (typeof (obj) === "object")
            func = Reflect.get(obj, this.key);
        else //if primitive
            func = obj.__proto__[this.key];
        if (typeof func === "undefined")
            throw `Object '${obj.toString()}' does not understand '${this.key.toString()}'`;
        if (typeof func === "function")
            return func.call(obj, ...this.args);
        else
            return func; // if it's not a function just return it
    }
    static fromJSON(d) {
        return Object.assign(new Msg(), d);
    }
}
