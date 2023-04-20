"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
enum RegisterOperation {
    Read, Write, Clear
}
type RegisterEntry = POLogEntry<RegisterOperation>;

export class MVRegister extends PureOpCRDT<RegisterOperation> {
    
    constructor(tag, callback) {
        super(tag);
        this.callback = callback;
    }

    protected setEntryStable(entry: RegisterEntry) :boolean {
        //this.compact[entry.args[0]] = true;
        return false;
    }
    protected removeEntry(entry: RegisterEntry) {
        //delete this.compact[entry.args[0]];
    }

    protected isRedundantByOperation(existing: RegisterEntry, new_: RegisterEntry, isRedundant: boolean): boolean {
        return existing.precedes(new_);
    }
    protected isArrivingOperationRedundant(entry: RegisterEntry): boolean {
        return entry.is(RegisterOperation.Clear)
    }

    public read(){
        let list = {...this.compact};
        this.log.forEach(entry => list[entry.args[0]] = true);
        return Object.keys(list);
    }

    public write(element) {
        this.performOp(RegisterOperation.Write, [element]);
    }

    public clear() {
        this.performOp(RegisterOperation.Clear,  []);
    }

}*/ 
//# sourceMappingURL=mvregister.js.map