import React from "react";

export default function RingingModel({ handleReceive, handleDecline }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[101]">
      <div className="w-1/2 bg-white p-4 flex flex-col gap-2 rounded-md">
        <p className="text-2xl font-bold text-center">
          Some one is Calling you!!!
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleReceive}
            className="bg-green-600 text-white py-2 px-4 rounded-md"
          >
            Receive
          </button>
          <button
            onClick={handleDecline}
            className="bg-red-600 text-white py-2 px-4 rounded-md"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
