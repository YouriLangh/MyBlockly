"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorClock = void 0;
class VectorClock {
    constructor(id) {
        this.id = id;
        this.hashmap = { [id]: 0 };
    }
    getId() {
        return this.id;
    }
    clockAt(id) {
        return this.hashmap[id] || 0;
    }
    processes() {
        return Object.keys(this.hashmap);
    }
    mergeProcesses(vc) {
        for (let p of vc.processes())
            this.touchProcess(p);
    }
    setClockAt(id, t) {
        this.hashmap[id] = t || 0;
    }
    addProcess(id, t) {
        this.hashmap[id] = t || 0;
    }
    touchProcess(id) {
        this.addProcess(id, this.clockAt(id));
    }
    localValue() {
        return this.clockAt(this.getId());
    }
    getUniqueId() {
        return this.id + ":" + this.localValue();
    }
    increment() {
        let local = this.localValue();
        this.setClockAt(this.id, local + 1);
    }
    merge(rclock) {
        rclock.processes().forEach(p => {
            const a = this.clockAt(p);
            const b = rclock.clockAt(p);
            this.setClockAt(p, Math.max(a, b));
        });
    }
    update(rclock) {
        this.increment();
        this.merge(rclock);
    }
    copy() {
        let c = new VectorClock(this.getId());
        this.processes().forEach(p => c.setClockAt(p, this.clockAt(p)));
        return c;
    }
    isConcurrent(rclock) {
        return !this.precedes(rclock) && !rclock.precedes(this);
    }
    // do we directly follow a certain clock? this is only the case if our local clock is one more, and no other clock is 
    followsDirectly_(rclock) {
        this.mergeProcesses(rclock);
        const f = rclock.clockAt(this.getId()) + 1 === this.localValue();
        console.log("ff", f, this.localValue(), rclock.clockAt(this.getId()));
        if (f) {
            for (let p of this.processes()) {
                const a = this.clockAt(p);
                const b = rclock.clockAt(p);
                if (p != this.getId() && a != b)
                    return false;
            }
        }
        return f;
    }
    precedesDirectly(rclock) {
        this.mergeProcesses(rclock);
        let cnt = 0;
        for (let p of this.processes()) {
            cnt += rclock.clockAt(p) - this.clockAt(p);
        }
        return cnt == 1;
    }
    hasPrecedingDependenciesFor(rclock) {
        this.mergeProcesses(rclock);
        let cnt = 0;
        for (let p of this.processes()) {
            // difference with precedesDirectly:
            // negative numbers indicate that some clocks may be in a further state, 
            // but all dependenies are satisfied
            // -> Math.min it to zero in that case
            cnt += Math.max(rclock.clockAt(p) - this.clockAt(p), 0);
        }
        return cnt == 1;
    }
    contains(rclock) {
        this.mergeProcesses(rclock);
        let cnt = 0;
        for (let p of this.processes()) {
            // difference with precedesDirectly:
            // negative numbers indicate that some clocks may be in a further state, 
            // but all dependenies are satisfied
            // -> Math.min it to zero in that case
            cnt += Math.max(rclock.clockAt(p) - this.clockAt(p), 0);
        }
        return cnt == 0;
    }
    precedes(rclock) {
        this.mergeProcesses(rclock);
        let pc = false;
        for (let p of this.processes()) {
            const a = this.clockAt(p);
            const b = rclock.clockAt(p);
            if (a < b)
                pc = true;
            else if (a > b)
                return false;
        }
        return pc;
    }
    toString() {
        return this.id + ":" + Object.values(this.hashmap).toString();
    }
}
exports.VectorClock = VectorClock;
//# sourceMappingURL=vc.js.map