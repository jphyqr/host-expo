import React from "react";
import { View, Text } from "react-native";
import MemoAvatar from "./MemoAvatar";
import { h5Style, h7Style, h6Style, h4Style } from "../styles/styles";

const StoryAvatar = ({ label, ...props }) => {
  return (
    <View>
      <MemoAvatar {...props} />
      <Text style={[h6Style, { width: "100%", textAlign: "center" }]}>
        {label}
      </Text>
    </View>
  );
};

export default StoryAvatar;
