import React, { useEffect, useState, useMemo } from "react";
import { View, Text, Button } from "react-native";

import firebase from "../firebase";
import { ScrollView } from "react-native-gesture-handler";
import { ListItem, ButtonGroup } from "react-native-elements";
import { useSelector, useDispatch } from "react-redux";
import { useFirestoreConnect } from "react-redux-firebase";
import _ from "lodash";
import { FOLLOW_MEMBER, UNFOLLOW_MEMBER } from "../constants/reducerConstants";
import { h5Style, hs30, vs30, vs10, h6Style } from "../styles/styles";
const AreaScreen = () => {
  const dispatch = useDispatch();
  const firestore = firebase.firestore();
  const auth = useSelector((state) => state.firebase.auth || {});
  const profile = useSelector((state) => state.firebase.profile || {});
  const xFollowing = useSelector(
    (state) => state.membersInArea.following || []
  );
  const xMembersInArea = useSelector(
    (state) => state.membersInArea.members || []
  );

  const [_members, setMembers] = useState([]);
  const [_following, setFollowing] = useState([]);
  useEffect(() => {
    console.log("useEffect members", xMembersInArea);
    setMembers(xMembersInArea);
  }, [xMembersInArea]);

  useEffect(() => {
    setFollowing(xFollowing);
  }, [xFollowing]);

  const followUser = async (userToFollow) => {
    const following = {
      displayName: userToFollow.displayName,
      followingUid: userToFollow.id,
      followingPhotoURL: userToFollow.photoURL,
    };
    try {
      await firestore
        .collection("users")
        .doc(auth.uid)
        .collection("following")
        .doc(userToFollow.id)
        .set(following);

      dispatch({
        type: FOLLOW_MEMBER,
        payload: { id: userToFollow.id, ...following },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const unfollowUser = async (userToUnfollow) => {
    try {
      await firestore
        .collection("users")
        .doc(auth.uid)
        .collection("following")
        .doc(userToUnfollow.id)
        .delete();
      dispatch({
        type: UNFOLLOW_MEMBER,
        payload: { id: userToUnfollow.id },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const followButtonGroup = () => {
    return <ButtonGroup buttons={["Follow"]} />;
  };

  return (
    <ScrollView>
      <View style={vs30} />
      <Text style={h5Style}>Users In Area</Text>
      <View style={vs10} />
      <Text style={h6Style}>
        Folow users to receive notifications when they confirm for games
      </Text>
      <View style={vs10} />
      {_members
        ?.filter((u) => u.id !== auth.uid)
        .map((u, i) => {
          return (
            <ListItem
              key={i}
              leftAvatar={{ source: { uri: u.photoURL } }}
              title={u.displayName}
              subtitle={"subtitle"}
              bottomDivider
              rightElement={
                _following.filter((f) => f.id === u.id).length > 0 ? (
                  <Button title="Unfollow" onPress={() => unfollowUser(u)} />
                ) : (
                  <Button title="Follow" onPress={() => followUser(u)} />
                )
              }
            />
          );
        })}
    </ScrollView>
  );
};

export default AreaScreen;
