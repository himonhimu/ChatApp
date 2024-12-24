"use client";
import React, { useEffect, useState } from "react";
import ListCard from "./ListCard";
import { io } from "socket.io-client";
import CunnectUser from "./ConnectUser";
import { useUser } from "./StateMange/MyContext";
async function getUsers(setAllUserList) {
  const dataRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_LINK}/user/get-users`
  );
  const data = await dataRes.json();
  setAllUserList(data);
}

export default function SideListBar() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [allUserList, setAllUserList] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    getUsers(setAllUserList);
    const socket = io(process.env.NEXT_PUBLIC_API_LINK); // Replace with your server URL
    socket.on("active_users", (users) => {
      // console.log("Active users:", users);
      setActiveUsers(users); // Update the state with the active users
    });
  }, []);
  //     ?.filter((fitem) => fitem.id !== user.id)
  return (
    <div className="flex flex-col gap-3 flex-1">
      <CunnectUser />
      {allUserList
        ?.filter((fitem) => fitem.id !== user.id)
        .map((item, index) => {
          return (
            <ListCard
              isActive={
                activeUsers.find((auser) => auser.id === item.id) ? true : false
              }
              key={item.id}
              userdata={item}
            />
          );
        })}
    </div>
  );
}
