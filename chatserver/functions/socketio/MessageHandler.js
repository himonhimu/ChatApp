const { PrismaClient } = require("@prisma/client"); // Assuming you are using Prisma for database operations
const { addMessages } = require("../models/MessagesModels");

const prisma = new PrismaClient();

class MessageHandler {
  constructor(io, users) {
    this.io = io;
    this.users = users;
  }

  async handleSendMessage(socket, messageData) {
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
      const sender = Array.from(this.users.values()).find(
        (user) => user.id === senderId
      );

      const data = await addMessages(messageData); // Save the message to the database

      // Send the message to all group members who are online
      group.GroupMember.forEach((member) => {
        const receiver = Array.from(this.users.values()).find(
          (user) => user.id === member.memberid
        );
        // console.log({ ...data, user: sender });

        if (receiver) {
          // Send the message to the member's socketId
          this.io
            .to(receiver.socketId)
            .emit("receive_message", { ...data, user: sender });
        }
      });
    }
    // Handle individual messaging
    else {
      const receiver = Array.from(this.users.values()).find(
        (user) => user.id === receiverId
      );
      const sender = Array.from(this.users.values()).find(
        (user) => user.id === senderId
      );

      const data = await addMessages(messageData); // Save the message

      // Send the message to the sender
      if (sender) {
        this.io.to(sender.socketId).emit("receive_message", data);
      } else {
        console.log("Sender is not connected or not found");
      }

      // Send the message to the receiver
      if (receiver) {
        this.io.to(receiver.socketId).emit("receive_message", data);
      } else {
        console.log("Receiver is not connected or not found");
      }
    }
  }
}

module.exports = MessageHandler;
