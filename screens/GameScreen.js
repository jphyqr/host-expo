import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Button } from "react-native";
import { useSelector } from "react-redux";
import _ from "lodash";
import { ButtonGroup, ListItem, Card } from "react-native-elements";
import { CONFIRMED } from "../constants/helperConstants";
import firebase from "../firebase";
import { UPDATE_GAME_S } from "../constants/reducerConstants";
import { useDispatch } from "react-redux/lib/hooks/useDispatch";
import { ScrollView } from "react-native-gesture-handler";
import { h2Style, h3Style, h4Style, h6Style } from "../styles/styles";
const GameScreen = () => {
  const game = useSelector((state) => state.game || {});
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.firebase.auth || {});

  const [_confirmedList, setConfirmedList] = useState([]);
  const [_confirmIndex, confirmIndex] = useState(-1);
  const [_dayIndex, dayIndex] = useState([]);
  const [_gameIndexes, gameIndexes] = useState([]);
  const [_stakeIndexes, stakeIndexes] = useState([]);
  const [_seatSelected, selectSeat] = useState(-1);
  const [_seating, setSeating] = useState([]);
  const firestore = firebase.firestore();
  const { dayOptions, gameOptions, stakeOptions } = game || [];

  const [count, setCount] = useState(-1);

  useEffect(() => {
    setSeating(game.seating || []);
  }, [game]);

  useEffect(() => {
    const updateMemberHasViewed = async () => {
      let member = game?.members[`${auth.uid}`];

      dayIndex(member.dayOptions);

      setConfirmedList(game?.confirmedList || []);
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

      let updatedGame = game;
      let updatedMembers = game.members;

      if (!updatedMembers[`${auth.uid}`].confirm) {
        updatedMembers[`${auth.uid}`].confirm = "READ";
        await firestore.collection("games").doc(game.id).update({
          members: updatedMembers,
        });
      }
    };
    !_.isEmpty(game) && !_.isEmpty(auth) && updateMemberHasViewed();
  }, [game, auth]);

  const toggleIndex = async (arr, fn, index, updateKey) => {
    let updatedArr = arr;
    if (arr.includes(index)) {
      updatedArr = arr.filter((d) => d !== index);
    } else {
      updatedArr = [...arr, index];
    }

    let updatedGame = game;
    let updatedMembers = game.members;
    let updateMember = updatedMembers[`${auth.uid}`];
    updateMember[`${updateKey}`] = updatedArr;
    updatedMembers[`${auth.uid}`] = updateMember;

    await firestore.collection("games").doc(game.id).update({
      members: updatedMembers,
    });

    fn(updatedArr);

    updatedGame.members = updatedMembers;

    dispatch({ type: UPDATE_GAME_S, payload: updatedGame });
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
  const updateConfirmStatus = async (status) => {
    let updatedGame = game;
    let updatedMembers = game.members || [];

    if (updatedMembers[`${auth?.uid}`])
      updatedMembers[`${auth?.uid}`].confirm = status;

    //update the games member list for this user
    await firestore.collection("games").doc(game.id).update({
      members: updatedMembers,
    });
    let updatedConfirmedList = game.confirmedList || [];
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

    //if player was sitting in a seat, clear that seat.
    let indexOfCurrent = -1;
    indexOfCurrent = updatedSeating.findIndex((i) => i.uid === auth.uid);

    if (indexOfCurrent > -1) {
      updatedSeating[indexOfCurrent] = {};
    }
    updatedSeating[i] = {
      taken: true,
      displayName: auth.displayName,
      uid: auth.uid,
      bookedOn: Date.now(),
    };
    updatedGame.seating = updatedSeating;

    dispatch({ type: UPDATE_GAME_S, payload: updatedGame });

    await firestore.collection("games").doc(game.id).update({
      seating: updatedSeating,
    });
    setCount(count + 1);
  };

  const renderSeatingButtons = () => {
    console.log({ _seating });
    let buttons = ["button"];
    // _seating.map((seat, i) => {
    //   buttons.push({
    //     element: () => <Button key={i} title={i} />,
    //   });
    // });

    return buttons;
  };

  const renderButtons = (items, arr, fn, updateKey) => {
    let buttons = [];

    items.map((item, i) => {
      buttons.push({
        element: () => (
          <Button
            key={i}
            title={item.title}
            onPress={async () => await toggleIndex(arr, fn, i, updateKey)}
          />
        ),
      });
    });

    return buttons;
  };

  return (
    <ScrollView>
      <Text style={h2Style}>{game.name}</Text>
      <Text style={h3Style}>{game.description}</Text>

      {dayOptions?.length > 1 ? (
        <View>
          <Text style={h4Style}>Select Days you can play</Text>
          <ButtonGroup
            selectMultiple
            selectedIndexes={_dayIndex}
            buttons={renderButtons(
              dayOptions,
              _dayIndex,
              dayIndex,
              "dayOptions"
            )}
          />
        </View>
      ) : (
        <Text>{dayOptions && dayOptions[0].title}</Text>
      )}

      {gameOptions?.length > 1 ? (
        <ButtonGroup
          selectMultiple
          selectedIndexes={_gameIndexes}
          buttons={renderButtons(
            gameOptions,
            _gameIndexes,
            gameIndexes,
            "gameOptions"
          )}
        />
      ) : (
        <Text style={h4Style}>Game: {gameOptions && gameOptions[0].title}</Text>
      )}

      {stakeOptions?.length > 1 ? (
        <ButtonGroup
          selectMultiple
          selectedIndexes={_stakeIndexes}
          buttons={renderButtons(
            stakeOptions,
            _stakeIndexes,
            stakeIndexes,
            "stakeOptions"
          )}
        />
      ) : (
        <Text style={h4Style}>
          Stakes: {stakeOptions && stakeOptions[0].title}
        </Text>
      )}

      <ButtonGroup
        selectedIndex={_confirmIndex}
        onPress={(e) => confirmIndex(e)}
        buttons={confirmButtons}
      ></ButtonGroup>
      {_confirmIndex === -1 && <Text>Confirm your game status</Text>}

      <Text style={h2Style}>
        {" "}
        {game.confirmedList.filter((l) => l.id === auth.uid).length > 0
          ? "You are confirmed"
          : `Select Your Seat to Confirm`}{" "}
      </Text>

      <Card title={"Game List"}>
        {/* {_confirmedList.map((u, i) => {
          return (
            <ListItem
              key={i}
              roundAvatar
              title={u.displayName}
              subtitle={renderPreferences(u)}
              avatar={{ uri: u.photoURL }}
            />
          );
        })} */}

        {game.seating.map((u, i) => {
          return u.taken === true ? (
            <ListItem
              key={i}
              roundAvatar
              title={u.displayName}
              subtitle={renderPreferences(u)}
              avatar={{ uri: u.photoURL }}
            />
          ) : (
            <Button title={`Seat ${i + 1}`} onPress={() => updateSeating(i)} />
          );
        })}
      </Card>
    </ScrollView>
  );
};

export default GameScreen;
