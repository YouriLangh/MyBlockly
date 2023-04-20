 class Actor extends Switchboard {
    constructor(id) {
        super(id);
        this.objects = [];
        this.preApplyHooks = {};
    }
    registerObject(o) {
        const id = this.objects.length++;
        this.objects[id] = o;
        return id;
    }
    getObjectId(o) {
        return this.objects.indexOf(o);
    }
    registerPreApplyHook(obj, hook) {
        const id = this.getObjectId(obj);
        if (typeof id !== "undefined") {
            this.preApplyHooks[id] = hook;
        }
        else {
            throw new Error("no such object is registered to this actor");
        }
    }
    getPreApplyHook(objId) {
        return this.preApplyHooks[objId];
    }
    getFarRef(o) {
        let id = this.getObjectId(o);
        if (id === -1)
            id = this.registerObject(o);
        const fr = new FarReference(this.switchboard.getId(), this.getId(), id);
        return fr;
    }
    //    doExport(t: object, tt?: string) {
    //        const tag = t.constructor.name + "__" + (typeof tt === "string" ? tt : "");
    //        const fr  = this.getFarRef(t);
    //        this.notifyExport(tag, fr);
    //    }
    doExport(tag, t) {
        //const tag = t.constructor.name + "__" + (typeof tt === "string" ? tt : "");
        const fr = this.getFarRef(t);
        //console.log("adding far ref", this.id, fr);
        this.addExport(tag, fr);
    }
    //ctor: new (...args: any[]) => T
    whenDiscovered(tag, cb) {
        //const tag = ctor.name + "__";
        this.addSubscription(tag, fr => {
            //console.log("discovered", tag, fr.getNetworkId(), this.id);
            if (!(fr.actorId == this.getId() && fr.machineId == this.switchboard.getId()))
                cb(fr.clone().getProxyRef(this));
        });
    }
    deliverLocalMsg(msg, destination) {
        const id = destination.objectId;
        const obj = this.objects[id];
        if (typeof obj !== "undefined") {
            const preApplyHook = this.getPreApplyHook(id);
            let mayApply = true;
            if (typeof preApplyHook !== "undefined") {
                mayApply = preApplyHook(msg);
            }
            if (mayApply) {
                try {
                    const res = msg.apply(obj);
                    if (msg.future) {
                        msg.future.sendOneWayMessage(this, "resolve", res); // for results we only send a one way message, otherwise it'll we will be answering result messages ad inifitum 
                    }
                }
                catch (e) {
                    msg.future.sendOneWayMessage(this, "reject", e);
                }
            }
            else {
                msg.future.sendOneWayMessage(this, "reject", "rejected by pre-apply filter");
            }
            return true;
        }
        else {
            return false;
        }
    }
    getDesignationIdForDestination(destination) {
        return destination.actorId;
    }
}
//# sourceMappingURL=actor.js.map