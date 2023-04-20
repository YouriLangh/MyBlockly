"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistributedFS = void 0;
const simplecrdt_1 = require("../simplecrdt");
const immutablecrdt_1 = require("../immutablecrdt");
const rrwmap_1 = require("./maps/rrwmap");
const lwwregister_1 = require("./registers/lwwregister");
const ruwmap_1 = require("./maps/ruwmap");
const awset_1 = require("./sets/awset");
const FLAG_TRUE = true;
const FLAG_FALSE = false;
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
var AccessRightF;
(function (AccessRightF) {
    AccessRightF[AccessRightF["UNone"] = 0] = "UNone";
    AccessRightF[AccessRightF["UR"] = 2] = "UR";
    AccessRightF[AccessRightF["UW"] = 1] = "UW";
    AccessRightF[AccessRightF["URW"] = 3] = "URW";
    AccessRightF[AccessRightF["ANone"] = 4] = "ANone";
    AccessRightF[AccessRightF["AR"] = 6] = "AR";
    AccessRightF[AccessRightF["AW"] = 5] = "AW";
    AccessRightF[AccessRightF["ARW"] = 7] = "ARW";
})(AccessRightF || (AccessRightF = {}));
class DistributedFS extends simplecrdt_1.SimpleCRDT {
    getUID() {
        return this.id + ":::" + (this.counter++);
    }
    /////////////////
    // constructor //
    /////////////////
    constructor() {
        super();
        this.counter = 0;
        /////////////////
        // child CRDTs //
        /////////////////
        this.files = new rrwmap_1.RRWMap(t => new immutablecrdt_1.ImmutableCRDT({
            access_right_owner: new lwwregister_1.Register(),
            access_right_group: new lwwregister_1.Register(),
            access_right_other: new lwwregister_1.Register(),
            file_owner: new lwwregister_1.Register(),
            file_group: new lwwregister_1.Register(),
            file_data: new lwwregister_1.Register()
        }));
        this.groups = new rrwmap_1.RRWMap(t => new immutablecrdt_1.ImmutableCRDT({
            group_users: new awset_1.AWSet(),
            created: new lwwregister_1.Register()
        }));
        this.users = new ruwmap_1.RUWMap(t => new immutablecrdt_1.ImmutableCRDT({
            is_admin: new lwwregister_1.Register()
        }));
        this.setHandler();
    }
    onLoaded() {
        this.addChild("files", this.files);
        this.addChild("users", this.users);
        this.addChild("groups", this.groups);
    }
    _ChangeOG(userId, newOwnerId, fileId, key) {
        const user = this.users.lookup(userId);
        const file = this.files.lookup(fileId);
        if (user && file && user.is_admin.is(FLAG_TRUE)) {
            // file.file_owner.write(newOwnerId); TODO <- this would be ideal, but doesn't trigger an update on files
            this.files.update([{ key: fileId, op: "update" },
                { key: key, op: "write" }], newOwnerId);
        }
    }
    _ChangePermission(userId, newPermission, fileId, key) {
        const newP = AccessRight.fromEnum(newPermission);
        const user = this.users.lookup(userId);
        const file = this.files.lookup(fileId);
        if (!user || !file)
            return;
        if (user.is_admin.is(FLAG_TRUE) || (file.file_owner.is(userId) && !newP.admin)) {
            this.files.update([{ key: fileId, op: "update" },
                { key: key, op: "write" }], newPermission);
        }
    }
    setHandler() {
        const me = this;
        this.handler = {
            ChangeOwner(userId, newOwnerId, fileId) {
                me._ChangeOG(userId, newOwnerId, fileId, "file_owner");
            },
            ChangeGroup(userId, newGroupId, fileId) {
                me._ChangeOG(userId, newGroupId, fileId, "file_group");
            },
            ChangeOwnerPermission(userId, newPermission, fileId) {
                me._ChangePermission(userId, newPermission, fileId, "access_right_owner");
            },
            ChangeGroupPermission(userId, newPermission, fileId) {
                me._ChangePermission(userId, newPermission, fileId, "access_right_group");
            },
            ChangeOtherPermission(userId, newPermission, fileId) {
                me._ChangePermission(userId, newPermission, fileId, "access_right_other");
            },
            CreateFile(userId, groupId, fileId) {
                const user = me.users.lookup(userId);
                const group = me.groups.lookup(groupId);
                if (group && user && group.group_users.contains(userId)) {
                    //console.log("adding file");
                    //const fileId = me.getUID(); //todo fix
                    me.files.update([{ key: fileId, op: "update" },
                        { key: "file_owner", op: "write" }], userId);
                    me.files.update([{ key: fileId, op: "update" },
                        { key: "file_group", op: "write" }], groupId);
                    const isAdmin = user.is_admin.is(FLAG_TRUE);
                    const access_owner = new AccessRight(isAdmin, true, true);
                    const access_group = new AccessRight(isAdmin, true, false);
                    const access_other = new AccessRight(isAdmin, true, false);
                    me.files.update([{ key: fileId, op: "update" },
                        { key: "access_right_owner", op: "write" }], access_owner.toEnum());
                    me.files.update([{ key: fileId, op: "update" },
                        { key: "access_right_group", op: "write" }], access_group.toEnum());
                    me.files.update([{ key: fileId, op: "update" },
                        { key: "access_right_other", op: "write" }], access_other.toEnum());
                }
            },
            WriteFile(userId, fileId) {
                const user = me.users.lookup(userId);
                const file = me.files.lookup(fileId);
                //console.warn("writing file", !!user, !!file);
                if (user && file) {
                    // CHECK FOR ADMIN
                    let has_permissions = user.is_admin.is(FLAG_TRUE);
                    // CHECK FOR OWNER
                    has_permissions || (has_permissions = file.file_owner.is(userId) && AccessRight.fromEnum(file.access_rights_owner.getValue()).write);
                    // CHECK FOR GROUP
                    if (!has_permissions) {
                        const groupId = file.file_group.getValue();
                        const group = me.groups.lookup(groupId);
                        has_permissions || (has_permissions = group.contains(userId) && AccessRight.fromEnum(file.access_rights_group.getValue()).write);
                    }
                    // CHECK FOR OTHER
                    has_permissions || (has_permissions = AccessRight.fromEnum(file.access_rights_other.getValue()).write);
                    // WRITE IF PERMISSIONS OK
                    if (has_permissions) {
                        me.files.update([{ key: fileId, op: "update" },
                            { key: "file_data", op: "write" }], userId);
                    }
                    else {
                        console.warn("Ignoring write due to permission error");
                    }
                }
            },
            DeleteFile(userId, fileId) {
                const user = me.users.lookup(userId);
                const file = me.files.lookup(fileId);
                if (user && file) {
                    // CHECK FOR ADMIN
                    let has_permissions = user.is_admin.is(FLAG_TRUE);
                    // CHECK FOR OWNER
                    has_permissions || (has_permissions = file.file_owner.is(userId) && AccessRight.fromEnum(file.access_rights_owner.getValue()).write);
                    // CHECK FOR GROUP
                    if (!has_permissions) {
                        const groupId = file.file_group.getValue();
                        const group = me.groups.lookup(groupId);
                        has_permissions || (has_permissions = group.contains(userId) && AccessRight.fromEnum(file.access_rights_group.getValue()).write);
                    }
                    // CHECK FOR OTHER
                    has_permissions || (has_permissions = AccessRight.fromEnum(file.access_rights_other.getValue()).write);
                    // WRITE IF PERMISSIONS OK
                    if (has_permissions) {
                        me.files.delete(fileId);
                    }
                    else {
                        console.warn("Ignoring delete due to permission error");
                    }
                }
            },
            CreateUser(with_admin_rights, id) {
                me.users.update([{ key: id, op: "update" }, { key: "is_admin", op: "write" }], with_admin_rights);
            },
            CreateGroup() {
                // nada
            },
            AssignUserToGroup(authorId, groupId, userId) {
                const author = me.users.lookup(authorId);
                const user = me.users.lookup(userId);
                const group = me.groups.lookup(groupId);
                if (author && author.is_admin.is(FLAG_TRUE) && user) {
                    me.groups.update([{ key: groupId, op: "update" },
                        { key: "group_users", op: "add" }], userId);
                }
            },
            update(key) {
            }
        };
    }
    CreateUser(with_admin_rights) {
        const id = this.getUID();
        this.performOp("CreateUser", [with_admin_rights, id]);
        return id;
    }
    ;
    CreateGroup() {
        const id = this.getUID();
        this.performNestedOp("update", [{ key: "groups", op: "update" },
            { key: id, op: "update" },
            { key: "created", op: "write" }], [FLAG_TRUE]);
        return id;
    }
    ;
    CreateFile(userId, groupId) {
        const id = this.getUID();
        this.performOp("CreateFile", [userId, groupId, id]);
        return id;
    }
    test() {
        const userId = this.CreateUser(true);
        const groupId = this.CreateGroup();
        this.performOp("AssignUserToGroup", [userId, groupId, userId]);
        const fileId = this.CreateFile(userId, groupId);
        this.performOp("WriteFile", [userId, fileId]);
    }
    test_init() {
        const { userId, groupId } = this.test_create();
        this.test_write(userId, groupId);
        //console.log(this.doc);
        return { userId: userId, groupId: groupId };
    }
    test_create() {
        const userId = this.CreateUser(true);
        const groupId = this.CreateGroup();
        this.handler.AssignUserToGroup(userId, groupId, userId);
        return { userId: userId, groupId: groupId };
    }
    test_write(userId, groupId) {
        const fileId = this.CreateFile(userId, groupId);
        this.handler.WriteFile(userId, fileId);
    }
}
exports.DistributedFS = DistributedFS;
//# sourceMappingURL=dfs.js.map