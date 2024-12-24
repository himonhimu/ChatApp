const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const UserRouter = require("./functions/routes/UserRoutes");
const { addMessages } = require("./functions/models/MessagesModels");
const port = process.env.PORT;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json({ limit: "50mb" }));

app.use(cors());
const server = createServer(app);
const allowedOrigins = [
  "http://localhost:6015", // Local development origin
  "http://192.168.10.8:6015", // LAN development origin
  // "https://your-production-domain.com", // Production domain
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // Allow request
      } else {
        callback(new Error("Origin not allowed by CORS")); // Block request
      }
    },
    methods: ["GET", "POST"], // Allowed HTTP methods
    credentials: true, // Allow credentials
  },
});
app.get("/", (req, res) => {
  res.send("Server is running");
});

// app.get("/hello", (req, res) => {
//   res.send({ data: userArray });
// });

let activeUsers = []; // Store active users and their socket IDs

io.on("connection", (socket) => {
  console.log("User connected: ", socket.id);

  // Handle user connection (add to activeUsers array)
  socket.on("user_connected", (userData) => {
    if (!activeUsers.find((user) => user.id === userData.id)) {
      activeUsers.push({ ...userData, socketId: socket.id });
    }
    console.log("Active users: ", activeUsers);
    io.emit("active_users", activeUsers); // Send the updated active users to all clients
  });

  // Listen for incoming messages and send to the specific receiver
  socket.on("send_message", (messageData) => {
    const { receiverId, senderId } = messageData;

    // Find the socketId of the receiver
    const receiver = activeUsers.find((user) => user.id === receiverId);
    console.log("reciver", receiver);

    if (receiver) {
      // Emit message only to the receiver using their socket ID
      io.to(receiver.socketId).emit("receive_message", messageData);
      // io.emit("receive_message", messageData);
      // console.log("Message sent to:", receiver.socketId);
    } else {
      console.log("Receiver is not connected or not found");
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    io.emit("active_users", activeUsers); // Update all clients with active users
  });
});

server.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});

app.use("/user", UserRouter);
