const prisma = require("../../prisma");
class GroupModels {
  static async addGroup(req, res) {
    try {
      const group = await prisma.messagegroup.create({
        data: {
          groupname: req.body.groupname,
        },
      });
      // messagegroup
      res.send(group);
    } catch (error) {
      console.error("Error fetching users:", error); // Log the error for debugging
      return { error: "An error occurred while adding groups" };
    }
  }
  static async getGroups(req, res) {
    try {
      const groups = await prisma.messagegroup.findMany({
        include: {
          GroupMember: {
            include: {
              user: true, // Fetch the user details for each group member
            },
          },
        },
      });
      res.send(groups);
    } catch (error) {
      console.error("Error fetching users:", error); // Log the error for debugging
      return { error: "An error occurred while getting groups" };
    }
  }
  // group member from here

  static async addGroupMember(req, res) {
    try {
      const groupmember = await prisma.groupmembers.create({
        data: {
          groupid: req.body.groupid,
          memberid: req.body.memberid,
        },
      });
      // messagegroup
      res.send(groupmember);
    } catch (error) {
      console.error("Error fetching users:", error); // Log the error for debugging
      return { error: "An error occurred while adding group member" };
    }
  }
  static async deleteGroupMember(req, res) {
    try {
      const id = req.params.id;
      const deletedMember = await prisma.groupmembers.delete({
        where: {
          id: id, // Specify the ID of the group member to delete
        },
      });
      res.send(deletedMember);
    } catch (error) {
      console.error("Error fetching users:", error); // Log the error for debugging
      return { error: "An error occurred while adding group member" };
    }
  }
  static async getGroupMembers(req, res) {
    try {
      if (req.query.groupid) {
        const groupmember = await prisma.groupmembers.findMany({
          where: {
            groupid: req.query.groupid,
          },
          include: {
            user: true, // Include user details
            messagegroup: true, // Include group details
          },
        });
        res.send(groupmember);
      } else {
        res.send([]);
      }

      // messagegroup
    } catch (error) {
      console.error("Error fetching users:", error); // Log the error for debugging
      return { error: "An error occurred while adding group member" };
    }
  }
}

module.exports = GroupModels;
