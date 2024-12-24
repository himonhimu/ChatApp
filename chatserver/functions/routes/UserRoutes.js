const express = require("express");
const UsersModels = require("../models/UsersModels");

const UserRouter = require("express").Router();

UserRouter.post("/add-user", UsersModels.addUser);
UserRouter.get("/get-users", UsersModels.getUsers);
UserRouter.get("/sign-in", UsersModels.signIn);

module.exports = UserRouter;
