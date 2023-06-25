class setOperation{
    constructor(){
        this.Add = 0;
        this.Clear = 1;
        this.Remove = 2;
    }
}
const SetOperation = new setOperation();
class ORSet extends CRDT {
    constructor(tag, callback) {
        super(tag);
        this.set = {};
        this.removed = {};
        this.callback = callback;
        this.exportedOperations = {
            [SetOperation.Add]: (set, args) => {
                const el = args[0];
                const id = args[1];
                if (!this.set[el])
                    this.set[el] = { ids: {}, count: 0 };
                if (!this.removed[id]) {
                    this.set[el].ids[id] = true;
                    this.set[el].count++;
                }
                //this.callback(this);
            },
            [SetOperation.Remove]: (set, args) => {
                //console.log(this.id, "remove", args)
                const el = args[0];
                const ids = args[1];
                const sel = this.set[el];
                for (let i = 0; i < ids.length; i++) {
                    const id = ids[i];
                    this.removed[id] = true;
                    if (sel) {
                        delete sel.ids[id];
                        if (--sel.count == 0)
                            delete this.set[el];
                    }
                }
                //this.callback(this);
            }
        };
    }
    toList() {
        const list = [];
        for (let el in this.set) {
            list.push(el);
        }
        return list;
    }
    add(element) {
        const id = this.getUniqueId();
        this.performOp(SetOperation.Add, [element, id]);
    }
    remove(element) {
        const el = this.set[element];
        if (el)
            this.performOp(SetOperation.Remove, [element, Object.keys(el.ids)]);
    }
}
//# sourceMappingURL=orset2.js.map