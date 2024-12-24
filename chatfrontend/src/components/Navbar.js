"use client";

import { deleteCookie, getCookie } from "cookies-next";
import { useUser } from "./StateMange/MyContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { io } from "socket.io-client";

export default function Navbar() {
  const { logout, user, login } = useUser();
  const router = useRouter();
  // console.log(user);
  async function onLogoutClick() {
    logout();
    deleteCookie("chat-user");
    router.push("/login");

    const socket = io(process.env.NEXT_PUBLIC_API_LINK); // Replace with your server URL
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
        <div className="container mx-auto flex justify-between items-center sticky top-0 z-50">
          <div>
            <p className="text-2xl font-bold">Chat App</p>
          </div>
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
