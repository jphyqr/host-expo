import React, { useState, useEffect, useMemo } from "react";
import { View, Text, Button, ActivityIndicator } from "react-native";
import GameSummary from "../../components/GameSummary";
import firebase from "../../firebase";

import _ from "lodash";
import { h2Style, spacedRow } from "../../styles/styles";
import { ListItem, Icon } from "react-native-elements";
import { format, parse } from "date-fns";
import { formatDistance } from "date-fns/esm";
import { SET_GAME, UPDATE_GAME_S } from "../../constants/reducerConstants";
import { useDispatch } from "react-redux/lib/hooks/useDispatch";
import { useSelector } from "react-redux";
import { useFirestoreConnect } from "react-redux-firebase";
import { CONFIRMED } from "../../constants/helperConstants";
const InviteMembersScreen = ({ navigation }) => {
  const [_inviteList, setInviteList] = useState([]);

  const [_group, setGroup] = useState({});
  const [_inviting, inviting] = useState(false);
  const dispatch = useDispatch();
  const [count, setCount] = useState(-1);
  const xGame = useSelector((state) => state.game || {});
  const firestore = firebase.firestore();
  const inviteMemebers = async () => {
    inviting(true);

    let uMemebers = xGame.members;

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

      Object.keys(uMemebers).map((id, i) => {
        if (_inviteList.filter((i) => i.id === id).length > 0) {
          uMemebers[`${id}`].dispatched = true;
          uMemebers[`${id}`].dispatchTo = false;
          uMemebers[`${id}`].confirmed = CONFIRMED.SENT;
          uMemebers[`${id}`].dispatchedDate = Date.now();
        }
      });

      xGame.members = uMemebers;
      xGame.dispatched = true;

      dispatch({ type: SET_GAME, payload: { id: route.params.id, ...xGame } });
      dispatch({ type: UPDATE_GAME_S, payload: xGame });
      setInviteList([]);
      setCount(count + 1);
      inviting(false);
    } catch (error) {
      console.log("ERROR", error);
      inviting(false);
    }
  };

  useEffect(() => {
    console.log(xGame);
  }, [xGame]);

  if (_.isEmpty(xGame) || _inviting) return <ActivityIndicator />;

  return (
    <View>
      <Text>InviteMembersScreen</Text>

      {!_.isEmpty(xGame) && <GameSummary game={xGame} />}

      <Text style={h2Style}> Member List</Text>
      {_group?.members &&
        Object.keys(_group.members).map((id, i) => {
          return (
            <ListItem
              key={i}
              subtitle={
                xGame.members[`${id}`].confirmed
                  ? `${xGame.members[`${id}`].confirmed} on ${formatDistance(
                      new Date(xGame.members[`${id}`].dispatchedDate),
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
                  <Icon
                    onPress={() =>
                      setInviteList(_inviteList.filter((i) => i.id !== id))
                    }
                    name="sc-telegram"
                    type="evilicon"
                    color="#517fa4"
                  />
                ) : (
                  <Icon
                    onPress={() =>
                      setInviteList([
                        ..._inviteList,
                        Object.assign(
                          {},
                          { id: id, ..._group.members[`${id}`] }
                        ),
                      ])
                    }
                    name="plus"
                    type="evilicon"
                    color="#517fa4"
                  />
                )
              }
              rightElement={
                <Button
                  title="..."
                  onPress={() =>
                    navigation.navigate("ManagePlayerInGameScreen", {
                      member: _group.members[`${id}`],
                      memberId: id,
                      game: xGame,
                    })
                  }
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
              //             { id: id, ..._group.members[`${id}`] }
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
    </View>
  );
};

export default InviteMembersScreen;
