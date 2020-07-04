import React, { useEffect, useState } from "react";
import { View, Text, Alert, ActivityIndicator } from "react-native";
import firebase from "../../firebase";
import {
  h2Style,
  h4Style,
  spacedRow,
  centeredRow,
  h3Style,
  h5Style,
  h6Style,
  vs30,
} from "../../styles/styles";
import {
  Input,
  ButtonGroup,
  Button,
  CheckBox,
  Slider,
} from "react-native-elements";
import { deleteGame } from "../../actions/gameActions";
import { useDispatch } from "react-redux/lib/hooks/useDispatch";
import DateTimePicker from "@react-native-community/datetimepicker";
import { TouchableOpacity, ScrollView } from "react-native-gesture-handler";
import { format, parse } from "date-fns";
import { useSelector } from "react-redux";
import _ from "lodash";
import { SET_GAME } from "../../constants/reducerConstants";
const gameOptions = ["NLH", "PLO", "DC"];

const straddleOptions = ["UTG", "BTN", "ROCK", "SLEEPER"];

const stakeOptions = ["1-2", "2-5", "5-5", "5-5-10", "5-10", "10-25"];

const smokingOptions = ["At Table", "Inside", "Outside", "None"];

const drinkingOptionsProvided = [
  "Water",
  "Coffee",
  "Pop",
  "Beer",
  "Cocktails",
  "Wine",
];

const venueOptions = ["Casino", "Hotel", "House", "Condo", "Club", "Business"];

const dealerOptions = ["Professional", "Ameture", "None"];

const drinkingOptionsAvailable = ["Beer", "Cocktails", "Wine"];

