"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import SideListBar from "./SideListBar";
import { useUser } from "./StateMange/MyContext";

const socket = io(process.env.NEXT_PUBLIC_API_LINK); // Replace with your backend URL

export default function GenaralChat() {
  const { user, selectedUser } = useUser();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server with socket ID:", socket.id);
    });
    socket.on("receive_message", (messageData) => {
      setMessages((prevMessages) => [...prevMessages, messageData]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() === "") return;

    const messageData = {
      senderId: user.id,
      receiverId: selectedUser.id,
      content: message,
      timestamp: new Date().toISOString(),
    };
    socket.emit("send_message", messageData);
    setMessage(""); // Clear input field
  };

  if (user) {
    return (
      <div className="container mx-auto mt-4">
        <div className="grid grid-cols-8 gap-3">
          <div className="col-span-2">
            <SideListBar />
          </div>

          <div className="bg-purple-100 col-span-6 h-[calc(100vh-130px)] relative">
            <div className="overflow-y-auto h-[calc(100%-60px)] p-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg mb-2 ${
                    msg.senderId === user.id
                      ? "bg-green-300 self-end text-right"
                      : "bg-gray-200 text-left"
                  }`}
                >
                  <p>{msg.content}</p>
                  <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
                </div>
              ))}
            </div>

            {selectedUser?.id && (
              <div className="absolute bottom-0 flex w-full px-4 gap-2">
                <input
                  type="text"
                  className="flex-1 rounded-lg p-2 border border-gray-400 outline-none focus:border-green-500"
                  placeholder="Type your message here"
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
            )}
          </div>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
}
