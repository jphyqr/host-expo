import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import MemoAvatar from "./MemoAvatar";
import { useSelector, useDispatch } from "react-redux";
import { SET_OVERLAY } from "../constants/reducerConstants";
import { OVERLAYS } from "../constants/helperConstants";
import firebase from "../firebase";
const SelectedGameNavHeader = () => {
  const [_displayName, setDisplayName] = useState({});

  const xdisplayName = useSelector((state) => state.game || {});
  const dispatch = useDispatch();
  useEffect(() => {
    setDisplayName(xdisplayName);
  }, [xdisplayName]);

  return <Text> {`@${_displayName?.gameSettings?.title || "No Title"}`}</Text>;
};

export default SelectedGameNavHeader;
