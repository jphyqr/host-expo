import React, { useEffect, useMemo, useCallback, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import {
  Avatar,
  Card,
  ListItem,
  Badge,
  Overlay,
  Image,
  Button,
} from "react-native-elements";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import {
  h7Style,
  vs30,
  spacedRow,
  h6Style,
  h5Style,
  vs10,
  h3Style,
} from "../../styles/styles";
import {
  formatDuration,
  intervalToDuration,
  parse,
  format,
  formatDistance,
} from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { SET_GAME } from "../../constants/reducerConstants";
import firebase from "../../firebase";
import { useFirestoreConnect } from "react-redux-firebase";
import _ from "lodash";
import StoryAvatar from "../StoryAvatar";
import MemoAvatar from "../MemoAvatar";
import { CHANNEL_TYPE } from "../../constants/helperConstants";
import ChatPreview from "./ChatPreview";
const GameCard = ({ auth, id, navigation, i, handleClickGame }) => {
  const dispatch = useDispatch();
  const [_game, setGame] = useState({});
  const firestore = firebase.firestore();
  const [_uC, uC] = useState(-1);

  const gameQuery = useMemo(
    () => ({
      collection: "games",
      doc: id,

      storeAs: `gameDoc_${i}`,
    }),
    [id]
  );

  useFirestoreConnect(gameQuery);

  const gameData = useSelector(
    (state) => state.firestore.ordered[`gameDoc_${i}`]?.[0] || {}
  );

  const getRecordById = async () => {
    console.log("GET RECORD BY ID");
    const recordRef = firestore.collection("games").doc(id);
    let recordSnap = await recordRef.get();
    let record = recordSnap.data();

    setGame({ id: id, ...record });
    uC(_uC + 1);
  };

  useEffect(() => {
    if (!_.isEmpty(id)) getRecordById();
  }, [id]);

  useEffect(() => {
    if (!_.isEmpty(gameData) && !_.isEmpty(id)) getRecordById();
  }, [gameData]);

  const renderSpaceHolders = () => {
    let diff = 10 - _game?.seating?.length;
    console.log("diff", diff);
    console.log("length", _game.seating.length);

    return Array(diff).fill(<Text style={h6Style}> </Text>);
  };

  if (_.isEmpty(_game))
    return (
      <Card
        containerStyle={{
          width: 160,
          margin: 10,
          height: 411,
          marginTop: 0,
          padding: 0,
          backgroundColor: "white",
          borderRadius: 5,
          shadowColor: "#000",
          shadowOffset: { width: 1, height: 2 },
          shadowOpacity: 0.6,
          shadowRadius: 1.5,
          padding: 2,
        }}
      >
        <ActivityIndicator />
      </Card>
    );

  //When a new snap is posted to a group, shuld have a "new" indicator
  //Once a user clicks on the snaps, then on the user specific model should
  //keep track of when they last clicked on specific game Ids
  //Then if they have already clicked on a game ID, change the color
  //to something grey

  return (
    <Card
      containerStyle={{
        width: 160,
        margin: 10,
        marginTop: 0,
        padding: 0,
        backgroundColor: "white",
        borderRadius: 5,
        shadowColor: "#000",
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.6,
        shadowRadius: 1.5,
        padding: 2,
      }}
    >
      <View
        onLayout={(event) => {
          console.log("card height", event.nativeEvent.layout.height);
        }}
      >
        <View style={[spacedRow]}>
          <TouchableOpacity
            onPress={async () => {
              // handleClickGame(_game);
              navigation.navigate("SnapScreen", {
                destinationId: _game.id,
              });
            }}
          >
            {_game.lastSnapPhotoURL ? (
              <StoryAvatar
                label={_game.groupName}
                rounded
                source={{ uri: _game?.lastSnapPhotoURL }}
                updateOn={_game?.lastSnapPhotoURL}
                size='large'
                overlayContainerStyle={{ backgroundColor: "blue" }}
              />
            ) : (
              <StoryAvatar
                label={_game.groupName}
                rounded
                source={{ uri: _game?.groupPhotoURL }}
                updateOn={_game?.groupPhotoURL}
                size='large'
                overlayContainerStyle={{ backgroundColor: "blue" }}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              dispatch({ type: SET_GAME, payload: _game });

              navigation.navigate("GameModal", {
                title: "no title",
              });
            }}
          >
            <View
              style={{
                justifyContent: "space-between",
                width: 75,
                height: 90,
                borderColor: "grey",
                borderWidth: 2,
                borderRadius: 10,
              }}
            >
              <Text style={[h5Style, { color: "black" }]}>
                {_game.gameSettings.stakes} {_game.gameSettings.game}
              </Text>

              <Text style={h7Style}>
                {format(
                  parse(_game.gameSettings.venueOpenTime, "PPPPp", new Date()),
                  "EEE/MMM/d"
                )}
              </Text>

              <View>
                {_game.gameState.includes("RUNNING") ? (
                  <Text
                    style={[
                      h6Style,
                      { width: "100%", textAlign: "center", color: "orange" },
                    ]}
                  >
                    Game Running
                  </Text>
                ) : (
                  <View style={{ flexDirection: "row" }}>
                    <Icon
                      name='clock-outline'
                      type='material'
                      size={15}
                      color={
                        _game.gameState.includes("RUNNING") ? "orange" : "grey"
                      }
                      name={
                        _game.gameState.includes("RUNNING")
                          ? "cards"
                          : "clock-outline"
                      }
                    />

                    <Text style={h6Style}>
                      {format(
                        parse(
                          _game.gameSettings.venueOpenTime,
                          "PPPPp",
                          new Date()
                        ),
                        "p"
                      )}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={vs10} />

        {/* <View style={{ flexDirection: "row" }}>
            <Icon
              name="shield-account"
              type="material"
              size={15}
              color="grey"
            />

            <Text style={h6Style}>{_game.hostedBy}</Text>
          </View> */}

        <View style={spacedRow}>
          {/* <Text style={h6Style}>
              {formatDistance(
                new Date(Date.now()),
                new Date(
                  parse(_game.gameSettings.venueOpenTime, "PPPPp", new Date())
                ),
                { includeSeconds: false }
              )}
            </Text> */}
        </View>

        {/* <View style={{ flexDirection: "row", width:"100%" , flexGrow:1}}>
     
            {_game.gameState.includes("RUNNING") ? (
             
              <Button title="Grab Seat"  onPress={()=>console.log('button press')} containerStyle={{width:"100%"}}  buttonStyle={{backgroundColor:"green"}}/>
            ) : (
              <Button title="Register"  containerStyle={{width:"100%"}} buttonStyle={{backgroundColor:"black"}}/>
            )}
          </View> */}
        <View
          style={{
            position: "relative",
            height: 150,
            borderRadius: 10,
            backgroundColor: "lightgrey",
          }}
        >
          <Icon
            style={{ position: "absolute", opacity: 0.5, right: 0, top: 50 }}
            name='play'
            size={50}
          />

          <ScrollView>
            <TouchableWithoutFeedback
              onPress={() => {
                navigation.navigate("GameScreen", {
                  hostUid: _game.hostUid,
                  gameState: _game.gameState,
                  gameName: _game.gameSettings.title,
                });
              }}
            >
              <View>
                {_game.seating?.map((u, i) => {
                  return (
                    <Text
                      key={i}
                      style={[
                        h5Style,
                        { color: u.requested ? "red" : "black" },
                      ]}
                    >
                      {i + 1}. {u.displayName} {u.requested ? "(R)" : ""}{" "}
                      {u.late ? `+${u.late}m` : ""}
                    </Text>
                  );
                })}

                {_game.waitList?.map((u, i) => {
                  return (
                    <Text
                      key={i}
                      style={[
                        h5Style,
                        { color: u.requested ? "red" : "black" },
                      ]}
                    >
                      Wait{i + 1}. {u.displayName} {u.requested ? "(R)" : ""}{" "}
                      {u.late ? `+${u.late}m` : ""}
                    </Text>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </View>

        {/* <TouchableOpacity
            onPress={() =>
              navigation.navigate("ChatScreen", {
                channelName: _game.gameSettings.title,
                channelPhotoURL: _game.groupPhotoURL,
                channelMembers: {},
                channelType: CHANNEL_TYPE.GAME,
                channelId: _game.id,
              })
            }
          > */}
        <View style={vs10} />
        {_.isEmpty(id) ? (
          <ActivityIndicator />
        ) : (
          <TouchableWithoutFeedback onLongPress={() => console.log("pressed")}>
            <ChatPreview
              gameId={id}
              onWindowPress={() =>
                navigation.navigate("ChatScreen", {
                  channelName: _game.gameSettings.title,
                  channelPhotoURL: _game.groupPhotoURL,
                  channelMembers: {},
                  channelType: CHANNEL_TYPE.GAME,
                  channelId: _game.id,
                })
              }
            />
          </TouchableWithoutFeedback>
        )}
        {/* </TouchableOpacity> */}
      </View>
    </Card>
  );
};

export default GameCard;
