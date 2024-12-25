import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
async function getAddedList(setAddedList, groupinfo) {
  // get-groupmembers
  //   console.log(groupinfo);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_LINK}/group/get-groupmembers?groupid=${groupinfo.id}`
  );
  const data = await response.json();
  //   console.log(data);
  setAddedList(data);
}
export default function AddGroupMember({ groupinfo, memberList, setPopUp }) {
  const [addedList, setAddedList] = useState([]);

  useEffect(() => {
    getAddedList(setAddedList, groupinfo);
  }, [groupinfo]);

  async function onAddtoGroup(member) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_LINK}/group/add-groupmember`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupid: groupinfo.id, memberid: member.id }),
      }
    );

    if (response.status !== 404) {
      const data = await response.json();
      setAddedList((prev) => {
        // Check if the member is already in the list
        if (prev.find((m) => m.id === member.id)) {
          return prev; // If already added, return the existing list
        }
        // Otherwise, add the new member to the list
        // console.log(member, data);

        return [...prev, { ...data, user: member }];
      });
    }
  }
  async function onRemoveFromGroup(member) {
    // delete-groupmembers
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_LINK}/group/delete-groupmembers/${member.id}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    if (response.status !== 404) {
      const data = await response.json();
      setAddedList((prev) => {
        // Remove the member by filtering them out
        return prev.filter((m) => m.id !== member.id);
      });
      toast.success("Member Removed From this Group!");
    } else {
      toast.error(error.message);
    }
  }
  // console.log(addedList);

  return (
    <div className="absolute inset-0 bg-[#00000090] z-[100] flex justify-center items-center">
      <div className="bg-white text-black px-6 py-4 flex flex-col gap-3 rounded-md w-1/2 min-w-[600px]">
        <div className="flex justify-between items-center ">
          <p>
            Add Group Member to{" "}
            <span className="font-bold">{groupinfo.groupname}</span>
          </p>
          <button
            onClick={() => setPopUp()}
            className="px-2 py-1 bg-red-300 rounded-md"
          >
            Close
          </button>
        </div>
        <div className="flex gap-6 ">
          <div className="flex gap-2 flex-col w-1/2 ">
            <p className="font-bold">Meber List</p>
            {memberList
              .filter((fitem) => {
                const find = addedList.find(
                  (mitem) => mitem.user.id === fitem.id
                );
                return !find && fitem;
              })
              .map((member) => {
                return (
                  <div
                    key={member.id}
                    className="flex gap-2 items-center border-b border-b-gray-400 justify-between"
                  >
                    <div>
                      <p>{member.name}</p>
                      <p className="text-[12px]">{member.email}</p>
                    </div>
                    <div>
                      <button
                        className="text-nowrap"
                        onClick={() => onAddtoGroup(member)}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
          <div className="flex gap-2 flex-col w-1/2">
            <p className="font-bold">Added List</p>
            {addedList.map((member) => {
              return (
                <div
                  key={member.id}
                  className="flex gap-2 items-center border-b border-b-gray-400 justify-between"
                >
                  <div>
                    <p>{member?.user?.name || member.name}</p>
                    <p className="text-[12px]">
                      {member?.user?.email || member.email}
                    </p>
                  </div>
                  <div>
                    <button
                      className="text-nowrap"
                      onClick={() => onRemoveFromGroup(member)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
