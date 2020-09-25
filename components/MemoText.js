import React from "react";
import { View, Text } from "react-native";
import { h5Style, h7Style, spacedRow } from "../styles/styles";
import { formatDistance } from "date-fns";

const MemoText = (props) => {
  return React.useMemo(
    () => (
      <View {...props}>

        <View style={spacedRow}>
        <Text style={h5Style}>{props.label}</Text>
        {props.createdAt&&<Text style={h7Style}>
        {formatDistance(new Date(props.createdAt), new Date(Date.now()))}
          
          
          
          </Text>}
        </View>
       
        <Text style={h7Style}>{props.message}</Text>
      </View>
    ),
    []
  );
};

export default MemoText;
