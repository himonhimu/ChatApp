import React from "react";
import toast from "react-hot-toast";

export default function CreateNewGroup({ setPopUp }) {
  async function onCreateGroup(e) {
    e.preventDefault();
    const groupname = e.target.groupname.value;
    if (groupname) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_LINK}/group/add-group`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ groupname }),
        }
      );

      if (response.status !== 404) {
        const data = await response.json();
        console.log(data);
        setPopUp();
      }
    } else {
      toast.error("Group Name Required!");
    }
  }
  return (
    <div className="absolute inset-0 bg-[#00000090] z-[100] flex justify-center items-center">
      <form
        className="bg-white text-black px-6 py-4 flex flex-col gap-3 rounded-md"
        onSubmit={onCreateGroup}
      >
        <p className="text-center text-2xl font-bold">Create New Group</p>
        <div className="flex gap-2 items-center">
          <label>Group Name</label>
          <input
            type="text"
            placeholder="group name"
            className="border border-gray-500 outline-none focus:border-green-500 rounded-md px-3 py-1"
            required
            name="groupname"
          />
        </div>
        <div className="flex gap-2 items-center justify-center">
          <button
            className="py-1 px-6 bg-red-600 text-white rounded-md"
            onClick={() => setPopUp(false)}
            type="button"
          >
            Close
          </button>
          <button className="py-1 px-6 bg-green-600 text-white rounded-md">
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
