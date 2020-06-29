import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";
import firebase from "../firebase";
import { ListItem } from "react-native-elements";
import _ from "lodash";
const GroupScreen = () => {
  const groupId = useSelector((state) => state.group || {});
  const [_group, setGroup] = useState({});
  const firestore = firebase.firestore();
  const auth = useSelector((state) => state.firebase.auth || {});

  useEffect(() => {
    const getGroupModel = async () => {
      //clear notification badge

      try {
        await firestore
          .collection("group_member")
          .doc(`${groupId}_${auth.uid}`)
          .update({
            notificationBadge: false,
          });
      } catch (error) {
        console.log("Not actually part of this group");
      }
      let groupDoc = await firestore.collection("groups").doc(groupId).get();

      setGroup({ id: groupDoc.id, ...groupDoc.data() });
    };

    auth.isLoaded && !auth.isEmpty && getGroupModel();
  }, [groupId, auth]);

  if (_.isEmpty(_group)) return <ActivityIndicator />;

  return (
    <View>
      <Text>GroupScreen</Text>

      {!_.isEmpty(_group.members) && <Text>Members</Text>}
      {Object.keys(_group?.members).map((g, i) => {
        return (
          <ListItem
            key={i}
            title={_group.members[`${g}`].displayName}
            chevron
            onPress={() =>
              navigation.navigate("GroupMemberScreen", {
                user: _group.members[`${g}`],
                id: g,
                pending: false,
              })
            }
          />
        );
      })}
    </View>
  );
};

export default GroupScreen;
