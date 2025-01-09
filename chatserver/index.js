const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const { createServer } = require("node:http");
const configureSocket = require("./functions/socketio/socketHandler");
const UserRouter = require("./functions/routes/UserRoutes");
const MessagesRouter = require("./functions/routes/MessagesRoutes");
const GroupRoutes = require("./functions/routes/GroupRoutes");

// Load the port from environment variables or use a default
const port = process.env.PORT || 6016;

const app = express();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json({ limit: "50mb" }));
app.use(cors());

// Create an HTTP server
const server = createServer(app);

// here is the socket configure file and options
configureSocket(server);

// Start the server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// app.get("/map", (req, res) => {
//   res.send(SocketIdToUserId);
// });

app.use("/user", UserRouter);
app.use("/messages", MessagesRouter);
app.use("/group", GroupRoutes);
