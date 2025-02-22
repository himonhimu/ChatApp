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
  const emailToSocketIdMap = new Map();
  const socketidToEmailMap = new Map();
  io.on("connection", (socket) => {
    socket.on("user_connected", (data) => {
      const user = new User(data.id, data.name, data.email, socket.id);
      users.set(socket.id, user);
      const activeUsers = Array.from(users.values());
      io.emit("active_users", activeUsers);
    });

    socket.on("send_message", (messageData) => {
      messageHandler.handleSendMessage(socket, messageData);
    });

    // socket.on("room:join", (data) => {
    //   const { email, room } = data;
    //   emailToSocketIdMap.set(email, socket.id);
    //   socketidToEmailMap.set(socket.id, email);
    //   socket.join(room);
    //   io.to(room).emit("user:joined", { email, id: socket.id });
    //   io.to(socket.id).emit("room:join", data);
    // });

    socket.on("room:join", (data) => {
      const { email, room } = data;

      // Map email and socket ID
      emailToSocketIdMap.set(email, socket.id);
      socketidToEmailMap.set(socket.id, email);

      // Join the room
      socket.join(room);

      // Notify all users in the room, including the new user
      io.to(room).emit("user:joined", { email, id: socket.id });

      // Optionally send additional data to the newly joined user
      socket.emit("room:join", data);
    });

    socket.on("user:call", ({ to, offer }) => {
      io.to(to).emit("incomming:call", { from: socket.id, offer });
    });
    socket.on("call:accepted", ({ to, ans }) => {
      io.to(to).emit("call:accepted", { from: socket.id, ans });
    });

    socket.on("peer:nego:needed", ({ to, offer }) => {
      io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
    });
    socket.on("peer:nego:done", ({ to, ans }) => {
      io.to(to).emit("peer:nego:final", { from: socket.id, ans });
    });
    socket.on("call:receive", ({ to }) => {
      io.to(to).emit("call:receive", { from: socket.id });
    });

    socket.on("call:end", ({ to }) => {
      io.to(to).emit("call:end", { from: socket.id });
      io.to(socket.id).emit("call:end", { from: to });
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
