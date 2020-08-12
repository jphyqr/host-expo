import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import MemoAvatar from "./MemoAvatar";
import { useSelector, useDispatch } from "react-redux";
import { SET_OVERLAY } from "../constants/reducerConstants";
import { OVERLAYS } from "../constants/helperConstants";
import firebase from "../firebase";
const Handle = ({ navigation }) => {
  const [_displayName, setDisplayName] = useState({});

  const xdisplayName = useSelector((state) => state.user.displayName);
  const dispatch = useDispatch();
  useEffect(() => {
    console.log("display auth photo changed");
    setDisplayName(xdisplayName);
  }, [xdisplayName]);

  return (
    <Text
      onPress={() =>
        dispatch({
          type: SET_OVERLAY,
          payload: OVERLAYS.EDIT_PROFILE,
        })
      }
    >
      {" "}
      {`@${_displayName}`}
    </Text>
  );
};

export default Handle;
