import React, { useState, useEffect } from "react";
import { View, Text, Button, ActivityIndicator } from "react-native";
import GameSummary from "../../components/GameSummary";
import firebase from "../../firebase";

import _ from "lodash";
import { h2Style, spacedRow } from "../../styles/styles";
import { ListItem, Icon } from "react-native-elements";
import { format, parse } from "date-fns";
import { formatDistance } from "date-fns/esm";
const InviteMembersScreen = ({ route, navigation }) => {
  console.log(route.params.id);
  const [_inviteList, setInviteList] = useState([]);
  const [_game, setGame] = useState({});
  const [_group, setGroup] = useState({});
  const [_inviting, inviting] = useState(false);
  const firestore = firebase.firestore();
  const inviteMemebers = async () => {
    inviting(true);

    let uGame = _game;
    let uMemebers = uGame.members;

    Object.keys(uMemebers).map((id, i) => {
      if (_inviteList.filter((i) => i.id === id).length > 0) {
        uMemebers[`${id}`].dispatchTo = true;
      } else {
        uMemebers[`${id}`].dispatchTo = false;
      }
    });

    try {
      await firestore.collection("games").doc(route.params.id).update({
        members: uMemebers,
      });

      await firestore.collection("games").doc(route.params.id).update({
        dispatched: true,
      });

      inviting(false);
    } catch (error) {
      console.log("ERROR", error);
      inviting(false);
    }
  };

  useEffect(() => {
    const getGameById = async () => {
      const firestore = firebase.firestore();

      let gameDoc = await firestore
        .collection("games")
        .doc(route.params.id)
        .get();

      let gameData = gameDoc.data();

      setGame(gameData);

      let groupDoc = await firestore
        .collection("groups")
        .doc(gameData.groupId)
        .get();
      let groupObj = { id: groupDoc.id, ...groupDoc.data() };
      setGroup(groupObj);
    };

    getGameById();
  }, [route.params.id]);

  if (_inviting) return <ActivityIndicator />;

  return (
    <View>
      <Text>InviteMembersScreen</Text>

      {!_.isEmpty(_game) && <GameSummary game={_game} />}

      <Text style={h2Style}> Member List</Text>
      {_group?.members &&
        Object.keys(_group.members).map((id, i) => {
          return (
            <ListItem
              key={i}
              subtitle={
                _game.members[`${id}`].confirmed
                  ? `${_game.members[`${id}`].confirmed} on ${formatDistance(
                      new Date(_game.members[`${id}`].dispatchedDate),
                      new Date(Date.now())
                    )}`
                  : "Not invited yet"
              }
              leftAvatar={{
                source: { uri: _group.members[`${id}`].photoURL },
              }}
              title={_group.members[`${id}`].displayName}
              rightIcon={
                _inviteList.filter((i) => i.id === id).length > 0 ? (
                  <Icon name="sc-telegram" type="evilicon" color="#517fa4" />
                ) : (
                  <Icon name="plus" type="evilicon" color="#517fa4" />
                )
              }
              onPress={
                _inviteList.filter((i) => i.id === id).length > 0
                  ? () => setInviteList(_inviteList.filter((i) => i.id !== id))
                  : () =>
                      setInviteList([
                        ..._inviteList,
                        Object.assign(
                          {},
                          { id: id, ..._group.members[`${id}`] }
                        ),
                      ])
              }
            />
          );
        })}

      <Button
        loading={_inviting}
        onPress={inviteMemebers}
        title={`Send to ${_inviteList.length} members`}
      />
    </View>
  );
};

export default InviteMembersScreen;
