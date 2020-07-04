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
import { ScrollView } from "react-native-gesture-handler";
const InviteMembersScreen = ({ navigation }) => {
  const [_inviteList, setInviteList] = useState([]);

  const [_inviting, inviting] = useState(false);
  const dispatch = useDispatch();
  const [count, setCount] = useState(-1);
  const xGame = useSelector((state) => state.game || {});
  const xGroup = useSelector((state) => state.group || {});

  const [_game, setGame] = useState({});
  const firestore = firebase.firestore();
  const inviteMemebers = async () => {
    inviting(true);
    try {
      console.log("1");
      let updateGame = xGame;
      console.log("2", updateGame);
      let uMemebers = updateGame.members;
      console.log("3");
      Object.keys(uMemebers).map((id, i) => {
        if (_inviteList.filter((i) => i.id === id).length > 0) {
          uMemebers[`${id}`].dispatchTo = true;
        } else {
          uMemebers[`${id}`].dispatchTo = false;
        }
      });
      console.log("part 4");

      await firestore.collection("games").doc(xGame.id).update({
        members: uMemebers,
      });

      await firestore.collection("games").doc(xGame.id).update({
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

      updateGame.members = uMemebers;
      updateGame.dispatched = true;

      dispatch({ type: SET_GAME, payload: updateGame });
      dispatch({ type: UPDATE_GAME_S, payload: updateGame });
      setInviteList([]);
      setCount(count + 1);
      inviting(false);
    } catch (error) {
      console.log("ERROR", error);
      inviting(false);
    }
  };

  useEffect(() => {
    !_.isEmpty(xGame) && setGame({ ...xGame });
    console.log("id2", _game);
  }, [xGame]);

  if (_.isEmpty(xGame) || _.isEmpty(xGroup) || _inviting)
    return <ActivityIndicator />;

  return (
    <ScrollView>
      <Text>InviteMembersScreen</Text>

      {!_.isEmpty(xGame) && <GameSummary game={xGame} />}

      <Text style={h2Style}> Member List</Text>
      {xGroup?.members &&
        Object.keys(xGroup.members)
          .filter((m) => m !== xGroup.hostUid)
          .map((id, i) => {
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
                  source: { uri: xGroup.members[`${id}`].photoURL },
                }}
                title={xGroup.members[`${id}`].displayName}
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
                            { id: id, ...xGroup.members[`${id}`] }
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
                        member: xGroup.members[`${id}`],
                        memberId: id,
                        game: _game,
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
