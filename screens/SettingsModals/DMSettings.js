import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";
import _ from "lodash";
const DMSettings = () => {
  const xDM = useSelector((state) => state.dM || {});

  if (_.isEmpty(xDM)) return <ActivityIndicator />;
  return (
    <View>
      <Text>D M</Text>
      <Text>{xDM.displayName}</Text>
    </View>
  );
};

export default DMSettings;
