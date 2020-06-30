import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { h2Style, centeredRow } from "../../styles/styles";
import { ListItem } from "react-native-elements";
import { UPDATE_GAME_S } from "../../constants/reducerConstants";
import firebase from "../../firebase";
import { useDispatch } from "react-redux";
import { ScrollView } from "react-native-gesture-handler";
const ManagePlayerInGameScreen = ({ route }) => {
  const firestore = firebase.firestore();
  const [_game, setGame] = useState(route.params.game);
  const [_fU, fU] = useState(-1);
  const dispatch = useDispatch();
  const [_member, setMember] = useState({
    id: route.params.memberId,
    ...route.params.member,
  });

  const { gameSettings, seating } = _game;
  const { waitList } = _game || [];

  const addToWaitlist = async (member) => {
    let updatedGame = _game;
    let updatedSeating = _game.seating;
    let updatedWaitList = _game.waitList || [];

    //iff exists already return early

    let indexOnWaitList = -1;
    indexOnWaitList = updatedWaitList.findIndex((i) => i.uid === _member.id);
    if (indexOnWaitList > -1) return;

    let indexOfCurrent = -1;
    indexOfCurrent = updatedSeating.findIndex((i) => i.uid === _member.id);

    if (indexOfCurrent > -1) {
      updatedSeating[indexOfCurrent] = {};
    }

    updatedWaitList.push({
      displayName: member.displayName,
      uid: member.id,
      photoURL: member.photoURL,
      bookedOn: Date.now(),
    });

    updatedGame.waitList = updatedWaitList;
    setGame(updatedGame);
    dispatch({ type: UPDATE_GAME_S, payload: updatedGame });

    await firestore.collection("games").doc(_game.id).update({
      waitList: updatedWaitList,
    });
    fU(_fU + 1);
  };

  const moveUpOnWaitList = async (i) => {
    if (i == 0) return;

    let updatedWaitList = _game.waitList;
    let updatedGame = _game;

    var b = updatedWaitList[i - 1];
    updatedWaitList[i - 1] = updatedWaitList[i];
    updatedWaitList[i] = b;

    updatedGame.waitList = updatedWaitList;

    setGame(updatedGame);
    dispatch({ type: UPDATE_GAME_S, payload: updatedGame });

    await firestore.collection("games").doc(_game.id).update({
      waitList: updatedWaitList,
    });
    fU(_fU + 1);
  };

  const updateSeating = async (i) => {
    let updatedGame = _game;
    let updatedSeating = _game.seating;
    let updatedWaitList = _game.waitList;
    //if player was sitting in a seat, clear that seat.
    let indexOfCurrent = -1;
    indexOfCurrent = updatedSeating.findIndex((i) => i.uid === _member.id);

    if (indexOfCurrent > -1) {
      updatedSeating[indexOfCurrent] = {};
    }

    //if player was on waitlist remove him
    let indexOnWaitList = -1;
    indexOnWaitList = updatedWaitList.findIndex((i) => i.uid === _member.id);

    if (indexOnWaitList > -1) {
      updatedWaitList.splice(indexOnWaitList, 1);
    }

    updatedSeating[i] = {
      available: false,
      displayName: _member.displayName,
      photoURL: _member.photoURL,
      uid: _member.id,
      bookedOn: Date.now(),
    };
    updatedGame.seating = updatedSeating;
    updatedGame.waitList = updatedWaitList;
    dispatch({ type: UPDATE_GAME_S, payload: updatedGame });

    await firestore.collection("games").doc(_game.id).update({
      seating: updatedSeating,
      waitList: updatedWaitList,
    });
    fU(_fU + 1);
  };

  const renderPreferences = () => {
    const user = game.members[`${auth.uid}`];
    let days, games, stakes;
    days = games = stakes = "";

    const { stakeOptions, gameOptions, dayOptions } = game || [];
    const {
      stakeOptions: stakeIndexes,
      gameOptions: gameIndexes,
      dayOptions: dayIndexes,
    } = user || [];
    if (dayIndexes)
      for (const day of dayIndexes) {
        days = days + dayOptions[day].title + "/";
      }
    if (gameIndexes)
      for (const game of gameIndexes) {
        games = games + gameOptions[game].title + "/";
      }
    if (stakeIndexes)
      for (const stake of stakeIndexes) {
        stakes = stakes + stakeOptions[stake].title + "/";
      }

    return days + games + stakes;
  };

  return (
    <ScrollView>
      <Text
        style={[h2Style]}
      >{`Manage ${_member.displayName} for ${gameSettings.title}`}</Text>

      {seating.map((u, i) => {
        return u.available === false ? (
          <ListItem
            key={i}
            roundAvatar
            title={u.displayName}
            leftAvatar={{ source: { uri: u.photoURL } }}
          />
        ) : (
          <Button
            key={i}
            title={`Seat ${i + 1}`}
            onPress={() => updateSeating(i)}
          />
        );
      })}

      <Button
        icon={{
          name: "plus",
          size: 15,
        }}
        title="Add To Waitlist"
        onPress={() => addToWaitlist(_member)}
      />

      <Text>Wait List</Text>

      {waitList?.map((u, i) => {
        return (
          <ListItem
            key={i}
            roundAvatar
            title={u.displayName}
            leftAvatar={{ source: { uri: u.photoURL } }}
            rightElement={
              <Button title="Up" onPress={() => moveUpOnWaitList(i)} />
            }
          />
        );
      })}
    </ScrollView>
  );
};

export default ManagePlayerInGameScreen;
