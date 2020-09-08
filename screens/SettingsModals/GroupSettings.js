import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";
import _ from "lodash";
import firebase from "../../firebase";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { TouchableOpacity } from "react-native-gesture-handler";
const GroupSettings = ({ navigation }) => {
  const xGroup = useSelector((state) => state.group || {});

  if (_.isEmpty(xGroup)) return <ActivityIndicator />;
  return (
    <View>
      <Text>GROUP</Text>
      <Text>{xGroup.name}</Text>
      {firebase.auth().currentUser.uid === xGroup.hostUid && (
        <TouchableOpacity
          style={{}}
          onPress={async () => {
            navigation.navigate("Main", {
              screen: "ManageGroupFlow",
              groupPhotoURL: xGroup.photoURL,
              groupName: xGroup.name,
            });
          }}
        >
          <Icon name="settings" color={"black"} size={30} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default GroupSettings;
