import React, { useState, useEffect } from "react";
import { View, Text, Alert } from "react-native";
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
  h5Style,
} from "../styles/styles";
import { Avatar, ListItem, Button, Icon, Input } from "react-native-elements";
import firebase from "../firebase";
import {
  SET_GROUP,
  REQUEST_TO_JOIN_GROUP,
} from "../constants/reducerConstants";
import _ from "lodash";

const GroupPreviewScreen = () => {
  const auth = useSelector((state) => state.firebase.auth || {});
  const xGroup = useSelector((state) => state.group || {});
  const [_requestingToJoin, requestToJoin] = useState(false);
  const [_requested, setRequested] = useState(false);
  const [_group, setGroup] = useState({});
  const [_message, message] = useState("");
  const [_fU, fU] = useState(1);
  const {
    members,
    name,
    photoURL,
    hostedBy,
    hostUid,
    hostPhotoURL,
    area,
    privacy,
    pending,
  } = _group || {};

  useEffect(() => {
    setGroup(xGroup);
    const { pending } = xGroup || {};
    console.log({ pending });
    let iHaveRequested =
      !_.isEmpty(pending) &&
      Object.keys(pending).filter((p) => p === auth.uid).length > 0;
    setRequested(iHaveRequested);
    fU(_fU + 1);
  }, [xGroup]);

  const firestore = firebase.firestore();
  const dispatch = useDispatch();

  const request = async () => {
    try {
      setRequested(true);

      let newRequest = {
        area: "REGINA_SK",
        groupId: xGroup.id,
        groupName: name,
        groupPhotoURL: photoURL,
        host: false,
        userDisplayName: auth.displayName,
        hostUid: hostUid,
        privacy: privacy,
        userPhotoURL: auth.photoURL,
        userUid: auth.uid,
        pending: true,
        message: _message,
      };
      await firestore
        .collection("group_member")
        .doc(`${xGroup.id}_${auth.uid}`)
        .set(newRequest);

      Alert.alert(
        "Request Sent",
        "Your Request has been sent to Host",
        [{ text: "OK" }],
        { cancelable: false }
      );
      requestToJoin(true);
      dispatch({
        type: REQUEST_TO_JOIN_GROUP,
        payload: { id: _group.id, ...newRequest },
      });

      fU(_fU + 1);
      requestToJoin(false);
    } catch (error) {
      console.log("error", error);
      requestToJoin(false);
    }
  };

  return (
    <ScrollView>
      <View style={column}>
        <Text style={h2Style}>{name}</Text>
        <View style={vs30} />
        <Avatar key={"groupAvatar"} source={{ uri: photoURL }} size="xlarge" />
        <View style={vs30} />
      </View>

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

      {_requested ? (
        <View style={{ backgroundColor: "lightgrey", padding: 10 }}>
          <Text style={h5Style}>Your Request has been sent</Text>
        </View>
      ) : (
        <View style={{ backgroundColor: "lightgrey", padding: 10 }}>
          <Text style={h5Style}>Message for Host</Text>
          <Input
            placeholder={`Hey ${hostedBy}, I want to play!`}
            value={_message}
            onChangeText={(m) => message(m)}
          />
          <Button
            icon={<Icon name="add" size={15} color="white" />}
            title="Request To Join"
            loading={_requestingToJoin}
            onPress={request}
          />
        </View>
      )}

      <View style={vs30} />
      <Text style={h4Style}>Members</Text>
      {members &&
        Object.keys(members)?.map((m, i) => {
          return (
            <ListItem
              style={{ width: "100%" }}
              key={i}
              leftAvatar={{ source: { uri: members[`${m}`].photoURL } }}
              title={members[`${m}`].displayName}
            />
          );
        })}
    </ScrollView>
  );
};

export default GroupPreviewScreen;
