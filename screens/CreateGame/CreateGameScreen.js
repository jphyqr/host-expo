import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Alert,
  Button as BoringButton,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import firebase from "../../firebase";
import { MultipleSelectPicker } from "react-native-multi-select-picker";

import {
  h2Style,
  h4Style,
  spacedRow,
  centeredRow,
  h3Style,
  h5Style,
  h6Style,
  vs30,
  hybridText,
  hybridView,
  vs10,
} from "../../styles/styles";
import {
  Input,
  ButtonGroup,
  Button,
  CheckBox,
  Slider,
} from "react-native-elements";
import RNPickerSelect from "react-native-picker-select";

import { deleteGame } from "../../actions/gameActions";
import { useDispatch } from "react-redux/lib/hooks/useDispatch";
import DateTimePicker from "@react-native-community/datetimepicker";
import { TouchableOpacity, ScrollView } from "react-native-gesture-handler";
import { format, parse } from "date-fns";
import { useSelector } from "react-redux";
import _ from "lodash";
import { SET_GAME, UPDATE_GAME_S } from "../../constants/reducerConstants";
const gameOptions = ["NLH", "PLO", "DC"];

const straddleOptions = ["UTG", "BTN", "ROCK", "SLEEPER"];

const stakeOptions = ["1-2", "2-5", "5-5", "5-5-10", "5-10", "10-25"];

const getArrayOfValues = (values, indexes) => {
  let arraOfValues = [];

  for (const i of indexes) {
    arraOfValues.push(values[`${i}`]);
  }
  console.log({ arraOfValues });
  return arraOfValues;
};

const getArrayOfIndexes = (values, selectedValues) => {
  let arrayOfIndexes = [];

  for (const v of selectedValues) {
    arrayOfIndexes.push(values.indexOf(v));
  }
  return arrayOfIndexes;
};

