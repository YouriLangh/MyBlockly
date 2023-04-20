"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRXT_RCB_Policy = void 0;
class CRXT_RCB_Policy {
    constructor() {
        this.allowAll = true;
        this.denyAll = false;
        this.allowDictionary = new Map();
    }
    allows(op) {
        if (this.denyAll)
            return false;
        else if (this.allowAll)
            return true;
        else if (this.allowDictionary.has(op))
            return this.allowDictionary.get(op);
        else
            return false; // deny by default
    }
    set(op, f) {
        this.allowDictionary.set(op, f);
    }
    setAllowAll(f) {
        this.allowAll = f;
    }
    setDenyAll(f) {
        this.denyAll = f;
    }
}
exports.CRXT_RCB_Policy = CRXT_RCB_Policy;
//# sourceMappingURL=crdt_rcb_policy.js.map