import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import MemoAvatar from "./MemoAvatar";
import { useSelector } from "react-redux";
import { OVERLAYS } from "../constants/helperConstants";

const ProfileAvatar = ({ navigation }) => {
  const [_photoURL, setPhotoURL] = useState({});

  const xOverlay = useSelector((state) => state.overlay || {});
  const xphotoURL = useSelector((state) => state.user.photoURL);
  const xdisplayName = useSelector((state) => state.user.displayName);
  const [_hide, hide] = useState(false);
  useEffect(() => {
    console.log("display auth photo changed");
    setPhotoURL(xphotoURL);
  }, [xphotoURL]);

  useEffect(() => {
    console.log("USE EFFECT xOverlay", xOverlay);
    if (xOverlay == OVERLAYS.RECORD) hide(true);
    else hide(false);
  }, [xOverlay]);

  if (_hide) return null;
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
        name: "security",
        type: "material",
        color: "black",
      }}
      overlayContainerStyle={{ backgroundColor: "blue" }}
      onPress={() => {
        navigation.openDrawer("Main");
      }}
    />
  );
};

export default ProfileAvatar;
