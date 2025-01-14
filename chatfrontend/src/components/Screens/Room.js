"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../StateMange/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import RingingModel from "./RingingModel";
// import { useSearchParams } from "next/navigation";

export default function Room() {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [isCalled, setIsCalled] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [isTalking, setIsTalking] = useState(false);

  // const searchParams = useSearchParams();
  // const room = searchParams.get("room_id");
  // console.log(room);

  const handleUserJoined = useCallback(({ email, id }) => {
    // console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
    setIsCalled(true);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      // console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
      setIsRinging(true);
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
      // console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
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
      setRemoteStream(remoteStream);
    });
  }, []);

  const handleCallReceive = useCallback(async ({ from }) => {
    console.log("call:receive", from);

    setIsRinging(false);
    setIsTalking(true);
  }, []);

  const handleCallEnd = useCallback(
    async ({ from }) => {
      if (myStream) {
        myStream.getTracks().forEach((track) => track.stop());
        setMyStream(null);
      }
      setIsTalking(false);
      setRemoteStream(null);
      setIsCalled(false);
    },
    [myStream]
  );

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    socket.on("call:receive", handleCallReceive);
    socket.on("call:end", handleCallEnd);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
      socket.off("call:receive", handleCallReceive);
      socket.off("call:end", handleCallEnd);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  function handleReceiveCall() {
    socket.emit("call:receive", { to: remoteSocketId });
    sendStreams();
    setIsRinging(false);
    setIsCalled(true);
    setIsTalking(true);
  }

  function handleEndCall() {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
      setMyStream(null);
    }
    socket.emit("call:end", { to: remoteSocketId });
    setRemoteStream(null);
    setIsTalking(false);
    setIsCalled(false);
  }

  return (
    <div className="flex gap-2 flex-col">
      <p className="text-center text-2xl font-bold">Room</p>
      {/* {remoteStream && <button onClick={sendStreams}>send video</button>} */}
      <p>{remoteSocketId ? "Connected" : "No one in Room"}</p>
      {remoteSocketId && !isCalled && (
        <button
          className="bg-green-500 text-white py-2 px-4"
          onClick={handleCallUser}
        >
          Call
        </button>
      )}
      {isRinging && (
        <RingingModel
          handleReceive={handleReceiveCall}
          handleDecline={() => {
            setIsRinging(false);
          }}
        />
      )}
      {isTalking && (
        <button
          className="bg-red-500 text-white py-2 px-4"
          onClick={handleEndCall}
        >
          End Call
        </button>
      )}

      <div className="grid grid-cols-2 gap-3">
        {myStream && (
          <div className="bg-green-200">
            <p>My Stream</p>
            <ReactPlayer
              playing
              muted
              height="auto"
              width="70%"
              url={myStream}
            />
          </div>
        )}
        {remoteStream && (
          <div className="bg-red-200">
            <p>Remote Stream</p>
            <ReactPlayer
              playing
              controls
              height="auto"
              width="70%"
              url={remoteStream[0]}
            />
          </div>
        )}
        {/* <div>1</div> */}
      </div>
    </div>
  );
}
