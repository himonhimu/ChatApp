const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

// Load the port from environment variables or use a default
const port = process.env.PORT || 6016;

const app = express();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json({ limit: "50mb" }));
app.use(cors());

// Create an HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (for testing purposes)
    methods: ["GET", "POST"],
  },
});

// Simple HTTP route for testing
app.get("/", (req, res) => {
  res.send("Server is running");
});

const UseridToSocketId = new Map();
const SocketIdToUserId = new Map();

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  SocketIdToUserId.set();

  // Example: Handle a custom event
  socket.on("message", (data) => {
    console.log(`Received message from ${socket.id}:`, data);
    socket.emit("response", `Server received: ${data}`); // Respond to the client
  });

  socket.on("rcv_message", (data) => {
    io.emit("message", data);
  });
  // Handle client disconnection
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.get("/map", (req, res) => {
  res.send("Server is running");
});
