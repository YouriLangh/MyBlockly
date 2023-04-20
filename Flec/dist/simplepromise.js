
class SimplePromise {
    constructor(resolve, reject) {
        this.resolve = resolve;
        this.reject = reject;
    }
    static make(cb) {
        return new Promise(function (resolve, reject) {
            const simple = new SimplePromise(resolve, reject);
            cb(simple);
        });
    }
}
