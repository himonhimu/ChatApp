"use client";
import React, { useEffect, useState } from "react";
import ListCard from "./ListCard";
import { useUser } from "./StateMange/MyContext";
import socket from "./Connector";
import AddGroupMember from "./models/AddGroupMember";
import { RiUserAddFill } from "react-icons/ri";
import { FaEye } from "react-icons/fa";
async function getUsers(setAllUserList, setAllGroupList) {
  // console.log(`${process.env.NEXT_PUBLIC_API_LINK}/group/get-groups`);

  const dataRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_LINK}/user/get-users`
  );
  const data = await dataRes.json();
  const groupRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_LINK}/group/get-groups`
  );
  const groupdata = await groupRes.json();
  setAllUserList(data);
  setAllGroupList(groupdata);
}

export default function SideListBar() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [allUserList, setAllUserList] = useState([]);
  const [allGroupList, setAllGroupList] = useState([]);
  const [addMember, setAddMember] = useState();
  const { user, setSelectedGroupChat, setSlectedUserChat } = useUser();
  const [tabOption, setTabOption] = useState(1);

  useEffect(() => {
    socket.on("active_users", (users) => {
      // console.log("Active users:", users);
      setActiveUsers(users); // Update the state with the active users
    });
    !addMember && getUsers(setAllUserList, setAllGroupList);
  }, [tabOption, addMember]);
  //     ?.filter((fitem) => fitem.id !== user.id)

  function onGroupClick(item) {
    // console.log(item);
    setSelectedGroupChat(item);
    setSlectedUserChat();
  }
  return (
    <div className="flex flex-col gap-3 flex-1">
      {addMember && (
        <AddGroupMember
          groupinfo={addMember}
          memberList={allUserList}
          setPopUp={setAddMember}
        />
      )}
      {/* <button className="bg-green-200 rounded-md py-1" onClick={onReloadClick}>
        Reload
      </button> */}
      <div className="flex gap-2">
        <button
          className={`bg-green-200 rounded-md py-1 flex-1 ${
            tabOption !== 1 ? "bg-green-200" : "bg-green-500 text-white"
          }`}
          onClick={() => {
            setTabOption(1);
            setSelectedGroupChat({});
            setSlectedUserChat();
          }}
        >
          Group
        </button>
        <button
          className={`bg-orange-200 rounded-md py-1 flex-1 ${
            tabOption === 1 ? "bg-orange-200" : "bg-orange-500 text-white"
          }`}
          onClick={() => {
            setTabOption(2);
            setSelectedGroupChat({});
            setSlectedUserChat();
          }}
        >
          User
        </button>
      </div>
      {/* <CunnectUser /> */}
      {tabOption === 1 ? (
        <>
          {allGroupList
            .filter((fitem) => {
              if (user.isAdmin) {
                return true;
              }
              const find = fitem.GroupMember.find(
                (mitem) => mitem.memberid === user.id
              );
              // console.log(find, user.id, fitem.GroupMember); // Logs the matching group member or `undefined` if not found
              return !!find; // Return `true` if `find` exists, otherwise `false`
            })
            .map((item) => {
              return (
                <div
                  key={item.id}
                  className="flex gap-2 items-center border-b border-b-gray-500 px-2 py-1 rounded-md"
                >
                  <div className="w-[36px] aspect-square relative rounded-full overflow-auto bg-green-200 flex items-center justify-center ">
                    {/* <Image src={userdata.imageUrl} fill alt={userdata.id} /> */}
                    <p className="font-bold text-2xl">
                      {item.groupname.slice(0, 1).toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p>{item.groupname}</p>
                    <p className="text-[12px]">
                      Total Member : {item?.GroupMember?.length}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {user.isAdmin && (
                      <button
                        className="bg-gray-300 px-2 py-1 rounded-md"
                        onClick={() => setAddMember(item)}
                      >
                        <RiUserAddFill />
                      </button>
                    )}
                    <button
                      className="bg-blue-300 px-2 py-1 rounded-md"
                      onClick={() => onGroupClick(item)}
                    >
                      <FaEye />
                    </button>
                  </div>
                </div>
              );
            })}
        </>
      ) : (
        <>
          {allUserList
            ?.filter((fitem) => fitem.id !== user.id)
            .map((item, index) => {
              return (
                <ListCard
                  isActive={
                    activeUsers.find((auser) => auser.id === item.id)
                      ? true
                      : false
                  }
                  key={item.id}
                  userdata={item}
                />
              );
            })}
        </>
      )}
    </div>
  );
}
