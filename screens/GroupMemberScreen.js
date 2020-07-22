import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import firebase from "../firebase";
import { useSelector, useDispatch } from "react-redux";
import { Button, Icon, Avatar, ListItem } from "react-native-elements";
import { spacedRow, averageRow, h2Style } from "../styles/styles";
import { ACCEPT_MEMBER_IN_GROUP } from "../constants/reducerConstants";
const GroupMemberScreen = ({ route, navigation }) => {
  const { user, id, pending } = route.params;
  const [_accepting, accepting] = useState(false);
  const [_rejecting, rejecting] = useState(false);
  const firestore = firebase.firestore();
  const group = useSelector((state) => state.group || {});

  const dispatch = useDispatch();
  const handleAcceptMember = async () => {
    try {
      accepting(true);
      await firestore
        .collection("group_member")
        .doc(`${group.id}_${id}`)
        .update({
          pending: false,
          accepted: true,
        });

      dispatch({
        type: ACCEPT_MEMBER_IN_GROUP,
        payload: { userUid: id },
      });

      Alert.alert(
        "Accepted User",
        "User has been added to group",
        [{ text: "OK", onPress: () => navigation.goBack() }],
        { cancelable: false }
      );

      accepting(false);
    } catch (error) {
      console.log("error", error);
      accepting(false);
    }
  };

  return (
    <View>
      <ListItem
        key={"userItem"}
        leftAvatar={{ source: { uri: user?.photoURL } }}
        title={user.displayName}
        subtitle={"subtitle"}
        bottomDivider
      />

      {pending && (
        <View style={averageRow}>
          <Button
            type="outline"
            title="Reject"
            icon={<Icon name="delete" color="blue" />}
          />
          <Button
            title="Accept"
            icon={<Icon name="check" color="white" />}
            onPress={handleAcceptMember}
            loading={_accepting}
          />
        </View>
      )}

      {!pending && <Button title="Remove" />}
    </View>
  );
};

export default GroupMemberScreen;
