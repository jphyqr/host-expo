import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { h2Style, h7Style } from "../styles/styles";

const GameSummary = ({ game }) => {
  const { gameSettings, seating } = game;
  const {
    title,
    venueOpenTime,
    game: gameType,
    stakes,
    straddles,
    drinksAvailable,
    drinksProvided,
    smoking,
    venue,
  } = gameSettings;

  const listToString = (list) => {
    let string = "";

    for (const item of list) {
      string = string + item + ", ";
    }
    return string.substring(0, string.length - 2);
  };

  return (
    <View>
      <Text style={h2Style}>GameSummary</Text>
      <Text style={h7Style}>{title}</Text>
      <Text style={h7Style}>{venueOpenTime}</Text>
      <Text style={h7Style}>Venue: {venue}</Text>
      <Text style={h7Style}>Seats: {seating.length}</Text>
      <Text style={h7Style}>
        {stakes} {gameType}
      </Text>
      <Text style={h7Style}>{`Straddles: ${listToString(straddles)}`}</Text>

      <Text style={h7Style}>{`Drinks Provided: ${listToString(
        drinksProvided
      )}`}</Text>
      <Text style={h7Style}>{`Drinks Available: ${listToString(
        drinksAvailable
      )}`}</Text>
      <Text style={h7Style}>Smoking: {smoking}</Text>
    </View>
  );
};

export default GameSummary;
