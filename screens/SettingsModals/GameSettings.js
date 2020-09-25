import React from "react";
import { View, Text, ActivityIndicator, Button } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import _ from "lodash";
import firebase from "../../firebase";
import { SET_GAME } from "../../constants/reducerConstants";
const GameSettings = ({ navigation }) => {
  const xGame = useSelector((state) => state.game || {});
  const dispatch = useDispatch();
  if (_.isEmpty(xGame)) return <ActivityIndicator />;
  return (
    <View>
      <Text>Group</Text>
      <Text>{xGame?.gameSettings?.title}</Text>

      {xGame.hostUid === firebase.auth().currentUser.uid && (
        <Button
          title='Manage Game'
          onPress={() => {
            navigation.navigate("CreateGameFlow", {
              hostUid: xGame.hostUid,
              gameState: xGame.gameState,
              gameName: "test", // _game.gameSettings.title,
              isPlaying:
                xGame.seating.filter(
                  (s) => s.uid === firebase.auth().currentUser.uid
                ).length > 0,
            });
          }}
        />
      )}

      <Button
        title='view game'
        onPress={() => {
          navigation.navigate("GameScreen", {
            hostUid: xGame.hostUid,
            gameState: xGame.gameState,
            gameName: xGame.gameSettings.title,
          });
        }}
      />
    </View>
  );
};

export default GameSettings;
