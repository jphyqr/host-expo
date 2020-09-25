import React, { useState, useEffect, useMemo } from "react";
import { View, Text, Button, ActivityIndicator } from "react-native";
import GameSummary from "../../components/GameSummary";
import firebase from "../../firebase";

import _ from "lodash";
import { h2Style, spacedRow } from "../../styles/styles";
import { ListItem, Icon } from "react-native-elements";
import { format, parse } from "date-fns";
import { formatDistance } from "date-fns/esm";
import {
  SET_GAME,
  UPDATE_GAME_S,
  SET_MEMBER_OF_GROUP,
} from "../../constants/reducerConstants";
import { useDispatch } from "react-redux/lib/hooks/useDispatch";
import { useSelector } from "react-redux";
import { useFirestoreConnect } from "react-redux-firebase";
import { CONFIRMED } from "../../constants/helperConstants";
import { ScrollView } from "react-native-gesture-handler";
const InviteMembersScreen = ({ navigation }) => {
  const [_inviteList, setInviteList] = useState([]);

  const [_inviting, inviting] = useState(false);
  const dispatch = useDispatch();
  const [count, setCount] = useState(-1);
  const xGame = useSelector((state) => state.game || {});
  const xGroup = useSelector((state) => state.group || {});
  const auth = useSelector((state) => state.firebase.auth || {});
  const [_game, setGame] = useState({});
  const firestore = firebase.firestore();
  const inviteMemebers = async () => {
    inviting(true);
    try {
      let updateGame = { ...xGame };

      let uMembers = xGame.members;
      console.log({ uMembers });
      Object.keys(uMembers).map((id, i) => {
        if (_inviteList.filter((i) => i.id === id).length > 0) {
          uMembers[`${id}`].dispatchTo = true;
        } else {
          uMembers[`${id}`].dispatchTo = false;
        }
      });

      await firestore.collection("games").doc(xGame.id).update({
        members: uMembers,
      });

      await firestore.collection("games").doc(xGame.id).update({
        dispatched: true,
      });

      Object.keys(uMembers).map((id, i) => {
        if (_inviteList.filter((i) => i.id === id).length > 0) {
          uMembers[`${id}`].dispatched = true;
          uMembers[`${id}`].dispatchTo = false;
          uMembers[`${id}`].confirmed = CONFIRMED.SENT;
          uMembers[`${id}`].dispatchedDate = Date.now();
        }
      });

      updateGame.members = uMembers;
      updateGame.dispatched = true;

      dispatch({ type: SET_GAME, payload: updateGame });
      dispatch({ type: UPDATE_GAME_S, payload: updateGame });
      setGame(updateGame);
      setInviteList([]);
      setCount(count + 1);
      inviting(false);
    } catch (error) {
      console.log("ERROR", error);
      inviting(false);
    }
  };

  useEffect(() => {
    const getInvitesForGame = async () => {
      console.log("USE EFFECT GET INVITES");
      let inviteDocs = await firestore
        .collection("game_invite")
        .where("gameId", "==", xGame.id)
        .get();
      let invites = [];
      console.log({ inviteDocs });
      inviteDocs.forEach((doc) => {
        invites.push({ id: doc.id, ...doc.data() });
      });

      setInviteList(invites);
    };

    if (!_.isEmpty(xGame)) {
      setGame(xGame);
    }
  }, [xGame]);

  if (_.isEmpty(_game) || _.isEmpty(xGroup) || _inviting)
    return <ActivityIndicator />;

  return (
    <ScrollView>
      {!_.isEmpty(_game) && <GameSummary game={_game} />}

      <View style={spacedRow}>
        <Text style={h2Style}> Member List</Text>
        <Button
          onPress={() =>
            navigation.navigate("ManageGroupFlow", {
              screen: "AddMemberScreen",
            })
          }
          title="New Member"
        ></Button>
      </View>

      {xGame?.members &&
        Object.keys(xGame?.members)?.map((id, i) => {
          return (
            <ListItem
              key={i}
              subtitle={
                id === xGame?.hostUid
                  ? "Host"
                  : _game?.seating?.filter((s) => s.uid === id).length > 0
                  ? `Seat ${_game?.seating?.map((e) => e.uid).indexOf(id) + 1}`
                  : !_.isEmpty(_game?.members[`${id}`]?.confirmed)
                  ? `${_game?.members[`${id}`]?.confirmed} - ${formatDistance(
                      new Date(_game?.members[`${id}`]?.dispatchedDate),
                      new Date(Date.now())
                    )}`
                  : "Not invited yet"
              }
              leftAvatar={{
                source: { uri: xGame?.members[`${id}`]?.photoURL },
              }}
              title={xGame?.members[`${id}`]?.displayName}
              rightIcon={
                id === auth.uid ? (
                  <Icon name="security" />
                ) : _inviteList.filter((i) => i.id === id).length > 0 ? (
                  <Icon
                    onPress={() =>
                      setInviteList(_inviteList.filter((i) => i.id !== id))
                    }
                    name="sc-telegram"
                    type="evilicon"
                    color="#517fa4"
                    size={20}
                  />
                ) : (
                  <Icon
                    onPress={() =>
                      setInviteList([
                        ..._inviteList,
                        Object.assign(
                          {},
                          { id: id, ...xGame.members[`${id}`] }
                        ),
                      ])
                    }
                    name="plus"
                    type="evilicon"
                    color="#517fa4"
                    size={20}
                  />
                )
              }
              rightElement={
                <Button
                  title="..."
                  onPress={() => {
                    dispatch({
                      type: SET_MEMBER_OF_GROUP,
                      payload: { id: id, ...xGame.members[`${id}`] },
                    });
                    navigation.navigate("ManagePlayerInGameScreen");
                  }}
                />
              }
              // onPress={
              //   _inviteList.filter((i) => i.id === id).length > 0
              //     ? () => setInviteList(_inviteList.filter((i) => i.id !== id))
              //     : () =>
              //         setInviteList([
              //           ..._inviteList,
              //           Object.assign(
              //             {},
              //             { id: id, ...xGroup.members[`${id}`] }
              //           ),
              //         ])
              // }
            />
          );
        })}

      <Button
        loading={_inviting}
        onPress={inviteMemebers}
        title={`Send to ${_inviteList.length} members`}
      />
    </ScrollView>
  );
};

export default InviteMembersScreen;
