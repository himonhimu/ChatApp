const prisma = require("../../prisma");
class UsersModels {
  static async addUser(req, res) {
    try {
      const email = req.body.email;
      const name = req.body.name;
      const password = req.body.password;
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password,
          isAdmin: false,
        },
      });
      res.send(user);
    } catch (error) {
      console.error("Error fetching users:", error); // Log the error for debugging
      res.status(500).send({ error: "An error occurred while fetching users" });
    }
  }

  static async getUsers(req, res) {
    try {
      const user = await prisma.user.findMany();
      res.send(user);
    } catch (error) {
      console.error("Error fetching users:", error); // Log the error for debugging
      res.status(500).send({ error: "An error occurred while fetching users" });
    }
  }
  static async signIn(req, res) {
    try {
      const email = req.query.email;
      const password = req.query.password;
      const user = await prisma.user.findFirst({
        where: {
          email: email, // Filter condition inside the `where` clause
        },
      });
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
      if (user?.password === password) {
        res.send(user);
      } else {
        res.status(404).send({ message: "Eamil or Password is Inccorect!" });
      }
    } catch (error) {
      console.error("Error fetching users:", error); // Log the error for debugging
      res.status(500).send({ error: "An error occurred while fetching users" });
    }
  }
}

module.exports = UsersModels;
