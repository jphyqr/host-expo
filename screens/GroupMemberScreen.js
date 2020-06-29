import React from "react";
import { View, Text, Button } from "react-native";
import firebase from "../firebase";
import { useSelector } from "react-redux";
const GroupMemberScreen = ({ route, navigation }) => {
  const { user, id, pending } = route.params;
  const firestore = firebase.firestore();
  const groupId = useSelector((state) => state.group || {});
  const handleAcceptMember = async () => {
    //remove this person from pending
    //add them to members
    //update group_member record

    await firestore.collection("group_member").doc(`${groupId}_${id}`).update({
      pending: false,
      accepted: true,
    });
  };

  return (
    <View>
      <Text>GroupMemberScreen</Text>
      <Text>{user.displayName}</Text>
      {pending && <Button title="Reject" />}
      {pending && <Button title="Accept" />}
      {!pending && <Button title="Remove" />}
    </View>
  );
};

export default GroupMemberScreen;
