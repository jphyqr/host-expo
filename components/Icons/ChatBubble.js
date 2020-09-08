import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSelector } from "react-redux";

const ChatBubble = () => {
  const [_newMessage, setNewMessage] = useState(false);
  const xBadge = useSelector((state) => state.badge || {});

  useEffect(() => {
    if (Object.keys(xBadge).length > 0) setNewMessage(true);
    else setNewMessage(false);
  }, [xBadge]);

  useEffect(() => {
    if (Object.keys(xBadge).length > 0) setNewMessage(true);
    else setNewMessage(false);
  }, []);

  return (
    <Ionicons
      name={_newMessage ? "ios-close" : "ios-chatbubbles"}
      size={35}
      color={"red"}
    />
  );
};

export default ChatBubble;
