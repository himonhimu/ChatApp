"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import SideListBar from "./SideListBar";
import { useUser } from "./StateMange/MyContext";
import socket from "./Connector";
import SingleView from "./ChatView/SingleView";
import GroupView from "./ChatView/GroupView";
// const socket = io(process.env.NEXT_PUBLIC_API_LINK); // Replace with your backend URL
async function getOldMessages(setMessages, selectedUser, user) {
  // messages senderId
  // receiverId
  const messageRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_LINK}/messages/get-messages?senderId=${user.id}&receiverId=${selectedUser.id}`
  );
  const messageData = await messageRes.json();
  setMessages(messageData);
}

export default function GenaralChat() {
  const { user, selectedUser, selectedGroup } = useUser();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // console.log(selectedUser?.id, user?.id);
    if (selectedUser?.id && user?.id) {
      getOldMessages(setMessages, selectedUser, user);
    }
  }, [selectedUser, user]);

  useEffect(() => {
    // socket.on("connect", () => {
    //   console.log("Connected to server with socket ID:", socket.id);
    // });
    socket.on("receive_message", (messageData) => {
      setMessages((prevMessages) => [...prevMessages, messageData]);
    });
    return () => {
      socket.off("receive_message");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() === "") return;
    if (selectedGroup.id) {
      const messageData = {
        senderId: user.id,
        receiverId: selectedGroup.id,
        content: message,
        timestamp: new Date().toISOString(),
        socketId: socket.id,
      };
      socket.emit("send_message", messageData);
      setMessage(""); // Clear input field
    } else {
      const messageData = {
        senderId: user.id,
        receiverId: selectedUser.id,
        content: message,
        timestamp: new Date().toISOString(),
        socketId: socket.id,
      };
      socket.emit("send_message", messageData);
      setMessage(""); // Clear input field
    }
  };

  if (user) {
    return (
      <div className="container mx-auto mt-4">
        <div className="grid grid-cols-8 gap-3">
          <div className="col-span-2">
            <SideListBar />
          </div>
          {selectedUser?.id && <SingleView />}
          {selectedGroup?.id && <GroupView />}
        </div>
      </div>
    );
  } else {
    return <></>;
  }
}
