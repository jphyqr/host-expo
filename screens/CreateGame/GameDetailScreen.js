import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  Button as BoringButton,
  StyleSheet,
} from "react-native";
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
  hybridText,
  vs10,
} from "../../styles/styles";
import {
  Input,
  ButtonGroup,
  Button,
  CheckBox,
  Slider,
} from "react-native-elements";
import { MultipleSelectPicker } from "react-native-multi-select-picker";
import RNPickerSelect from "react-native-picker-select";

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

const GameDetailScreen = ({ route, navigation }) => {
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
  const [_showDrinksAvailable, setShowDrinksAvailable] = useState(false);
  const [_showDrinksProvided, setShowDrinksProvided] = useState(false);
  const firestore = firebase.firestore();
  const [_loading, loading] = useState(true);
  const dispatch = useDispatch();

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
      const { gameSettings, seating } = xGame || {};

      const {
        dealer,
        drinksAvailable,
        drinksProvided,
        smoking,
        venue,
      } = gameSettings;
      setDrinkingOptionsAvailable(drinksAvailable);
      setDrinkingOptionsProvided(drinksProvided);

      setSmokingOption(smoking);
      setVenueOption(venue);
      setDealerOption(dealer);
    }

    loading(false);
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

  const venueRef = useRef(false);
  const dealerRef = useRef(false);
  const smokingRef = useRef(false);
  const drinksProvidedRef = useRef(false);
  const drinksAvailableRef = useRef(false);

  useEffect(() => {
    const updateDrinksAvailable = async () => {
      await saveGameSettings("drinksAvailable", _drinkingOptionsAvailable);
    };

    if (drinksAvailableRef.current) updateDrinksAvailable();
    else drinksAvailableRef.current = true;
  }, [_drinkingOptionsAvailable]);

  useEffect(() => {
    const updateDrinksProvided = async () => {
      await saveGameSettings("drinksProvided", _drinkingOptionsProvided);
    };

    if (drinksProvidedRef.current) updateDrinksProvided();
    else drinksProvidedRef.current = true;
  }, [_drinkingOptionsProvided]);

  useEffect(() => {
    const updateVenue = async () => {
      await saveGameSettings("venue", _venueOption);
    };

    if (venueRef.current) updateVenue();
    else venueRef.current = true;
  }, [_venueOption]);

  useEffect(() => {
    const updateDealer = async () => {
      await saveGameSettings("dealer", _dealerOption);
    };

    if (dealerRef.current) updateDealer();
    else dealerRef.current = true;
  }, [_dealerOption]);

  useEffect(() => {
    const updateSmoking = async () => {
      await saveGameSettings("smoking", _smokingOption);
    };

    if (smokingRef.current) updateSmoking();
    else smokingRef.current = true;
  }, [_smokingOption]);

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

  const renderOptionString = (title, arr) => {
    let string = `${title}:`;

    for (const item of arr) {
      string = string + " " + item.value;
    }

    if (arr.length === 0) string = string + "none";

    return string;
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
        <Text style={h5Style}>Building</Text>
        <RNPickerSelect
          style={pickerSelectStyles}
          value={_venueOption}
          onValueChange={(value) => setVenueOption(value)}
          items={[
            { label: "Condo", value: "Condo" },
            { label: "Business", value: "Business" },
            { label: "Casino", value: "Casino" },
            { label: "House", value: "House" },
            { label: "Business", value: "Business" },
            { label: "Club", value: "Club" },
            { label: "Garage", value: "Garage" },
          ]}
        />
      </View>
      <View style={vs10} />
      <View style={spacedRow}>
        <Text style={h5Style}>Dealer</Text>
        <RNPickerSelect
          style={pickerSelectStyles}
          value={_dealerOption}
          onValueChange={(value) => setDealerOption(value)}
          items={[
            { label: "Professional", value: "Professional" },
            { label: "Amateur", value: "Amateur" },
            { label: "None", value: "None" },
          ]}
        />
      </View>
      <View style={vs10} />
      <View style={spacedRow}>
        <Text style={h5Style}>Smoking</Text>
        <RNPickerSelect
          style={pickerSelectStyles}
          value={_smokingOption}
          onValueChange={(value) => setSmokingOption(value)}
          items={[
            { label: "At table", value: "At table" },
            { label: "Inside", value: "Inside" },
            { label: "Outside", value: "Outside" },
            { label: "None", value: "None" },
          ]}
        />
      </View>
      <View style={vs10} />
      <View style={spacedRow}>
        <Text style={h5Style}>Beverages</Text>
        <TouchableOpacity onPress={() => setShowDrinksProvided(true)}>
          <Text style={hybridText}>
            {renderOptionString("Provided", _drinkingOptionsProvided)}
          </Text>
        </TouchableOpacity>
        {_showDrinksProvided && (
          <Button title="close" onPress={() => setShowDrinksProvided(false)} />
        )}
      </View>

      {_showDrinksProvided ? (
        <MultipleSelectPicker
          items={["Water", "Coffee", "Tea", "Pop", "Beer", "Wine"]}
          onSelectionsChange={(ele) => setDrinkingOptionsProvided(ele)}
          selectedItems={_drinkingOptionsProvided}
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
        <Text style={h5Style}>Beverages</Text>
        <TouchableOpacity onPress={() => setShowDrinksAvailable(true)}>
          <Text style={hybridText}>
            {renderOptionString("Available", _drinkingOptionsAvailable)}
          </Text>
        </TouchableOpacity>
        {_showDrinksAvailable && (
          <Button title="close" onPress={() => setShowDrinksAvailable(false)} />
        )}
      </View>

      {_showDrinksAvailable ? (
        <MultipleSelectPicker
          items={["Water", "Coffee", "Tea", "Pop", "Beer", "Wine"]}
          onSelectionsChange={(ele) => setDrinkingOptionsAvailable(ele)}
          selectedItems={_drinkingOptionsAvailable}
          buttonStyle={{
            height: 100,
            justifyContent: "center",
            alignItems: "center",
          }}
          buttonText="hello"
          checkboxStyle={{ height: 20, width: 20 }}
        />
      ) : null}

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
export default GameDetailScreen;
