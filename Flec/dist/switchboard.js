
class Switchboard {
    constructor(id) {
        this.exports = {};
        this.subscriptions = {};
        this.id = id;
        this.exports = {};
        this.subscriptions = {};
    }
    setSwitchboard(switchboard) {
        this.switchboard = switchboard;
    }
    getId() {
        return this.id;
    }
    addExport(tag, ref) {
        if (!this.exports[tag]) {
            this.exports[tag] = [];
        }
        this.exports[tag].push(ref);
        if (this.switchboard) {
            this.switchboard.addExport(tag, ref);
        }
    }
    addSubscription(tag, cb) {
        const subscription = {
            discovered: {},
            callback: null
        };
        if (!this.subscriptions[tag]) {
            this.subscriptions[tag] = [];
        }
        this.subscriptions[tag].push(subscription);
        subscription.callback = (fr) => {
            let nid = fr.getNetworkId();
            if (!subscription.discovered[nid]) {
                //console.log("SB : newly discovered ", tag, nid, this.getId());
                cb(fr);
                subscription.discovered[nid] = true;
            }
            else {
                //console.log("SB: already discovered " + tag, this.getId());
            }
        };
        if (this.switchboard) {
            this.switchboard.addSubscription(tag, subscription.callback);
        }
    }
    updateSubscriptions(tag, ref) {
        let subscriptions = this.subscriptions[tag];
        if (subscriptions) {
            subscriptions.forEach(s => s.callback(ref));
        }
    }
    updateSubscriptionsWithLocalExports(tag) {
        let exports = this.exports[tag];
        let subscriptions = this.subscriptions[tag];
        if (subscriptions && exports) {
            exports.forEach(e => subscriptions.forEach(s => s.callback(e)));
        }
    }
    deliverMsg(msg, destination) {
        if (this.getDesignationIdForDestination(destination) === this.id) {
            if (!this.deliverLocalMsg(msg, destination))
                this.undeliverableMsg(msg, destination);
        }
        else if (!!this.switchboard) {
            this.switchboard.deliverMsg(msg, destination);
        }
        else {
            this.undeliverableMsg(msg, destination);
        }
    }
    undeliverableMsg(msg, destination) {
        console.warn(`Dropping message with unknown destination!`);
    }
}
