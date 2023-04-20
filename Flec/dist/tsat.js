class TSAT extends Switchboard {
    constructor(id) {
        super(id);
        this.actorMap = {};
        this.machineToChannelMap = {};
        this.actors = [];
        this.channels = [];
    }
    addChannel(channel) {
        this.channels.push(channel);
        channel.setReceiveCallback((msg, dst) => {
            dst.machineId = this.id;
            this.deliverMsg(msg, dst);
        });
        channel.setReceiveTagBroadbast((tag, ref) => {
            this.machineToChannelMap[ref.machineId] = channel;
            this.updateSubscriptions(tag, ref);
        });
    }
    registerActor(actor) {
        this.actors.push(actor);
        actor.setSwitchboard(this);
        this.actorMap[actor.getId()] = actor;
    }
    addExport(tag, ref) {
        super.addExport(tag, ref);
        this.updateSubscriptions(tag, ref);
    }
    /*
    this.actors.forEach(a => {
        if (a.subscriptions[tag])
            a.subscriptions[tag].forEach(s => s.callback(ref));
    });

    this.channels.forEach(c => {
        c.broadcastTag(tag, ref);
    });
}*/
    addSubscription(tag, cb) {
        super.addSubscription(tag, cb);
        this.updateSubscriptionsWithLocalExports(tag);
    }
    tick() {
        for (let tag in this.exports) {
            this.exports[tag].forEach(ref => {
                this.channels.forEach(chan => chan.broadcastTag(tag, ref));
                this.updateSubscriptions(tag, ref);
            });
        }
    }
    /*
    notifySubscribe(tag: string, cb: (fr : FarReference) => any) {
        super.notifySubscribe(tag, cb);

        this.actors.forEach(a => {
            if (a.exports[tag])
                a.exports[tag].forEach(ref => cb(ref));
        });*/
    /*
    let exports = this.exports[tag];
    if (exports)
        exports.forEach(r => cb(r));* /
}
*/
    getDesignationIdForDestination(destination) {
        return destination.machineId;
    }
    deliverLocalMsg(msg, destination) {
        const actor = this.actorMap[destination.actorId];
        if (typeof actor !== "undefined") {
            actor.deliverMsg(msg, destination);
            return true;
        }
        else {
            return false;
        }
    }
    // if the message fails to be delivered locally, try to see if it has to go to another machine
    undeliverableMsg(msg, destination) {
        const channel = this.machineToChannelMap[destination.machineId];
        if (typeof channel !== "undefined") {
            channel.sendMessage(msg, destination);
            return true;
        }
        else {
            return false;
        }
    }
}