import React from "react";

import { View, ActivityIndicator, Text } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import _ from "lodash";
import { SET_MEMBER_OF_GROUP } from "../../constants/reducerConstants";
const PIGModal = ({ navigation }) => {
  const dispatch = useDispatch();
  const us2 = navigation.addListener("blur", (e) => {
    // Prevent default action
    console.log("player blurred");

    dispatch({
      type: SET_MEMBER_OF_GROUP,
      payload: {},
    });
  });

  const memberOfGroup = useSelector((state) => state.memberOfGroup);

  if (_.isEmpty(memberOfGroup)) return <ActivityIndicator />;

  return (
    <View>
      <Text>{memberOfGroup.displayName}</Text>
    </View>
  );
};

export default PIGModal;
