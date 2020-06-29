import React, { useEffect, useState, useMemo } from "react";
import { View, Text, Button } from "react-native";

import firebase from "../firebase";
import { ScrollView } from "react-native-gesture-handler";
import { ListItem, ButtonGroup } from "react-native-elements";
import { useSelector } from "react-redux";
import { useFirestoreConnect } from "react-redux-firebase";

const AreaScreen = () => {
  const firestore = firebase.firestore();
  const auth = useSelector((state) => state.firebase.auth || {});
  const profile = useSelector((state) => state.firebase.profile || {});
  const [_usersInArea, setUsersInArea] = useState([]);

  const followingQuery = useMemo(
    () => ({
      collection: "users",
      doc: auth.uid || "",
      subcollections: [{ collection: "following" }],
      storeAs: "followingSnap",
    }),
    [auth]
  );

  useFirestoreConnect(followingQuery);

  const following = useSelector(
    (state) => state.firestore.ordered.followingSnap || []
  );

  useEffect(() => {
    const getMemebersInArea = async () => {
      let usersInArea = [];
      let usersInAreaDocs = await firestore
        .collection("areas")
        .doc("REGINA_SK")
        .collection("members")
        .get();
      usersInAreaDocs.forEach((doc) => {
        usersInArea.push({ id: doc.id, ...doc.data() });
      });

      setUsersInArea(usersInArea);
    };

    getMemebersInArea();
  }, []);

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
    } catch (error) {
      console.log(error);
    }
  };

  const followButtonGroup = () => {
    return <ButtonGroup buttons={["Follow"]} />;
  };

  return (
    <ScrollView>
      <Text h2>Users In Area</Text>
      <Text h4>
        Folow users to receive notifications when they confirm for games
      </Text>
      {_usersInArea?.map((u, i) => {
        return (
          <ListItem
            key={i}
            leftAvatar={{ source: { uri: u.photoURL } }}
            title={u.displayName}
            subtitle={"subtitle"}
            bottomDivider
            rightElement={
              following.filter((f) => f.id === u.id).length > 0 ? (
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
