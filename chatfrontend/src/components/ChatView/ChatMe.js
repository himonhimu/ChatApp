import React from "react";

export default function ChatMe({ chat, showname }) {
  return (
    <div
      className={`p-2 rounded-lg mb-2 bg-green-200 text-right w-max self-end max-w-[60%]`}
    >
      {showname && <p className="font-bold text-red-600 ">You</p>}
      <p>{chat.content}</p>
      <small>{new Date(chat.timestamp).toLocaleTimeString()}</small>
    </div>
  );
}
