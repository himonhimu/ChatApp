import React, { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "../StateMange/MyContext";
import socket from "../Connector";
import ChatMe from "./ChatMe";
import ChatOthers from "./ChatOthers";
import peer from "../service/peer";
import ReactPlayer from "react-player";

async function getOldMessages(setMessages, selectedUser, user) {
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

  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (selectedUser?.id && user?.id) {
      getOldMessages(setMessages, selectedUser, user);
    }
  }, [selectedUser, user]);

  const [remoteSocketId, setRemoteSocketId] = useState(selectedUser?.email);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  async function handleCall() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);

    const offer = await peer.getOffer();
    socket.emit("incomming:call", {
      to: remoteSocketId,
      offer,
    });
  }

  // const handleCallUser = useCallback(async () => {
  //   const stream = await navigator.mediaDevices.getUserMedia({
  //     audio: true,
  //     video: true,
  //   });
  //   const offer = await peer.getOffer();
  //   socket.emit("user:call", { to: remoteSocketId, offer });
  //   setMyStream(stream);
  // }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    console.log("peer:nego:needed", "called");

    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      console.log("peer:nego:done", "called");
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

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
    setMessage("");
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        left: 0,
        behavior: "smooth",
      });
    }
  };

  function onCloseCamera() {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
      setMyStream(null);
      console.log("Camera and microphone stopped");
    }
  }

  function onCheckClick() {
    console.log(remoteStream);
  }

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
          .map((msg) =>
            msg.senderId === user.id ? (
              <ChatMe key={msg.id} chat={msg} />
            ) : (
              <ChatOthers key={msg.id} chat={msg} />
            )
          )}
      </div>

      <div className="absolute top-0 w-[300px] h-[300px] bg-gray-400">
        <p>stream data</p>
        {/* <button onClick={sendStreams}>send</button> */}
        {myStream && (
          <>
            <ReactPlayer
              playing
              muted
              height={"200px"}
              width={"300px"}
              url={myStream}
            />
            <button onClick={onCloseCamera}>Close</button>
          </>
        )}
      </div>

      <div className="absolute top-0 w-[300px] h-[300px] left-[320px] bg-gray-400">
        <p onClick={onCheckClick}>Remote data</p>

        {remoteStream && (
          <ReactPlayer
            playing
            muted
            height={"200px"}
            width={"300px"}
            url={remoteStream}
          />
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
        <button
          className="p-2 bg-teal-500 rounded-md text-white"
          onClick={handleCall}
        >
          Call
        </button>
      </div>
    </div>
  );
}
