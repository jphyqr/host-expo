import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";

import { ButtonGroup, ListItem, Card, Button } from "react-native-elements";
import { CONFIRMED } from "../constants/helperConstants";
import firebase from "../firebase";
import {
  UPDATE_GAME_S,
  SET_MEMBER_OF_GROUP,
  SET_GAME,
} from "../constants/reducerConstants";
import { useDispatch } from "react-redux/lib/hooks/useDispatch";
import _ from "lodash";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { ScrollView } from "react-native-gesture-handler";
import { h2Style, h3Style, h4Style, h6Style, h7Style } from "../styles/styles";
const GameScreen = () => {
  const game = useSelector((state) => state.game || {});
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.firebase.auth || {});
  const profile = useSelector((state) => state.firebase.profile || {});
  const [_confirmedList, setConfirmedList] = useState([]);
  const [_confirmIndex, confirmIndex] = useState(-1);
  const [_dayIndex, dayIndex] = useState([]);
  const [_gameIndexes, gameIndexes] = useState([]);
  const [_stakeIndexes, stakeIndexes] = useState([]);
  const [_seatSelected, selectSeat] = useState(-1);
  const [_seating, setSeating] = useState([]);
  const [_game, setGame] = useState({});
  const firestore = firebase.firestore();
  const { dayOptions, gameOptions, stakeOptions } = game || [];
  const [_fU, fU] = useState(-1);
  const [count, setCount] = useState(-1);

  useEffect(() => {
    if (!_.isEmpty(game)) setGame(game);
  }, [game]);

  useEffect(() => {
    const updateMemberHasViewed = async () => {
      let member = _game?.members[`${auth.uid}`];

      dayIndex(member.dayOptions);

      setConfirmedList(_game?.confirmedList || []);
      let membersConfirm = member.confirm || "READ";
      switch (membersConfirm) {
        case "READ":
          confirmIndex(-1);
          break;
        case "CONFIRMED":
          confirmIndex(-1);
          break;
        case "SCOUTING":
          confirmIndex(0);
          break;
        case "OUT":
          confirmIndex(1);
          break;
        case "UNSURE":
          confirmIndex(2);
        default:
          break;
      }

      let updatedGame = _game;
      let updatedMembers = _game.members;

      if (!updatedMembers[`${auth.uid}`].confirm) {
        updatedMembers[`${auth.uid}`].confirm = "READ";
        await firestore.collection("games").doc(_game.id).update({
          members: updatedMembers,
        });
      }
    };
    !_.isEmpty(_game) && !_.isEmpty(auth) && updateMemberHasViewed();
  }, [game, auth]);

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
  const updateConfirmStatus = async (status) => {
    let updatedGame = game;
    let updatedMembers = game.members || [];

    if (updatedMembers[`${auth?.uid}`])
      updatedMembers[`${auth?.uid}`].confirm = status;

    //update the games member list for this user
    await firestore.collection("games").doc(game.id).update({
      members: updatedMembers,
    });
    let updatedConfirmedList = game?.confirmedList || [];
    if (status == "CONFIRMED") {
      if (updatedConfirmedList.filter((c) => c.id === auth.uid).length > 0) {
      } else {
        updatedConfirmedList.push({
          id: auth.uid,
          confirmedDate: Date.now(),
          ...updatedMembers[`${auth.uid}`],
        });
      }
    } else {
      updatedConfirmedList = updatedConfirmedList.filter(
        (u) => u.id !== auth.uid
      );
    }

    setConfirmedList(updatedConfirmedList);

    await firestore.collection("games").doc(game.id).update({
      confirmedList: updatedConfirmedList,
    });

    updatedGame.confirmedList = updatedConfirmedList;

    dispatch({ type: UPDATE_GAME_S, payload: updatedGame });
    setCount(count + 1);
  };

  const ScoutingList = () => (
    <Button
      title="Scouting"
      onPress={() => {
        confirmIndex(0);
        updateConfirmStatus(CONFIRMED.SCOUTING);
      }}
    ></Button>
  );
  const Out = () => (
    <Button
      title="Out"
      onPress={() => {
        confirmIndex(1);
        updateConfirmStatus(CONFIRMED.OUT);
      }}
    ></Button>
  );
  const Unsure = () => (
    <Button
      title="Unsure"
      onPress={() => {
        confirmIndex(2);
        updateConfirmStatus(CONFIRMED.UNSURE);
      }}
    ></Button>
  );

  const confirmButtons = [
    { element: ScoutingList },
    { element: Out },
    { element: Unsure },
  ];

  const updateSeating = async (i) => {
    let updatedGame = game;
    let updatedSeating = game.seating;
    let updatedWaitList = _game?.waitList || [];
    //if player was sitting in a seat, clear that seat.
    let indexOfCurrent = -1;
    indexOfCurrent = updatedSeating.findIndex((i) => i.uid === auth.uid);
    let uSeat = {};
    if (indexOfCurrent > -1) {
      uSeat = updatedSeating[indexOfCurrent];
      updatedSeating[indexOfCurrent] = {};
    }

    let indexOnWaitList = -1;
    indexOnWaitList = updatedWaitList.findIndex((i) => i.uid === auth.uid);

    if (indexOnWaitList > -1) {
      updatedWaitList.splice(indexOnWaitList, 1);
    }

    updatedSeating[i] = {
      taken: true,
      displayName: auth.displayName,
      uid: auth.uid,
      bookedOn: Date.now(),
      photoURL: profile.photoURL,
      ...uSeat,
    };
    updatedGame.seating = updatedSeating;
    updatedGame.waitList = updatedWaitList;
    dispatch({ type: UPDATE_GAME_S, payload: updatedGame });

    await firestore.collection("games").doc(game.id).update({
      seating: updatedSeating,
      waitList: updatedWaitList,
    });
    setCount(count + 1);
  };

  const addLateTime = async () => {
    try {
      let updatedGame = { ..._game };
      let updatedSeating = _game?.seating;
      let indexOfCurrent = -1;
      indexOfCurrent = updatedSeating.findIndex((i) => i.uid === auth.uid);

      let uSeat = updatedSeating[indexOfCurrent];
      let uTime = uSeat.late || 0;
      uTime += 15;
      uSeat.late = uTime;
      updatedSeating[indexOfCurrent] = uSeat;
      updatedGame.seating = updatedSeating;

      setGame(updatedGame);
      dispatch({ type: UPDATE_GAME_S, payload: updatedGame });

      dispatch({ type: SET_GAME, payload: updatedGame });
      await firestore.collection("games").doc(_game.id).update({
        seating: updatedSeating,
      });
    } catch (error) {
      loading(false);
      console.log("error in addLateTime", error);
    }
  };

  const lateButtons = [
    {
      element: () => (
        <Button
          buttonStyle={{
            padding: 2,
            borderRadius: 50,
          }}
          raised
          type="clear"
          title="+15 mins"
          icon={<Icon name="clock" type="material" size={35} color="orange" />}
          onPress={() => {
            addLateTime();
          }}
        ></Button>
      ),
    },
  ];

  const addToWaitlist = async (member) => {
    let updatedGame = _game;
    let updatedSeating = _game.seating;
    let updatedWaitList = _game.waitList || [];

    //iff exists already return early

    let indexOnWaitList = -1;
    indexOnWaitList = updatedWaitList.findIndex((i) => i.uid === auth.uid);
    if (indexOnWaitList > -1) return;

    let indexOfCurrent = -1;
    indexOfCurrent = updatedSeating.findIndex((i) => i.uid === auth.uid);

    if (indexOfCurrent > -1) {
      console.log("CLEAR FROM SEAT", indexOfCurrent);
      updatedSeating[indexOfCurrent] = Object.assign({}, { taken: false });
    }

    updatedWaitList.push({
      displayName: auth.displayName,
      uid: auth.uid,
      photoURL: profile.photoURL,
      bookedOn: Date.now(),
    });

    updatedGame.waitList = updatedWaitList;
    updatedGame.seating = updatedSeating;
    setGame(updatedGame);
    dispatch({ type: UPDATE_GAME_S, payload: updatedGame });
    dispatch({ type: SET_GAME, payload: updatedGame });
    await firestore.collection("games").doc(_game.id).update({
      waitList: updatedWaitList,
      seating: updatedSeating,
    });
    fU(_fU + 1);
  };

  return (
    <ScrollView>
      <View style={{ flexDirection: "row" }}>
        <Button
          icon={<Icon name="close" type="material" size={35} color="red" />}
          type="outline"
          title="Out"
        />
        <Button
          type="outline"
          title="Dont Know Yet"
          icon={
            <Icon name="help-circle" type="material" size={35} color="orange" />
          }
        />
      </View>

      {game.seating.map((u, i) => {
        return u.taken === true ? (
          <ListItem
            key={i}
            roundAvatar
            title={u.displayName}
            subtitle={u.late ? `${u.late?.toString()} mins late` : "On Time"}
            leftAvatar={{
              source: {
                uri:
                  u.photoURL ||
                  "https://firebasestorage.googleapis.com/v0/b/poker-cf130.appspot.com/o/avatars%2Ffish.png?alt=media&token=6381537c-65b8-4ecd-a952-a3a8579ff883",
              },
            }}
            buttonGroup={{
              containerStyle: {
                borderWidth: 0,
              },
              buttons: lateButtons,
            }}
          />
        ) : (
          <Button
            type="clear"
            icon={<Icon name="seat" type="material" size={35} color="grey" />}
            title={` Take Seat ${i + 1}`}
            onPress={() => updateSeating(i)}
          />
        );
      })}

      <Button
        type="clear"
        icon={<Icon name="clock" type="material" size={35} color="grey" />}
        title="Join Waitlist"
        onPress={addToWaitlist}
      />

      {game.waitList?.map((u, i) => {
        return (
          <ListItem
            key={i}
            titleStyle={h7Style}
            roundAvatar
            title={`${i + 1}. ${u.displayName}`}
            leftIcon={<Icon name="clock" size={15} />}
            leftAvatar={{ size: "small", source: { uri: u?.photoURL } }}
          />
        );
      })}
    </ScrollView>
  );
};

export default GameScreen;
