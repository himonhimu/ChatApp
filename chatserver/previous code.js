const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const UserRouter = require("./functions/routes/UserRoutes");
const { addMessages } = require("./functions/models/MessagesModels");
const MessagesRouter = require("./functions/routes/MessagesRoutes");
const GroupRoutes = require("./functions/routes/GroupRoutes");
const port = process.env.PORT;

const app = express();
const prisma = require("./prisma");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json({ limit: "50mb" }));

app.use(cors());
const server = createServer(app);
const allowedOrigins = [
  "http://localhost:6015", // Local development origin
  "http://192.168.10.8:6015", // LAN development origin
  // "https://your-production-domain.com", // Production domain
];

// const io = new Server(server, {
//   cors: {
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true); // Allow request
//       } else {
//         callback(new Error("Origin not allowed by CORS")); // Block request
//       }
//     },
//     methods: ["GET", "POST"], // Allowed HTTP methods
//     credentials: true, // Allow credentials
//   },
// });
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

// app.get("/hello", (req, res) => {
//   res.send({ data: userArray });
// });

// here socket message start

let activeUsers = []; // Store active users and their socket IDs

io.on("connection", (socket) => {
  // Handle a user connecting
  socket.on("user_connected", (userData) => {
    // Add the user if they are not already in the activeUsers list
    if (!activeUsers.find((user) => user.id === userData.id)) {
      activeUsers.push({ ...userData, socketId: socket.id });
    }
    // Emit the updated list of active users to all clients
    io.emit("active_users", activeUsers);
    // console.log("Active users:", activeUsers.length, activeUsers);
  });

  // Listen for incoming messages and send to the specific receiver (individual or group)
  socket.on("send_message", async (messageData) => {
    const { receiverId, senderId, isGroup } = messageData;

    // Handle group messaging
    if (isGroup) {
      const group = await prisma.messagegroup.findUnique({
        where: { id: receiverId }, // Group ID
        include: { GroupMember: true }, // Include group members
      });

      if (!group) {
        console.log("Group not found");
        return;
      }

      const data = await addMessages(messageData); // Save the message to the database

      // Send the message to all group members who are online
      group.GroupMember.forEach((member) => {
        const receiver = activeUsers.find(
          (user) => user.id === member.memberid
        );
        if (receiver) {
          // Send the message to the member's socketId
          io.to(receiver.socketId).emit("receive_message", data);
        }
      });

      // console.log(`Message sent to group: ${group.groupname}`);
    }
    // Handle individual messaging (if needed)
    else {
      const receiver = activeUsers.find((user) => user.id === receiverId);
      const sender = activeUsers.find((user) => user.id === senderId);

      const data = await addMessages(messageData); // Save the message

      // Send the message to the sender
      if (sender) {
        io.to(sender.socketId).emit("receive_message", data);
      } else {
        console.log("Sender is not connected or not found");
      }

      // Send the message to the receiver
      if (receiver) {
        io.to(receiver.socketId).emit("receive_message", data);
      } else {
        console.log("Receiver is not connected or not found");
      }
    }
  });

  // call send
  socket.on("call:send", (data) => {
    // console.log(data);
    const { from, fromuserid, touserid, offer } = data;
    console.log(from, fromuserid, touserid);
    const fromuser = activeUsers.find((fitem) => fitem.id === fromuserid);
    const touser = activeUsers.find((fitem) => fitem.id === touserid);
    console.log(offer);
    // io.emit("active_users", activeUsers);
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    // Remove the user from the active users list upon disconnect
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    // Emit the updated active users list to all clients
    io.emit("active_users", activeUsers);
    // console.log("User disconnected, active users:", activeUsers.length);
  });
});

//here socket msg end

server.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});

app.use("/user", UserRouter);
app.use("/messages", MessagesRouter);
app.use("/group", GroupRoutes);
