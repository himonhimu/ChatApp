"use client";

import { deleteCookie, getCookie } from "cookies-next";
import { useUser } from "./StateMange/MyContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import socket from "./Connector";
import CreateNewGroup from "./models/CreateNewGroup";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { logout, user, login } = useUser();
  const router = useRouter();
  const [showGroupPop, setShowGroupPop] = useState(false);
  // console.log(user);
  async function onLogoutClick() {
    await signOut({ redirect: true, callbackUrl: "/" });
    logout();
    deleteCookie("chat-user");
    router.push("/login");

    socket.on("disconnect", () => {
      const data = {
        id: logoutuser.user?.id,
        Name: `${logoutuser.user?.firstName} ${logoutuser.user?.lastName}`,
      };
      // Emit user data to the server
      socket.emit("user_disconnected", data);
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }
  useEffect(() => {
    function getLocalUser() {
      const cookies = getCookie("chat-user");
      if (cookies) {
        const cookie = JSON.parse(cookies);
        login(cookie);
      }
    }
    getLocalUser();
  }, []);
  if (user) {
    return (
      <div className="bg-gray-800 p-2 text-white">
        {showGroupPop && <CreateNewGroup setPopUp={setShowGroupPop} />}
        <div className="container mx-auto flex justify-between items-center sticky top-0 z-50">
          <Link href={"/"}>
            <p className="text-2xl font-bold">Chat App</p>
          </Link>
          {user.isAdmin && (
            <div>
              <button
                onClick={() => {
                  setShowGroupPop(true);
                }}
              >
                Create Group
              </button>
            </div>
          )}
          <Link href={"vedio"}>Loby</Link>
          <Link href={"room"}>room</Link>
          <div className="flex gap-3">
            <p>Hello, {user.name} </p>
            <button onClick={onLogoutClick}>Logout</button>
          </div>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
}
