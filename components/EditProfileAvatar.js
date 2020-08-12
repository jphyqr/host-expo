import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import MemoAvatar from "./MemoAvatar";
import { useSelector, useDispatch } from "react-redux";
import { SET_OVERLAY } from "../constants/reducerConstants";
import { OVERLAYS } from "../constants/helperConstants";

const EditProfileAvatar = ({ navigation }) => {
  const [_photoURL, setPhotoURL] = useState({});

  const xphotoURL = useSelector((state) => state.user.photoURL);
  const dispatch = useDispatch();
  useEffect(() => {
    console.log("display auth photo changed");
    setPhotoURL(xphotoURL);
  }, [xphotoURL]);

  return (
    <MemoAvatar
      key={"profile"}
      rounded
      updateOn={xphotoURL}
      source={{
        uri: xphotoURL,
      }}
      size="medium"
      showAccessory
      accessory={{
        name: "edit",
        type: "material",
        color: "black",
      }}
      overlayContainerStyle={{ backgroundColor: "blue" }}
      onPress={() =>
        dispatch({
          type: SET_OVERLAY,
          payload: OVERLAYS.CHANGE_DISPLAY_NAME,
        })
      }
    />
  );
};

export default EditProfileAvatar;
