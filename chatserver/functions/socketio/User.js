class User {
  constructor(id, name, email, socketId) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.socketId = socketId;
  }

  sendMessage(io, message) {
    io.to(this.socketId).emit("message", message);
    console.log(message);
  }

  receiveMessage(message) {
    console.log(`Received message for user ${this.id}:`, message);
  }
}

module.exports = User;
