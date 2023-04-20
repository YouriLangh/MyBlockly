"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*

const PRIORITY_BASED_ON_NODE = -1;
type OperationMetaData = any;

function index(...args) {

}

function ConcurrentPriority(...args) {
    return (...args)=>{};
}
function ConcurrencySemantics(...args) {
    return (...args)=>{};
}

function mutator(...args) {

}

function RedundantOnArrival(a,b) {
}
function ClearPrevious(a,b) {
}

function ClearPreviousIndexed(a,b) {
}

function ClearIndexed(a,b) {
}

function MakesPreviousRedundant(a) {
    return (...args)=>{};
}

function stable(a,b) {

}

class SeqSet implements SetOperations {
    set: Set<string>;

    constructor() {
        this.set = new Set<string>();
    }

    add(x)    { this.set.add(x);    }
    remove(x) { this.set.delete(x); }
    clear()   { this.set.clear();   }
}


class PureCRDT<T> {
    ds: T;
}


// AW
class PureAWSetPriority extends PureCRDT<SetOperations> {
    constructor() {
        super();
    }

    @ConcurrentPriority(2)                                // priority is used for concurrent operations to determine order
    add(set: SetOperations, @index element: string) {     // if an index is specified, concurrent priority is scoped to elements with index
        set.add(element);
    }
    
    @ConcurrentPriority(1)
    remove(set: SetOperations, @index element: string) {
        set.remove(element);
    }

    @ConcurrentPriority(1)
    clear(set: SetOperations) {
        set.clear();
    }

}

// RW
class PureRWSetPriority extends PureCRDT<SetOperations> {
    constructor() {
        super();
    }

    @ConcurrentPriority(1)
    add(set: SetOperations, @index element: string) {
        set.add(element);
    }
    
    @ConcurrentPriority(2)
    remove(set: SetOperations, @index element: string) {
        set.remove(element);
    }

    @ConcurrentPriority(2)
    clear(set: SetOperations) {
        set.clear();
    }

}

interface RegisterOperations {
    set(element: string);
}

// LWW
class PureLWWRegisterPriority extends PureCRDT<RegisterOperations> {
    constructor() {
        super();
    }

    @ConcurrentPriority(PRIORITY_BASED_ON_NODE)
    set(reg: RegisterOperations, element: string) {
        reg.set(element)
    }
}

//MVR

class PureMVRegPriority extends PureCRDT<SetOperations> {
    constructor() {
        super();
    }

    @ConcurrencySemantics(PureMVRegPriority.cset);
    set(reg: SetOperations, element: string) {
        reg.clear();
        reg.add(element)
    }

    cset(reg: SetOperations, element: string) {
        reg.add(element);
    }

}





class PureAWSetM extends PureCRDT<SetOperations> {
    constructor() {
        super();
    }

    @ConcurrentPriority(2)                                // priority is used for concurrent operations to determine order
    add(set: SetOperations, @index element: string) {     // if an index is specified, concurrent priority is scoped to elements with index
        set.add(element);
    }
    
    @ConcurrentPriority(1)
    remove(set: SetOperations, @index element: string) {
        set.remove(element);
    }

    @ConcurrentPriority(1)
    clear(set: SetOperations) {
        set.clear();
    }

    getOperationScope(operation: OperationMetaData) {
        return operation.authinfo.userLevel;
    }
}





class PureAWSetx extends PureCRDT<SetOperations> {
    constructor() {
        super();
    }

    @ClearPreviousIndexed
    add(set: SetOperations, @index element: string) {
        set.add(element);
    }
    
    @ClearPreviousIndexed
    @RedundantOnArrival
    remove(set: SetOperations, @index element: string) {
        set.remove(element);
    }

    @ClearPrevious
    @RedundantOnArrival
    clear(set: SetOperations) {
        set.clear();
    }
}

let x : PureAWSet = <PureAWSet>{};

enum ConcurrencyRule {
    INSIGNIFICANT,
    I_WIN,
    
}


class PureAWSet extends PureCRDT<SetOperations> {

    create() {
        return new Set();
    }

    @mutator
    @invalidatesPreviousIndexed
    @concurrent(ConcurrencyRule.INSIGNIFICANT)
    add(set: SetOperations, @index element: string) {
        set.add(element);
    }
    
    @mutator
    @redundant
    @invalidatesPreviousIndexed
    remove(set: SetOperations, @index element: string) {
        set.remove(element);
    }

    @mutator
    @redundant
    @invalidatesPrevious
    clear(set: SetOperations) {
        set.clear();
    }
}

/*
const PROXY_IS_PREFIX = "is";

class EntryProxy<T> implements ProxyHandler<Entry<T>> {
    
    get(target: Entry<T>, p: string | symbol, receiver: any): any {

        if (typeof p == "string" && p.indexOf(PROXY_IS_PREFIX) == 0) {
            return () : boolean => {
                const operation = p.substr(PROXY_IS_PREFIX.length) as keyof T;
                return target.is(operation);
            }
        }

        return Reflect.get(target, p, receiver);
    }
}


type DynamicEntry<T> = {
    [op in keyof T as `is${Capitalize<string & op>}`]: () => boolean;
} & Entry<T> & {
    new<T> (k: keyof T, a: {}):DynamicEntry<T>
};

///*
class Entry<T> {
    key: keyof T;
    args: {};

    constructor(k: keyof T, a: {}) {
        this.key = k;
        this.args = a;

        return new Proxy(this, new EntryProxy<T>());
    }

    is(x: keyof T): x is keyof T {
        return x === this.key;
    }

    static create<T>(k: keyof T, a: {}) : DynamicEntry<T> {
        return new this<T>(k, a) as DynamicEntry<T>;
    }
}

const dEntry = Entry as unknown as DynamicEntry<void>;

const x = new dEntry<DSOperations>("Add", {element: "hello"});

    //const x = { replicater:{} } as { replicater: DSOperations }
    //x.replicater.Add("tgg");
    //x.replicater.Remove("lalala");

const e = Entry.create<DSOperations>("Add", {element: "hello"});


console.log("isAdd", e.isAdd());
console.log("isRemove", e.isRemove());

*/ 
//# sourceMappingURL=set_operations.js.map