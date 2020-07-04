import React, { useEffect, useState } from "react";
import { View, Text, Alert } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { h2Style, h4Style } from "../styles/styles";
import { ListItem, Icon, Button } from "react-native-elements";
import { inviteMembersToGroup } from "../actions/groupActions";
import firebase from "../firebase";
import { useSelector, useDispatch } from "react-redux";

import _ from "lodash";
const InviteGroupMembersScreen = ({ navigation }) => {
  const [_usersInArea, setUsersInArea] = useState([]);
  const [_inviteList, setInviteList] = useState([]);
  const [_fU, fU] = useState(0);

  const [_group, setGroup] = useState({});
  const xGroup = useSelector((state) => state.group || {});
  const firestore = firebase.firestore();
  const dispatch = useDispatch();
  const [_loading, loading] = useState(false);
  useEffect(() => {
    setGroup(xGroup);
    fU(_fU + 1);
  }, [xGroup]);
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

  const handleInvite = async () => {
    loading(true);
    try {
      await dispatch(inviteMembersToGroup({ firestore }, _inviteList, _group));
      Alert.alert(
        "Members invited!",
        "You invitd members to this group",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.goBack();
              navigation.navigate("ManageGroupFlow");
            },
          },
        ],
        { cancelable: false }
      );

      loading(false);
    } catch (error) {
      console.log("error inviting", error);
      loading(false);
    }
  };

  return (
    <ScrollView>
      <Text style={h2Style}>Users In Area</Text>
      <Text style={h4Style}>Select users to invite to this group</Text>

      <Button
        onPress={() => {
          navigation.goBack();
          navigation.navigate("Main");
          navigation.navigate("ManageGroupFlow");
        }}
        title={`Manage Group`}
      />

      {_inviteList.length > 0 && (
        <Button
          loading={_loading}
          onPress={handleInvite}
          title={`Invite ${_inviteList.length} members`}
        />
      )}
      {_usersInArea
        ?.filter((u) => u.id !== _group.hostUid)
        .map((u, i) => {
          return (
            <ListItem
              key={i}
              leftAvatar={{ source: { uri: u.photoURL } }}
              title={u.displayName}
              subtitle={
                !_.isEmpty(_group) &&
                !_.isEmpty(_group.invited) &&
                Object.keys(_group?.invited).filter((invite) => invite === u.id)
                  ?.length > 0
                  ? "invited"
                  : ""
              }
              bottomDivider
              rightElement={
                _inviteList.filter((i) => i.id === u.id).length > 0 ? (
                  <Button
                    onPress={() =>
                      setInviteList(_inviteList.filter((i) => i.id !== u.id))
                    }
                    icon={<Icon name="delete" size={15} color="white" />}
                  />
                ) : (
                  <Button
                    onPress={() =>
                      setInviteList([..._inviteList, Object.assign({}, u)])
                    }
                    icon={<Icon name="add" size={15} color="white" />}
                  />
                )
              }
              checkmark={_inviteList.filter((i) => i.id === u.id).length > 0}
            />
          );
        })}
      {_inviteList.length > 0 && (
        <Button
          loading={_loading}
          onPress={handleInvite}
          title={`Invite ${_inviteList.length} members`}
        />
      )}
    </ScrollView>
  );
};

export default InviteGroupMembersScreen;
