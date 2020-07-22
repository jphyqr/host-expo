import React, { useState } from "react";
import { View, Text } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { ScrollView } from "react-native-gesture-handler";
import {
  spacedRow,
  h2Style,
  column,
  centeredRow,
  vs30,
  h3Style,
  h4Style,
} from "../styles/styles";
import { Avatar, ListItem, Button, Icon } from "react-native-elements";
import firebase from "../firebase";
import {
  SET_GROUP,
  DELETE_INVITE_GROUP,
  CREATE_MEMBER_GROUP,
} from "../constants/reducerConstants";
import { Alert } from "react-native";
const GroupScoutScreen = ({ navigation }) => {
  const [_acceptingRequst, acceptRequest] = useState(false);
  const [_denyingRequest, denyRequest] = useState(false);
  const auth = useSelector((state) => state.firebase.auth || {});
  const xGroup = useSelector((state) => state.group || {});
  const { members, name, photoURL, hostedBy, hostPhotoURL, area, privacy } =
    xGroup || {};

  const firestore = firebase.firestore();
  const dispatch = useDispatch();

  const accept = async () => {
    try {
      acceptRequest(true);
      let uGroup = { ...xGroup };
      let uMembers = uGroup.members;
      let uInvites = uGroup.invited;

      let currentMember = uInvites[`${auth.uid}`];

      uMembers[`${auth.uid}`] = currentMember;
      delete uInvites[`${auth.uid}`];

      uGroup.members = uMembers;
      uGroup.invited = uInvites;

      await firestore.collection("groups").doc(xGroup.id).update({
        invited: uInvites,
        members: uMembers,
      });

      await firestore
        .collection("group_member")
        .doc(`${xGroup.id}_${auth.uid}`)
        .update({
          invited: false,
          acceptedInvitation: true,
        });

      dispatch({ type: SET_GROUP, payload: uGroup });

      dispatch({
        type: DELETE_INVITE_GROUP,
        payload: { id: `${xGroup.id}_${auth.uid}` },
      });
      dispatch({
        type: CREATE_MEMBER_GROUP,
        payload: {
          id: `${xGroup.id}_${auth.uid}`,
          groupPhotoURL: xGroup.photoURL,
          groupName: xGroup.name,
        },
      });

      acceptRequest(false);
      Alert.alert(
        "Joined Group",
        "You are now a member of this group",
        [{ text: "OK", onPress: () => navigation.goBack() }],
        { cancelable: false }
      );
    } catch (error) {
      console.log("error", error);
      acceptRequest(false);
    }
  };

  const deny = async () => {
    try {
      denyRequest(true);

      denyRequest(false);
    } catch (error) {
      denyRequest(false);
      console.log("error", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={column}>
      <Text style={h2Style}>{name}</Text>
      <View style={vs30} />
      <Avatar key={"groupAvatar"} source={{ uri: photoURL }} size="xlarge" />
      <View style={vs30} />
      <Text style={h3Style}>Hosted By:</Text>
      <View style={spacedRow}>
        <Text style={h4Style}>{hostedBy}</Text>
        <Avatar
          key={"groupAvatar"}
          rounded
          source={{ uri: hostPhotoURL }}
          size="large"
        />
      </View>
      <View style={vs30} />
      <View style={spacedRow}>
        <Button
          icon={<Icon name="close" size={15} color="blue" />}
          type="outline"
          title="Deny Request"
          onPress={deny}
          loading={_denyingRequest}
        />
        <Button
          icon={<Icon name="check-circle" size={15} color="white" />}
          title="Accept Group Invite"
          loading={_acceptingRequst}
          onPress={accept}
        />
      </View>
      <View style={vs30} />
      <Text style={h4Style}>Members</Text>
      {Object.keys(members).map((m, i) => {
        return (
          <ListItem
            style={{ width: "100%" }}
            key={i}
            leftAvatar={{ source: { uri: members[`${m}`]?.photoURL } }}
            title={members[`${m}`].displayName}
          />
        );
      })}
    </ScrollView>
  );
};

export default GroupScoutScreen;
