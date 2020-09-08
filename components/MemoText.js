import React from "react";
import { View, Text } from "react-native";
import { h5Style, h7Style } from "../styles/styles";

const MemoText = (props) => {
  return React.useMemo(
    () => (
      <View {...props}>
        <Text style={h5Style}>{props.label}</Text>
        <Text style={h7Style}>{props.message}</Text>
      </View>
    ),
    []
  );
};

export default MemoText;
