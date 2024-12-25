import React from "react";

export default function ChatOthers({ chat, showname }) {
  return (
    <div
      className={`p-2 rounded-lg mb-2 bg-gray-200 text-left w-max max-w-[60%]`}
    >
      {showname && (
        <p className="font-bold text-purple-600 ">{chat?.user?.name}</p>
      )}
      <p>{chat.content}</p>
      <small>{new Date(chat.timestamp).toLocaleTimeString()}</small>
    </div>
  );
}
