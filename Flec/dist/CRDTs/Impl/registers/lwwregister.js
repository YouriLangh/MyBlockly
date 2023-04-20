"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Register = void 0;
const PureOpCRDT_1 = require("../../PureOpCRDT");
class Register extends PureOpCRDT_1.PureOpCRDT {
    isPrecedingOperationRedundant(existing, arriving, isRedundant) {
        return true;
    }
    isConcurrentOperationRedundant(existing, arriving, isRedundant) {
        return existing.getOrigin() < arriving.getOrigin();
    }
    isArrivingOperationRedundant(arriving) {
        const log = this.getLog();
        const value = log[0];
        if (value) {
            return arriving.getOrigin() < value.getOrigin();
        }
        else {
            return false;
        }
    }
    getValue() {
        var _a;
        return (_a = this.getLog()[0]) === null || _a === void 0 ? void 0 : _a.args[0];
    }
    write(value) {
        this.perform.write(value);
    }
    is(v) {
        return v === this.getValue();
    }
    serialize() {
        return this.getValue();
    }
}
exports.Register = Register;
//# sourceMappingURL=lwwregister.js.map