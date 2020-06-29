import React, { useEffect, useState, useMemo } from "react";
import { View, Text, ActivityIndicator, Button, Alert } from "react-native";
import { useSelector } from "react-redux";
import firebase from "../firebase";
import _ from "lodash";
import { ListItem, ButtonGroup, Icon, Card } from "react-native-elements";
import { useDispatch } from "react-redux/lib/hooks/useDispatch";
import { createGame } from "../actions/gameActions";
import { useFirestoreConnect } from "react-redux-firebase";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { h2Style } from "../styles/styles";
const GroupAdminScreen = ({ navigation }) => {
  const groupId = useSelector((state) => state.group || {});
  const [_group, setGroup] = useState({});
  const firestore = firebase.firestore();
  const auth = useSelector((state) => state.firebase.auth || {});
  const [_loading, loading] = useState(false);
  const dispatch = useDispatch();
  const handleCreateGameClick = async () => {
    loading(true);

    try {
      let createdGame = await dispatch(
        createGame({ firestore }, _group, groupId)
      );
      loading(false);
      navigation.navigate("CreateGameScreen", {
        id: createdGame.id,
      });
    } catch (error) {
      console.log({ error });
      // Alert.alert("Error Creating Game", error);
      loading(false);
    }
  };

  const groupsGamesQuery = useMemo(
    () => ({
      collection: "groups_games",
      where: ["groupId", "==", groupId],
      storeAs: "groupsGames",
    }),
    [groupId]
  );

  useFirestoreConnect(groupsGamesQuery);

  const groupsGames = useSelector(
    (state) => state.firestore.ordered.groupsGames || []
  );

  useEffect(() => {
    const getGroupModel = async () => {
      //clear notification badge
      await firestore
        .collection("group_member")
        .doc(`${groupId}_${auth.uid}`)
        .update({
          notificationBadge: false,
        });

      let groupDoc = await firestore.collection("groups").doc(groupId).get();

      setGroup({ id: groupDoc.id, ...groupDoc.data() });
    };

    auth.isLoaded && !auth.isEmpty && getGroupModel();
  }, [groupId, auth]);

  if (_.isEmpty(_group) || _loading) return <ActivityIndicator />;

  const AcceptButton = () => (
    <Icon reverse name="ios-american-football" type="ionicon" color="#517fa4" />
  );
  const pendingButtons = [{ element: AcceptButton }, { element: AcceptButton }];

  return (
    <View>
      <Text>{_group.name}</Text>
      {!_.isEmpty(_group.pending) && <Text>Pending</Text>}
      {Object.keys(_group?.pending).map((g, i) => {
        return (
          <ListItem
            key={i}
            title={_group.pending[`${g}`].displayName}
            subtitle={_group.pending[`${g}`].message}
            leftAvatar={{ source: { uri: _group.pending[`${g}`].photoURL } }}
            onPress={() =>
              navigation.navigate("GroupMemberScreen", {
                user: _group.pending[`${g}`],
                id: g,
                pending: true,
              })
            }
            chevron
          />
        );
      })}

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

      <Text style={h2Style}>Groups Games</Text>

      <ScrollView horizontal>
        {groupsGames?.map((g, i) => {
          return (
            <TouchableOpacity
              key={i}
              onPress={() =>
                navigation.navigate("CreateGameScreen", {
                  id: g.gameId,
                })
              }
            >
              <Card key={i} title={g.gameName} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Button onPress={handleCreateGameClick} title="CreateGame" />
    </View>
  );
};

export default GroupAdminScreen;
