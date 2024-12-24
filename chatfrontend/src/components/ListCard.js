"use client";
import React from "react";
import { useUser } from "./StateMange/MyContext";

export default function ListCard({ isActive, userdata }) {
  //   console.log(isActive);
  const { setSlectedUserChat, selectedUser } = useUser();
  function onUserClick() {
    setSlectedUserChat(userdata);
  }

  return (
    <div
      className={`flex gap-2 items-center border-b border-b-gray-500 px-2 py-1 rounded-md ${
        selectedUser?.id === userdata.id ? "bg-purple-200" : ""
      }`}
      onClick={onUserClick}
    >
      <div className="w-[36px] aspect-square relative rounded-full overflow-auto bg-green-200 flex items-center justify-center ">
        {/* <Image src={userdata.imageUrl} fill alt={userdata.id} /> */}
        <p className="font-bold text-2xl">
          {userdata.name.slice(0, 1).toUpperCase()}
        </p>
      </div>
      <div>
        <p className="">{userdata.name}</p>
        <div className="flex gap-1 items-center">
          <p
            className={`w-2 aspect-square  rounded-full ${
              !isActive ? "bg-gray-500" : "bg-green-500"
            }`}
          ></p>
          <p>{isActive ? "Active" : "Inactive"}</p>
        </div>
      </div>
    </div>
  );
}