const getArrayOfValues = (values, indexes) => {
  let arraOfValues = [];

  for (const i of indexes) {
    arraOfValues.push(values[`${i}`]);
  }

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

  const [_drinkingOptionsProvided, setDrinkingOptionsProvided] = useState([]);
  const [_drinkingOptionsAvailable, setDrinkingOptionsAvailable] = useState([]);
  const [_smokingOption, setSmokingOption] = useState(-1);
  const [_venueOption, setVenueOption] = useState(-1);
  const [_dealerOption, setDealerOption] = useState(-1);
  const [_seats, setSeats] = useState(0);
  const [_gameSelectedIndex, selectGameIndex] = useState(-1);
  const [_stakeOptionIndex, selectStakeOption] = useState(-1);
  const [_game, setGame] = useState({});
  const [_venueOpenTime, setVenueOpenTime] = useState(new Date(Date.now()));
  const [_showVenueOpenDay, showVenueOpenDay] = useState(false);
  const [_showVenueOpenTime, showVenueOpenTime] = useState(false);
  const firestore = firebase.firestore();
  const [_loading, loading] = useState(true);
  const dispatch = useDispatch();

  const xGame = useSelector((state) => state.game || {});

  useEffect(() => {
    const { gameSettings, seating } = xGame || {};

    const {
      dealer,
      description,
      drinksAvailable,
      drinksProvided,
      game,
      title,
      smoking,
      stakes,
      venue,
      straddles,
      venueOpenTime,
    } = gameSettings;

    setTitle(title);

    straddleIndexes(getArrayOfIndexes(straddleOptions, straddles));
    selectGameIndex(gameOptions.indexOf(game));
    setDrinkingOptionsAvailable(
      getArrayOfIndexes(drinkingOptionsAvailable, drinksAvailable)
    );
    setDrinkingOptionsProvided(
      getArrayOfIndexes(drinkingOptionsProvided, drinksProvided)
    );
    selectStakeOption(stakeOptions.indexOf(stakes));
    setSmokingOption(smokingOptions.indexOf(smoking));
    setVenueOption(venueOptions.indexOf(venue));
    setDealerOption(dealerOptions.indexOf(dealer));

    setVenueOpenTime(parse(venueOpenTime, "PPPPp", new Date()));
    setSeats(seating.length);
    loading(false);
  }, [xGame]);

  const saveGame = async () => {
    loading(true);

    console.log("save game");
    let updatedGameSettings = {
      title: _title,
      venueOpenTime: format(_venueOpenTime, "PPPPp"),
      game: gameOptions[_gameSelectedIndex],
      stakes: stakeOptions[_stakeOptionIndex],
      straddles: getArrayOfValues(straddleOptions, _straddleIndexes),
      venue: venueOptions[_venueOption],
      dealer: dealerOptions[_dealerOption],
      smoking: smokingOptions[_smokingOption],
      drinksProvided: getArrayOfValues(
        drinkingOptionsProvided,
        _drinkingOptionsProvided
      ),
      drinksAvailable: getArrayOfValues(
        drinkingOptionsAvailable,
        _drinkingOptionsAvailable
      ),
    };

    let updatedSeating = [];

    for (var i = 0; i < _seats; i++) {
      updatedSeating.push({ available: true, seatName: `Seat ${i + 1}` });
    }

    console.log("save game 2");

    try {
      await firestore
        .collection("games")
        .doc(xGame.id)
        .update({ gameSettings: updatedGameSettings, seating: updatedSeating });

      let updatedGame = { ...xGame };

      console.log("save game 3");
      updatedGame["seating"] = updatedSeating;
      console.log("save game 4");
      updatedGame["gameSettings"] = updatedGameSettings;
      console.log("save game 5");
      console.log("id", updatedGame.id);
      dispatch({ type: SET_GAME, payload: updatedGame });
      console.log("navigating...");
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
      await dispatch(deleteGame({ firestore }, route.params.id));
      loading(false);
      navigation.navigate("GroupAdminScreen", { id: route.params.id });
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
          <Button
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

  if (_loading || _.isEmpty(xGame)) return <ActivityIndicator />;
  return (
    <ScrollView>
      <View style={spacedRow}>
        <Button
          title="Invite Members"
          icon={{
            name: "add",
            size: 15,
            color: "white",
          }}
          raised
          onPress={saveGame}
        />
        <Button
          type="outline"
          title="Delete Game"
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
      </View>

      <View style={vs30} />

      <Text style={h4Style}>Game Title</Text>

      <Input value={_title} onChangeText={(n) => setTitle(n)} />

      <View style={vs30} />
      <View style={spacedRow}>
        <Button
          title={_showVenueOpenDay ? "Close" : "Set Date"}
          onPress={() => {
            showVenueOpenTime(false);
            showVenueOpenDay(!_showVenueOpenDay);
          }}
        />

        <Button
          title={_showVenueOpenTime ? "Close" : "Set Time"}
          onPress={() => {
            showVenueOpenDay(false);
            showVenueOpenTime(!_showVenueOpenTime);
          }}
        />
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
          />
        </View>
      )}

      <View style={centeredRow}>
        <Text style={h5Style}>{format(_venueOpenTime, "PPPPp")}</Text>
      </View>

      <Text style={h3Style}>Game Options</Text>

      <Text style={h4Style}>Games</Text>

      <ButtonGroup
        buttons={gameOptions}
        selectedIndex={_gameSelectedIndex}
        onPress={(index) => selectGameIndex(index)}
      />

      <Text style={h4Style}>Stakes</Text>

      <ButtonGroup
        buttons={stakeOptions}
        selectedIndex={_stakeOptionIndex}
        onPress={(index) => selectStakeOption(index)}
      />

      <Text style={h4Style}>Straddles</Text>

      <ButtonGroup
        buttons={renderStraddleButtons(
          straddleOptions,
          _straddleIndexes,
          straddleIndexes,
          "straddleOptions"
        )}
        selectMultiple
        selectedIndexes={_straddleIndexes}
      />
      <View style={vs30} />
      <Text style={h5Style}>Seats: {_seats}</Text>

      <Slider
        value={_seats}
        step={1}
        maximumValue={10}
        onValueChange={(s) => setSeats(s)}
      />
      <View style={vs30} />
      <Text style={h3Style}>Venue</Text>
      <Text style={h4Style}>Building</Text>
      <ButtonGroup
        buttons={venueOptions}
        selectedIndex={_venueOption}
        onPress={(index) => setVenueOption(index)}
      />
      <Text style={h4Style}>Dealer</Text>
      <ButtonGroup
        buttons={dealerOptions}
        selectedIndex={_dealerOption}
        onPress={(index) => setDealerOption(index)}
      />

      <Text style={h4Style}>Smoking</Text>

      <ButtonGroup
        buttons={smokingOptions}
        selectedIndex={_smokingOption}
        onPress={(index) => setSmokingOption(index)}
      />

      <Text style={h4Style}>Drinking</Text>
      <Text style={h6Style}>Provided</Text>
      <ButtonGroup
        buttons={renderStraddleButtons(
          drinkingOptionsProvided,
          _drinkingOptionsProvided,
          setDrinkingOptionsProvided,
          "drinkingOptionsProvided"
        )}
        selectMultiple
        selectedIndexes={_drinkingOptionsProvided}
      />
      <Text style={h6Style}>For Purchase</Text>

      <ButtonGroup
        buttons={renderStraddleButtons(
          drinkingOptionsAvailable,
          _drinkingOptionsAvailable,
          setDrinkingOptionsAvailable,
          "drinkingOptionsAvailable"
        )}
        selectMultiple
        selectedIndexes={_drinkingOptionsAvailable}
      />
      <View style={vs30} />
      <Button
        title="Invite Members"
        icon={{
          name: "add",
          size: 15,
          color: "white",
        }}
        raised
        onPress={saveGame}
      />
      <View style={vs30} />
    </ScrollView>
  );
};

export default CreateGameScreen;
