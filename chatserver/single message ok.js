let activeUsers = []; // Store active users and their socket IDs

io.on("connection", (socket) => {
  socket.on("user_connected", (userData) => {
    if (!activeUsers.find((user) => user.id === userData.id)) {
      activeUsers.push({ ...userData, socketId: socket.id });
    }
    // console.log("Active users: ", activeUsers.length);
    io.emit("active_users", activeUsers); // Send the updated active users to all clients
    // console.log(activeUsers);
  });

  // Listen for incoming messages and send to the specific receiver
  socket.on("send_message", async (messageData) => {
    const { receiverId, senderId } = messageData;
    // io.emit("active_users", activeUsers);
    // console.log(activeUsers);

    // Find the socketId of the receiver
    const receiver = activeUsers.find((user) => user.id === receiverId);
    const sender = activeUsers.find((user) => user.id === senderId);
    // console.log(receiver, sender, messageData);

    const data = await addMessages(messageData);

    if (sender) {
      io.to(sender.socketId).emit("receive_message", data);
      console.log("sender :", receiver.socketId);
    } else {
      console.log("Sender is not connected or not found");
    }
    if (receiver) {
      io.to(receiver.socketId).emit("receive_message", data);
      console.log("receiver :", receiver.socketId);
    } else {
      console.log("Receiver is not connected or not found");
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    // console.log("User disconnected:", socket.id);
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    io.emit("active_users", activeUsers); // Update all clients with active users
  });
});
