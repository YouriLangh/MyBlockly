"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiAMap = exports.AMap = exports.AccessRight = void 0;
const multipureopcrdt_1 = require("../multipureopcrdt");
const ruwmap_1 = require("./maps/ruwmap");
const lwwregister_1 = require("./registers/lwwregister");
var Permission;
(function (Permission) {
    Permission[Permission["Read"] = 0] = "Read";
    Permission[Permission["Write"] = 1] = "Write";
    Permission[Permission["Execute"] = 2] = "Execute";
})(Permission || (Permission = {}));
class AccessRight {
    constructor(admin, read, write) {
        this.admin = admin;
        this.read = read;
        this.write = write;
    }
    static fromEnum(v) {
        return new AccessRight((v & 0b100) > 0, (v & 0b010) > 0, (v & 0b001) > 0);
    }
    toEnum() {
        return ((this.admin ? 0b100 : 0) | (this.read ? 0b010 : 0) | (this.write ? 0b001 : 0));
    }
}
exports.AccessRight = AccessRight;
var AccessRightInt;
(function (AccessRightInt) {
    AccessRightInt[AccessRightInt["UNone"] = 0] = "UNone";
    AccessRightInt[AccessRightInt["UR"] = 2] = "UR";
    AccessRightInt[AccessRightInt["UW"] = 1] = "UW";
    AccessRightInt[AccessRightInt["URW"] = 3] = "URW";
    AccessRightInt[AccessRightInt["ANone"] = 4] = "ANone";
    AccessRightInt[AccessRightInt["AR"] = 6] = "AR";
    AccessRightInt[AccessRightInt["AW"] = 5] = "AW";
    AccessRightInt[AccessRightInt["ARW"] = 7] = "ARW";
})(AccessRightInt || (AccessRightInt = {}));
class AMap extends ruwmap_1.RUWMap {
    constructor() {
        super(() => new lwwregister_1.Register());
    }
    set(key, ar) {
        let val = ar.toEnum();
        this.update([{ key: key, op: "write" }], val);
    }
    get(key) {
        let f = this.lookup(key).getValue();
        return AccessRight.fromEnum(f);
    }
}
exports.AMap = AMap;
class MultiAMap extends multipureopcrdt_1.MultiPureOpCRDT {
    makeChild() {
        return new AMap();
    }
    set(key, ar) {
        let val = ar.toEnum();
        this.update([{ key: key, op: "write" }], val);
    }
    get(key) {
        let f = this.lookup(key).getValue();
        return AccessRight.fromEnum(f);
    }
}
exports.MultiAMap = MultiAMap;
//# sourceMappingURL=amap.js.map