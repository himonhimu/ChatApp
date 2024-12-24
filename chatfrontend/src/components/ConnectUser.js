"use client";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useUser } from "./StateMange/MyContext";
export default function CunnectUser() {
  const { user } = useUser();

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_LINK); // Replace with your server URL
    // Send user data after connection
    if (user) {
      socket.on("connect", () => {
        console.log("Connected to server");
        const data = {
          id: user?.id,
          Name: `${user?.name}`,
        };
        // Emit user data to the server
        socket.emit("user_connected", data);
      });
      const logoutuser = user || {};
      socket.on("disconnect", () => {
        console.log("Disconnected from server");
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
  }, [user]);

  async function onCheckConnection(params) {
    const response = await fetch("http://localhost:6016/hello");
    const data = await response.json();
    console.log(data);
  }
  return (
    <>
      {/* <h1>Socket.IO with Next.js</h1>
      <button onClick={onCheckConnection}>Check</button> */}
    </>
  );
}
