"use client"; // Make sure this is a client-side context

import React, { createContext, useState, useContext } from "react";
import socket from "../Connector";

// Create a context
const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedUser, setSlectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState({});

  // You can add logic to fetch user data from API or from local storage here

  const login = (userData) => {
    setUser(userData);
    socket.emit("user_connected", userData);
    // console.log("connected");
  };

  const logout = () => {
    setUser(null);
  };

  const setSlectedUserChat = (userData) => {
    setSlectedUser(userData);
  };
  const setSelectedGroupChat = (groupdata) => {
    setSelectedGroup(groupdata);
    socket.emit("user_connected", { ...groupdata, isGroup: true });
  };

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        selectedUser,
        setSlectedUserChat,
        setSelectedGroupChat,
        selectedGroup,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Create a custom hook to use the context
export const useUser = () => {
  return useContext(UserContext);
};
