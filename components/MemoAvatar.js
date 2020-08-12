import React from "react";
import { View, Text } from "react-native";
import { Avatar } from "react-native-elements";

const MemoAvatar = (props) => {
  return React.useMemo(() => <Avatar {...props} />, [props.updateOn]);
};

export default MemoAvatar;