const CreateGameScreen = ({ route, navigation }) => {
  const [_title, setTitle] = useState("");
  const [_straddleIndexes, straddleIndexes] = useState([]);
  const [_showStraddlePicker, setShowStraddlePicker] = useState(false);
  const [_seats, setSeats] = useState({});
  const [_gameSelectedIndex, selectGameIndex] = useState(-1);
  const [_stakeOptionIndex, selectStakeOption] = useState(-1);
  const [_game, setGame] = useState({});
  const [_venueOpenTime, setVenueOpenTime] = useState(new Date(Date.now()));
  const [_showVenueOpenDay, showVenueOpenDay] = useState(false);
  const [_showVenueOpenTime, showVenueOpenTime] = useState(false);
  const firestore = firebase.firestore();
  const [_loading, loading] = useState(true);
  const dispatch = useDispatch();
  const [_gameState, setGameState] = useState({});
  const xGame = useSelector((state) => state.game || {});

  // useEffect(() => {
  //   const unsubscribe = navigation.addListener("focus", (e) => {
  //     // Prevent default behavior
  //     e.preventDefault();
  //     console.log("Tab Pressed");
  //     // Do something manually
  //     // ...
  //   });

  //   return unsubscribe;
  // }, [navigation]);

  useEffect(() => {
    if (!_.isEmpty(xGame)) {
      loading(true);
      const { gameSettings, gameState } = xGame || {};
      const { seating } = xGame || [];

      const {
        game,
        title,

        stakes,

        venueOpenTime,
      } = gameSettings || {};

      if (_.isEmpty(seating)) {
        console.log("SEATING IS EMPTY");
      }

      setTitle(title);
      const { straddles } = gameSettings || [];

      straddleIndexes(straddles);

      setGame(game);

      console.log("game state loaded", gameState);

      setGameState(gameState);
      selectStakeOption(stakes);

      setVenueOpenTime(
        venueOpenTime && parse(venueOpenTime, "PPPPp", new Date())
      );
      setSeats(seating?.length);
      loading(false);
    }
  }, [xGame]);

  //1) should set xGame onto _game, and display _game data on UI
  //As user changes state, should update firestore and store

  const saveGameSettings = async (key, value) => {
    let updatedGameSettings = xGame.gameSettings || {};

    updatedGameSettings[`${key}`] = value;

    await firestore
      .collection("games")
      .doc(xGame.id)
      .update({ gameSettings: updatedGameSettings });

    let updatedGame = { ...xGame };

    updatedGame.settings = updatedGameSettings;

    dispatch({ type: SET_GAME, payload: updatedGame });
  };

  const didMountRef = useRef(false);
  const titleRef = useRef(false);
  const gameRef = useRef(false);
  const stakeRef = useRef(false);
  const straddleRef = useRef(false);
  const seatRef = useRef(false);
  const gameStateRef = useRef(false);

  useEffect(() => {
    const updateSeating = async () => {
      console.log("SEATING CHANGED");
      let updatedGame = { ...xGame };

      let updatedSeating = [];

      for (var i = 0; i < _seats; i++) {
        updatedSeating.push({ taken: false, seatName: `Seat ${i + 1}` });
      }
      updatedGame.seating = updatedSeating;

      try {
        await firestore
          .collection("games")
          .doc(xGame.id)
          .update({ seating: updatedSeating });
      } catch (error) {
        console.log("Error updating seating", error);
      }

      dispatch({ type: SET_GAME, payload: updatedGame });

      dispatch({ type: UPDATE_GAME_S, payload: updatedGame });
    };
    console.log("_seats changed");

    if (seatRef.current && _seats !== xGame?.seating?.length) updateSeating();
    else seatRef.current = true;
  }, [_seats]);

  useEffect(() => {
    const updateGameState = async () => {
      await firestore
        .collection("games")
        .doc(xGame.id)
        .update({ gameState: _gameState });

      let updatedGame = { ...xGame };

      updatedGame.gameState = _gameState;

      dispatch({ type: SET_GAME, payload: updatedGame });
      dispatch({ type: UPDATE_GAME_S, payload: updatedGame });
    };

    if (gameStateRef.current) updateGameState();
    else gameStateRef.current = true;
  }, [_gameState]);

  useEffect(() => {
    const updateStraddles = async () => {
      await saveGameSettings("straddles", _straddleIndexes);
    };

    if (straddleRef.current) updateStraddles();
    else straddleRef.current = true;
  }, [_straddleIndexes]);

  useEffect(() => {
    const updateStakes = async () => {
      await saveGameSettings("stakes", _stakeOptionIndex);
    };

    if (stakeRef.current) updateStakes();
    else stakeRef.current = true;
  }, [_stakeOptionIndex]);

  useEffect(() => {
    const updateTitle = async () => {
      await saveGameSettings("title", _title);
    };

    if (titleRef.current) updateTitle();
    else titleRef.current = true;
  }, [_title]);

  useEffect(() => {
    const updateGame = async () => {
      await saveGameSettings("game", _game);
    };
    if (gameRef.current) updateGame();
    else gameRef.current = true;
  }, [_game]);

  useEffect(() => {
    const updateVenueOpenTime = async () => {
      console.log([_venueOpenTime]);
      let updatedGame = { ...xGame };
      let updatedGameSettings = xGame.gameSettings || {};

      updatedGameSettings.venueOpenTime = format(_venueOpenTime, "PPPPp");
      await firestore
        .collection("games")
        .doc(xGame.id)
        .update({ gameSettings: updatedGameSettings });

      // let parsedSettings = updatedGameSettings;
      // parsedSettings.venueOpenTime = parse(
      //   updatedGameSettings.venueOpenTime,
      //   "PPPPp",
      //   new Date()
      // );
      // let updatedGame = { ...xGame };
      // updatedGame.gameSettings = parsedSettings;

      // dispatch({ type: SET_GAME, payload: updatedGame });
      updatedGame.gameSettings = updatedGameSettings;
      dispatch({ type: UPDATE_GAME_S, payload: updatedGame });
    };

    if (didMountRef.current) updateVenueOpenTime();
    else didMountRef.current = true;
  }, [_venueOpenTime]);

  const saveGame = async () => {
    loading(true);

    let updatedGameSettings = {
      title: _title,
      venueOpenTime: format(_venueOpenTime, "PPPPp"),
      game: gameOptions[_gameSelectedIndex],
      stakes: stakeOptions[_stakeOptionIndex],
      straddles: getArrayOfValues(straddleOptions, _straddleIndexes),
    };

    let updatedSeating = [];

    for (var i = 0; i < _seats; i++) {
      updatedSeating.push({ taken: false, seatName: `Seat ${i + 1}` });
    }

    try {
      await firestore
        .collection("games")
        .doc(xGame.id)
        .update({ gameSettings: updatedGameSettings, seating: updatedSeating });

      let updatedGame = { ...xGame };

      updatedGame["seating"] = updatedSeating;

      updatedGame["gameSettings"] = updatedGameSettings;

      dispatch({ type: SET_GAME, payload: updatedGame });
      dispatch({ type: UPDATE_GAME_S, payload: updatedGame });
      loading(false);
      navigation.navigate("InviteMembersScreen");
    } catch (error) {
      console.log("ERROR", error);
      loading(false);
    }
  };

  const handleDeleteGame = async () => {
    loading(true);
    console.log("DELETE HANDLE");
    try {
      await dispatch(deleteGame({ firestore }, xGame.id));
      loading(false);
      navigation.navigate("ManageGroupFlow", { screen: "GroupAdminScreen" });
    } catch (error) {
      console.log({ error });
      // Alert.alert("Error Creating Game", error);
      loading(false);
    }
  };

  const renderStraddleButtons = (items, arr, fn, updateKey) => {
    let buttons = [];

    items.map((item, i) => {
      buttons.push({
        element: () => (
          <BoringButton
            key={i}
            title={item}
            onPress={async () => await toggleIndex(arr, fn, i, updateKey)}
          />
        ),
      });
    });

    return buttons;
  };

  const toggleIndex = async (arr, fn, index, updateKey) => {
    let updatedArr = arr;
    if (arr.includes(index)) {
      updatedArr = arr.filter((d) => d !== index);
    } else {
      updatedArr = [...arr, index];
    }

    fn(updatedArr);
  };

  const renderOptionString = (title, arr) => {
    let string = `${title}:`;

    for (const item of arr) {
      string = string + " " + item.value;
    }

    if (arr.length === 0) string = string + "none";

    return string;
  };

  if (_loading || _.isEmpty(xGame)) return <ActivityIndicator />;
  return (
    <ScrollView>
      <View style={spacedRow}>
        <Button
          type="outline"
          title="Delete Game"
          loading={_loading}
          onPress={() =>
            Alert.alert(
              "Delete Game",
              "This will delete game, and cancel all invites. Cannot be undone",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                { text: "DELETE GAME", onPress: () => handleDeleteGame() },
              ],
              { cancelable: false }
            )
          }
        />

        <RNPickerSelect
          style={pickerSelectStyles}
          value={_gameState}
          onValueChange={(value) => setGameState(value)}
          items={[
            { label: "PRIVATE_REGISTRATION", value: "PRIVATE_REGISTRATION" },
            { label: "OPEN_REGISTRATION", value: "OPEN_REGISTRATION" },
            { label: "GAME_RUNNING_OPEN", value: "GAME_RUNNING_OPEN" },
            { label: "GAME_RUNNING_HIDDEN", value: "GAME_RUNNING_HIDDEN" },
            { label: "CLOSED", value: "CLOSED" },
          ]}
        />
      </View>

      <View style={vs10} />

      <Text style={h5Style}>Game Title</Text>

      <Input value={_title} onChangeText={(n) => setTitle(n)} />

      <View style={vs30} />
      <View style={spacedRow}>
        {(_showVenueOpenDay || _showVenueOpenTime) && (
          <Button
            title={"Close"}
            onPress={() => {
              showVenueOpenDay(false);
              showVenueOpenTime(false);
            }}
          />
        )}
      </View>
      {_showVenueOpenDay && (
        <View>
          <DateTimePicker
            testID="dateTimePicker"
            value={_venueOpenTime}
            mode={"date"}
            is24Hour={false}
            display="default"
            onChange={(e, d) => setVenueOpenTime(d)}
            minimumDate={new Date(Date.now())}
          />
        </View>
      )}
      <View style={vs30} />
      {_showVenueOpenTime && (
        <View>
          <DateTimePicker
            testID="dateTimePicker"
            value={_venueOpenTime}
            mode={"time"}
            is24Hour={false}
            display="default"
            onChange={(e, d) => setVenueOpenTime(d)}
            minimumDate={new Date(Date.now())}
          />
        </View>
      )}
      <View style={spacedRow}>
        <TouchableOpacity
          onPress={() => {
            showVenueOpenTime(false);
            showVenueOpenDay(true);
          }}
        >
          <View style={hybridView}>
            <Text style={hybridText}>{format(_venueOpenTime, "PPPP")}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            showVenueOpenTime(true);
            showVenueOpenDay(false);
          }}
        >
          <Text style={hybridText}>{format(_venueOpenTime, "p")}</Text>
        </TouchableOpacity>
      </View>

      <View style={vs30} />
      <View style={spacedRow}>
        <Text style={h5Style}>Games</Text>

        <RNPickerSelect
          style={pickerSelectStyles}
          value={_game}
          onValueChange={(value) => setGame(value)}
          items={[
            { label: "PLO", value: "PLO" },
            { label: "NLH", value: "NLH" },
            { label: "DC", value: "DC" },
          ]}
        />
      </View>
      <View style={vs10} />
      <View style={spacedRow}>
        <Text style={h5Style}>Stakes</Text>

        <RNPickerSelect
          style={pickerSelectStyles}
          value={_stakeOptionIndex}
          onValueChange={(value) => selectStakeOption(value)}
          items={[
            { label: "1-2", value: "1-2" },
            { label: "2-5", value: "2-5" },
            { label: "5-5", value: "5-5" },
          ]}
        />
      </View>
      <View style={vs10} />
      <View style={spacedRow}>
        <TouchableOpacity onPress={() => setShowStraddlePicker(true)}>
          <Text style={hybridText}>
            {renderOptionString("Straddles", _straddleIndexes)}
          </Text>
        </TouchableOpacity>
        {_showStraddlePicker && (
          <Button title="close" onPress={() => setShowStraddlePicker(false)} />
        )}
      </View>

      {_showStraddlePicker ? (
        <MultipleSelectPicker
          items={["UTG", "BTN"]}
          onSelectionsChange={(ele) => straddleIndexes(ele)}
          selectedItems={_straddleIndexes}
          buttonStyle={{
            height: 100,
            justifyContent: "center",
            alignItems: "center",
          }}
          buttonText="hello"
          checkboxStyle={{ height: 20, width: 20 }}
        />
      ) : null}
      <View style={vs10} />
      <View style={spacedRow}>
        <Text style={h5Style}>Seats</Text>

        <RNPickerSelect
          style={pickerSelectStyles}
          value={_seats.toString()}
          onValueChange={(value) => setSeats(Number(value))}
          items={[
            { label: "2", value: "2" },
            { label: "3", value: "3" },
            { label: "4", value: "4" },
            { label: "5", value: "5" },
            { label: "6", value: "6" },
            { label: "7", value: "7" },
            { label: "8", value: "8" },
            { label: "9", value: "9" },
            { label: "10", value: "10" },
          ]}
        />
      </View>

      <View style={vs30} />
    </ScrollView>
  );
};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    minWidth: 100,
    borderColor: "gray",
    fontWeight: "600",
    backgroundColor: "gainsboro",
    borderRadius: 4,
    color: "blue",
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: "purple",
    borderRadius: 8,
    color: "black",
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});

export default CreateGameScreen;
