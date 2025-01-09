const { Server } = require("socket.io");
const User = require("./User");
const MessageHandler = require("./MessageHandler");

const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Allow all origins (for testing purposes)
      methods: ["GET", "POST"],
    },
  });

  const users = new Map();
  const messageHandler = new MessageHandler(io, users);

  io.on("connection", (socket) => {
    // console.log(`Client connected: ${socket.id}`);

    // Handle user connection
    socket.on("user_connected", (data) => {
      // console.log("user_connected", data);

      const user = new User(data.id, data.name, data.email, socket.id);
      users.set(socket.id, user);

      // Convert users map to an array
      const activeUsers = Array.from(users.values());

      // Emit the active users array
      io.emit("active_users", activeUsers);
    });

    // Handle sending messages
    socket.on("send_message", (messageData) => {
      messageHandler.handleSendMessage(socket, messageData);
    });

    socket.on("incomming:call", (data) => {
      const { to, offer } = data;
      const receiver = Array.from(users.values()).find(
        (user) => user.email === to
      );
      io.to(receiver.socketId).emit("incomming:call", {
        from: to,
        offer,
      });
    });

    socket.on("call:accepted", (data) => {
      const { to, ans } = data;
      const receiver = Array.from(users.values()).find(
        (user) => user.email === to
      );

      io.to(receiver.socketId).emit("call:accepted", {
        from: socket.id,
        ans,
        fromuserid: to,
      });
    });

    socket.on("peer:nego:needed", (data) => {
      const { to, offer } = data;
      const receiver = Array.from(users.values()).find(
        (user) => user.email === to
      );

      io.to(receiver.socketId).emit("peer:nego:needed", {
        from: to,
        offer,
      });
    });

    socket.on("peer:nego:done", (data) => {
      const { to, ans } = data;
      const receiver = Array.from(users.values()).find(
        (user) => user.email === to
      );
      io.to(receiver.socketId).emit("peer:nego:final", {
        from: socket.id,
        ans,
        fromuserid: to,
      });
    });

    // Handle client disconnection
    socket.on("disconnect", () => {
      // console.log(`Client disconnected: ${socket.id}`);
      users.delete(socket.id);

      // Convert users map to an array
      const activeUsers = Array.from(users.values());

      // Emit the updated active users array
      io.emit("active_users", activeUsers);
    });
  });
};

module.exports = configureSocket;
