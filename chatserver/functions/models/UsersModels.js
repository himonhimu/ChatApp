const prisma = require("../../prisma");
class UsersModels {
  static async addUser(req, res) {
    try {
      const { email, name, password } = req.body;

      const user = await prisma.user.upsert({
        where: { email }, // Email must be unique for this to work
        update: {
          name,
          password, // You might want to hash the password here
        },
        create: {
          email,
          name,
          password, // Hash the password before saving
          isAdmin: false,
        },
      });

      res.send(user);
    } catch (error) {
      console.error("Error managing user:", error);
      res
        .status(500)
        .send({ error: "An error occurred while managing the user" });
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
