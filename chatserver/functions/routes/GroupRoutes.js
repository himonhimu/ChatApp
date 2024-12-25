const express = require("express");
const GroupModels = require("../models/GroupModels");

const GroupRoutes = require("express").Router();

GroupRoutes.post("/add-group", GroupModels.addGroup);
GroupRoutes.get("/get-groups", GroupModels.getGroups);
GroupRoutes.post("/add-groupmember", GroupModels.addGroupMember);
GroupRoutes.get("/get-groupmembers", GroupModels.getGroupMembers);
GroupRoutes.delete("/delete-groupmembers/:id", GroupModels.deleteGroupMember);

module.exports = GroupRoutes;
