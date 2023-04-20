
function createMsgProxy(base, messageSendCallBack) {
    const fr = new Proxy({}, {
        get: (obj, key) => (...args) => {
            const msg = new Msg(key, args);
            if (Object.keys(base).indexOf(key.toString()) != -1) {
                //console.log("==",key,Reflect.get(base, key),Object.keys(base),base);
                return msg.apply(base);
            }
            return messageSendCallBack(msg); // must return a promise of the correct type
        }
    });
    return fr;
}
function CPromise(base) {
    const buffer = [];
    let basePromise = base;
    if (typeof basePromise !== "object" || !Reflect.has(basePromise, "then")) // not thenable
        basePromise = Promise.resolve(basePromise);
    return createMsgProxy(basePromise, msg => {
        if (Reflect.get(basePromise, msg.key)) {
            return msg.apply(basePromise); // if we are actually invoking promise stuff instead of type stuff
        }
        else {
            const r = basePromise.then(res => {
                return msg.apply(res);
            });
            return CPromise(r);
        }
    });
}
