"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RegisterOperation;
(function (RegisterOperation) {
    RegisterOperation[RegisterOperation["Read"] = 0] = "Read";
    RegisterOperation[RegisterOperation["Write"] = 1] = "Write";
    RegisterOperation[RegisterOperation["Clear"] = 2] = "Clear";
})(RegisterOperation || (RegisterOperation = {}));
/*
export class MVRegisterS extends CRDT<RegisterOperation> {

    register : Map<string, VectorClock>;
    clear_register: VectorClock[];

    clock: VectorClock;

    constructor(tag, callback) {
        super(tag);
        this.callback = callback;
        this.register = new Map<string, VectorClock>();
        this.clear_register = [];

        this.exportedOperations = {
            [RegisterOperation.Write]: (set, args) => {
                const el    = args[0];
                const clock : VectorClock = args[1];
                this.clock.merge(clock);

                let old = false;

                for (let item in this.register) {
                    const item_clock : VectorClock = this.register[item]
                    if (item_clock.precedes(clock))
                        delete this.register[item];
                    else if (clock.precedes(item_clock))
                        old = old || true;
                }

                for (let i=this.clear_register.length-1; i>=0; i++) {
                    const clear_clock : VectorClock = this.clear_register[i];
                    if(clock.precedes(clear_clock))
                        old = old || true;
                }

                if (!old)
                    this.register[el] = clock.copy();
            },

            [RegisterOperation.Clear]: (set, args) => {
                const clock = args[0];
                this.clock.merge(clock);

                for (let item in this.register) {
                    const item_clock : VectorClock = this.register[item]
                    if (item_clock.precedes(clock))
                        delete this.register[item];
                }

                // cleanup clears
                for (let i=this.clear_register.length-1; i>=0; i++) {
                    const clear_clock : VectorClock = this.clear_register[i];
                    if (clear_clock.precedes(clock)){
                        this.clear_register.splice(i,1);
                    }
                }
            }
        }
    }

    onLoaded() {
        this.clock = new VectorClock(this.id);
    }

    public read() {
        const list = [];
        for (let el in this.register) {
            list.push(el);
        }
        return list;
    }

    public write(element) {
        this.clock.increment();
        this.performOp(RegisterOperation.Write, [element, this.clock.copy()]);
    }

    public clear() {
        this.clock.increment();
        this.performOp(RegisterOperation.Clear, [this.clock.copy()]);
    }


}
*/ 
//# sourceMappingURL=mvreg.js.map