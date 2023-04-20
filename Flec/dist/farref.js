
class FarReference {
    constructor(machineId, actorId, objectId) {
        this.machineId = machineId;
        this.actorId = actorId;
        this.objectId = objectId;
        this.delay = 0;
    }
    getProxyRef(owner) {
        const me = this;
        const baseObj = {
            __id__: this.getNetworkId(),
            __meta__: this,
            toString: () => `FarRef{${this.getNetworkId()}}`
        };
        const fr = (0, createMsgProxy)(baseObj, msg => {
            const promise = SimplePromise.make(simplePromise => {
                // get a far ref to the 'simple' promise object that will be used to sent the result to
                const promiseFr = owner.getFarRef(simplePromise);
                msg.future = promiseFr;
                //console.log('deliver',msg);
                if (typeof this.preSendHook !== "undefined")
                    this.preSendHook(this, msg, false);
                this.deliverMsg(owner, msg);
            });
            return (0, CPromise)(promise);
        });
        return fr;
    }
    sendOneWayMessage(owner, key, ...args) {
        const msg = new Msg(key, args);
        if (typeof this.preSendHook !== "undefined")
            this.preSendHook(this, msg, true);
        this.deliverMsg(owner, msg);
    }
    deliverMsg(owner, msg) {
        if (this.delay > 0)
            setTimeout(() => owner.deliverMsg(msg, this), this.delay);
        else
            owner.deliverMsg(msg, this);
    }
    setDelay(delay) {
        this.delay = delay;
    }
    registerPreSendHook(hook) {
        this.preSendHook = hook;
    }
    isEqualTo(fr) {
        return this.machineId === fr.machineId &&
            this.actorId === fr.actorId &&
            this.objectId === fr.objectId;
    }
    getNetworkId() {
        return `${this.machineId}:::${this.actorId}:::${this.objectId}`;
    }
    clone() {
        return new FarReference(this.machineId, this.actorId, this.objectId);
    }
    static fromJSON(d) {
        return Object.assign(new FarReference(), d);
    }
}
