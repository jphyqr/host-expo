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
import { CHANNEL_TYPE } from "../constants/helperConstants";
const AreaScreen = ({ navigation }) => {
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
      <View style={vs30} />
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
              leftAvatar={{ source: { uri: u?.photoURL } }}
              title={u.displayName}
              subtitle={"subtitle"}
              bottomDivider
              onPress={async () => {
                //1) Check if already a DM record, if so use that DM id

                let firstUid = "";
                let secondUid = "";

                if (firebase.auth().currentUser.uid > u.id) {
                  firstUid = firebase.auth().currentUser.uid;
                  secondUid = u.id;
                } else {
                  secondUid = firebase.auth().currentUser.uid;
                  firstUid = u.id;
                }

                let dmId;
                let channelMembers = {};
                try {
                  console.log("first uid", firstUid);
                  console.log("second uid", secondUid);
                  let document = await firestore
                    .collection("dm")
                    .where("firstUid", "==", firstUid)
                    .where("secondUid", "==", secondUid)
                    .get();

                  if (document.empty) {
                    console.log("EMPTY, CREATE");

                    let doc = await firestore.collection("dm").add({
                      createdAt: Date.now(),
                      firstUid: firstUid,
                      secondUid: secondUid,
                    });

                    console.log("added dm doc", document);

                    dmId = doc.id;

                    channelMembers[`${u.id}`] = {
                      displayName: u.displayName,
                      photoURL: u.photoURL,
                    };
                    channelMembers[`${firebase.auth().currentUser.uid}`] = {
                      displayName: firebase.auth().currentUser.displayName,
                      photoURL: firebase.auth().currentUser.photoURL,
                    };

                    await firestore
                      .collection("channels")
                      .doc(dmId)
                      .set({
                        channelType: "DM",
                        channelId: dmId,
                        channelName: "DM",
                        channelPhotoURL: "DM",
                        channelMembers: channelMembers || {},
                        createdDate: Date.now(),
                        adminDisplayName: "DM",
                        adminPhotoURL: "DM",

                        adminUid: "DM",
                      });

                    Object.keys(channelMembers).forEach(async (key) => {
                      await firestore
                        .collection("channel_member")
                        .doc(`${dmId}_${key}`)
                        .set({
                          channelType: "DM",
                          channelId: dmId,
                          memberId: key,
                          channelName: "DM",
                          channelPhotoURL: "DM",
                          joinDate: Date.now(),
                          memberDisplayName:
                            channelMembers[`${key}`].displayName,
                          memberPhotoURL: channelMembers[`${key}`].photoURL,

                          admin: false,
                        });
                    });
                  } else {
                    //TODO HERE: Figuer out how to get the id of the first record from the query, should be only one
                    console.log("DM already exists", document.docs[0].id);
                    dmId = document.docs[0].id;
                  }

                  navigation.navigate("ChatScreen", {
                    channelName: "DM",
                    channelPhotoURL: "DM",
                    channelMembers: channelMembers,
                    channelType: CHANNEL_TYPE.DM,
                    channelId: dmId,
                  });
                } catch (err) {
                  return console.log(err);
                }

                //2) if not, then create the DM record and then send along that ID
              }}
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
