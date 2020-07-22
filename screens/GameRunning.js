import React, { useState, useEffect } from "react";
import { View, Text, Alert } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import firebase from "../firebase";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import _ from "lodash";
import DateTimePicker from "@react-native-community/datetimepicker";

import { Button, ListItem, Overlay } from "react-native-elements";
import { moneyText, h5Style, vs30, spacedRow } from "../styles/styles";
import { SET_GAME, UPDATE_GAME_S } from "../constants/reducerConstants";
import { format } from "date-fns";
const GameRunning = () => {
  const xGame = useSelector((state) => state.game || {});
  const firestore = firebase.firestore();
  const auth = useSelector((state) => state.firebase.auth || {});
  const [_showSeatRequest, setShowSeatRequest] = useState(false);
  const [_joinGameTime, setJoinGameTime] = useState(new Date(Date.now()));
  const [_seatIndexRequested, setSeatIndexRequested] = useState(-1);
  const [_loading, loading] = useState(false);
  const [_game, setGame] = useState({});
  const dispatch = useDispatch();
  const handleRequestSeat = async () => {
    try {
      loading(true);

      //take the seat as requested

      let updatedGame = { ...xGame };
      let updatedSeating = updatedGame.seating || [];

      updatedSeating[_seatIndexRequested] = {
        bookedOn: Date.now(),
        seatName: `Seat ${_seatIndexRequested + 1}`,
        taken: true,
        requested: true,
        displayName: auth.displayName,
        holdTime: format(_joinGameTime, "PPPPp"),
        photoURL: auth.photoURL,
        uid: auth.uid,
      };

      updatedGame.seating = updatedSeating;

      dispatch({ type: SET_GAME, payload: updatedGame });
      dispatch({ type: UPDATE_GAME_S, payloda: updatedGame });
      await firestore.collection("games").doc(xGame.id).update({
        seating: updatedSeating,
      });

      Alert.alert(
        "Seat Requested",
        "Seat has been requsted",
        [{ text: "OK", onPress: () => setShowSeatRequest(false) }],
        { cancelable: false }
      );
      //notify host
      //if host declines then clear seat

      loading(false);
    } catch (error) {
      loading(false);
      console.log("error in handleRequestSeat", error);
    }
  };

  useEffect(() => {
    if (!_.isEmpty(xGame)) setGame(xGame);
  }, [xGame]);

  if (_.isEmpty(xGame) || auth.isEmpty) return <ActivityIndicator />;
  return (
    <View>
      {_game?.seating?.filter((s) => s.uid === auth.uid && s.requested).length >
      0 ? (
        <Text> You have Requested a Seat</Text>
      ) : _game?.seating?.filter((s) => s.uid === auth.uid && !s.requested)
          .length > 0 ? (
        <Text> You Are in Game</Text>
      ) : (
        <View>
          {_showSeatRequest && (
            <Overlay fullScreen>
              <View style={vs30} />
              <Text style={h5Style}>{`Requst seat ${
                _seatIndexRequested + 1
              } for`}</Text>
              <View style={vs30} />
              <DateTimePicker
                testID="dateTimePicker"
                value={_joinGameTime}
                mode={"time"}
                is24Hour={false}
                display="default"
                onChange={(e, d) => setJoinGameTime(d)}
                minimumDate={new Date(Date.now())}
              />
              <View style={spacedRow}>
                <Button
                  onPress={() => setShowSeatRequest(false)}
                  title="Cancel"
                  type="outline"
                ></Button>

                <Button
                  onPress={handleRequestSeat}
                  title="Send Request"
                  loading={_loading}
                ></Button>
              </View>
            </Overlay>
          )}

          {_game?.seating?.map((u, i) => {
            return u.taken === true ? (
              <ListItem
                key={i}
                roundAvatar
                subtitle={<Text>{`${u.requested ? "Requested" : ""}`}</Text>}
                leftIcon={
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Icon name="seat" type="material" size={20} color="grey" />
                    <Text style={[moneyText, { color: "grey" }]}>{i + 1}</Text>
                  </View>
                }
                containerStyle={{}}
                title={u.displayName || "Open Seat"}
                leftAvatar={{ source: { uri: u?.photoURL } }}
              />
            ) : (
              <Button
                type="clear"
                title={`Request seat ${i + 1}`}
                key={i}
                onPress={() => {
                  setSeatIndexRequested(i);
                  setShowSeatRequest(true);
                }}
              ></Button>
            );
          })}

          {_game?.seating?.filter((s) => s.taken === false).length === 0 && (
            <Button title="Request Waitlist"></Button>
          )}
        </View>
      )}
    </View>
  );
};

export default GameRunning;
