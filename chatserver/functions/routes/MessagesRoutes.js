const express = require("express");
const MessagesModels = require("../models/MessagesModels");

const MessagesRouter = require("express").Router();

MessagesRouter.get("/get-messages", MessagesModels.getMessages);

module.exports = MessagesRouter;
