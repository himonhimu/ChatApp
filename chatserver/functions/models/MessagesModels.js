const prisma = require("../../prisma");
class MessagesModels {
  static async addMessages(data) {
    try {
      const senderId = data.senderId;
      const receiverId = data.receiverId;
      const content = data.content;
      const timestamp = data.timestamp;
      const isGroup = data.isGroup;
      console.log(data);

      const messages = await prisma.messages.create({
        data: {
          senderId,
          receiverId,
          content,
          timestamp,
          isGroup: isGroup || false,
        },
      });
      return messages;
    } catch (error) {
      console.error("Error fetching users:", error); // Log the error for debugging
      return { error: "An error occurred while adding messages" };
    }
  }
}

module.exports = MessagesModels;
