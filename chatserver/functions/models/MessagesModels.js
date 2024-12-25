const prisma = require("../../prisma");
class MessagesModels {
  static async getMessages(req, res) {
    try {
      const senderId = req.query.senderId;
      const receiverId = req.query.receiverId;
      // console.log(req.query);

      const messages = await prisma.messages.findMany({
        where: {
          OR: [
            {
              senderId: senderId,
              receiverId: receiverId,
            },
            {
              senderId: receiverId,
              receiverId: senderId,
            },
          ],
        },
        include: {
          user: true, // Include user details
        },
        orderBy: {
          timestamp: "asc", // Optional: Sort messages by timestamp in ascending order
        },
      });

      res.send(messages);
    } catch (error) {
      console.error("Error fetching users:", error); // Log the error for debugging
      return { error: "An error occurred while adding messages" };
    }
  }

  static async addMessages(data) {
    try {
      const senderId = data.senderId;
      const receiverId = data.receiverId;
      const content = data.content;
      const timestamp = data.timestamp;
      const isGroup = data.isGroup;
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
