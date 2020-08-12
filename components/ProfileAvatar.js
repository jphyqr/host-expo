import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import MemoAvatar from "./MemoAvatar";
import { useSelector } from "react-redux";

const ProfileAvatar = ({ navigation }) => {
  const [_photoURL, setPhotoURL] = useState({});

  const xphotoURL = useSelector((state) => state.user.photoURL);
  const xdisplayName = useSelector((state) => state.user.displayName);

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
