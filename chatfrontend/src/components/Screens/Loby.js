"use client";
import React, { useCallback } from "react";
import { useSocket } from "../StateMange/SocketProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Loby() {
  const socket = useSocket();
  const router = useRouter();

  const handleJoin = useCallback(
    (e) => {
      e.preventDefault();
      const email = e.target.email.value;
      const room = e.target.room.value;
      socket.emit("room:join", { email, room });
    },
    [socket]
  );

  const handleJoinRoom = useCallback(({ room }) => {
    router.push(`room?room_id=${room}`);
  }, []);
  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div className="flex items-center justify-center h-screen">
      <form className="w-1/2 mx-auto " onSubmit={handleJoin}>
        <div className="flex gap-2 items-center">
          <label>Email</label>
          <input
            type="text"
            placeholder="email"
            required
            className="border border-gray-400 py-1 px-2 rounded-md"
            name="email"
          />
        </div>
        <div>
          <label>Room Number</label>
          <input
            type="text"
            placeholder="room"
            required
            className="border border-gray-400 py-1 px-2 rounded-md"
            name="room"
          />
        </div>
        <button>Join</button>
      </form>
    </div>
  );
}
