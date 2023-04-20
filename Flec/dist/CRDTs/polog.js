"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POLog = void 0;
const graphology_1 = require("graphology");
class POLog {
    constructor() {
        this.dag = new graphology_1.default({ allowSelfLoops: false });
        this.dag.addNode('root');
        this.nodes = {};
    }
    findPrecedingParent(clock) {
        let parentClock = false;
        let parents = Object.values(this.nodes);
        do {
            for (let p = 0; p < parents.length; p++) {
                let n_clock = this.dag.getNodeAttributes(parents[p]).clock;
                if (n_clock.hasPrecedingDependenciesFor(clock)) {
                    parentClock = n_clock;
                    parents = this.dag.inNeighbors(parentClock.toString());
                    break;
                }
            }
        } while (parentClock && !parentClock.precedes(clock));
        if (!parentClock)
            return "root";
        else
            return parentClock.toString();
    }
    add(item) {
        const clock = item.clock;
        const sclock = clock.toString();
        const parent = this.findPrecedingParent(clock);
        const node = this.dag.addNode(sclock, item);
        this.dag.addEdge(parent, node);
        this.nodes[clock.id] = sclock;
    }
    remove(idx) {
        throw new Error("Method not implemented.");
    }
    removeLazy(idx) {
        throw new Error("Method not implemented.");
    }
    force() {
        throw new Error("Method not implemented.");
    }
    toArray() {
        throw new Error("Method not implemented.");
    }
    [Symbol.iterator]() {
        throw new Error("Method not implemented.");
    }
}
exports.POLog = POLog;
//# sourceMappingURL=polog.js.map