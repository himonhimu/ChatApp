import React, { useEffect, useRef, useState } from "react";
import { useUser } from "../StateMange/MyContext";
import socket from "../Connector";
import ChatMe from "./ChatMe";
import ChatOthers from "./ChatOthers";

async function getOldMessages(setMessages, selectedUser, user) {
  // messages senderId
  // receiverId
  const messageRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_LINK}/messages/get-messages?senderId=${user.id}&receiverId=${selectedUser.id}`
  );
  const messageData = await messageRes.json();
  setMessages(messageData);
}

export default function SingleView() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const { selectedUser, user } = useUser();

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
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        left: 0,
        behavior: "smooth",
      });
    }
  }, [messages]); // This effect runs whenever messages change

  const sendMessage = () => {
    if (message.trim() === "") return;
    const messageData = {
      senderId: user.id,
      receiverId: selectedUser.id,
      content: message,
      timestamp: new Date().toISOString(),
      socketId: socket.id,
    };
    socket.emit("send_message", messageData);
    setMessage(""); // Clear input field
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        left: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="bg-purple-100 col-span-6 h-[calc(100vh-130px)] relative">
      <div
        ref={chatContainerRef}
        className="overflow-y-auto h-[calc(100%-60px)] p-4 flex flex-col gap-2"
      >
        {messages
          .filter(
            (fitem) =>
              (fitem.senderId === user.id ||
                fitem.senderId === selectedUser.id) &&
              (fitem.receiverId === user.id ||
                fitem.receiverId === selectedUser.id)
          )
          .map((msg, index) =>
            msg.senderId === user.id ? (
              <ChatMe key={msg.id} chat={msg} />
            ) : (
              <ChatOthers key={msg.id} chat={msg} />
            )
          )}
      </div>

      <div className="absolute bottom-0 flex w-full px-4 gap-2">
        <input
          type="text"
          className="flex-1 rounded-lg p-2 border border-gray-400 outline-none focus:border-green-500"
          placeholder={`Type your message here`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="p-2 bg-green-500 rounded-md text-white"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
