import React, { useEffect, useMemo, useCallback, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import {
  Avatar,
  Card,
  ListItem,
  Badge,
  Overlay,
  Image,
} from "react-native-elements";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
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
          width: 140,
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
    <TouchableOpacity
      key={i}
      onPress={() =>
        navigation.navigate("ChatScreen", {
          channelName: _game.gameSettings.title,
          channelPhotoURL: _game.groupPhotoURL,
          channelMembers: {},
          channelType: CHANNEL_TYPE.GAME,
          channelId: _game.id,
        })
      }
      onLongPress={() => {
        dispatch({ type: SET_GAME, payload: _game });

        navigation.navigate("MyModal", {
          channelType: CHANNEL_TYPE.GAME,
        });
      }}
    >
      <Card
        containerStyle={{
          width: 140,
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
        <View>
          {/* {_game.hostUid === auth.uid && (
            <Badge
              value={
                <View style={{ flexDirection: "row" }}>
                  <Icon
                    name="shield-account"
                    type="material"
                    size={15}
                    color="white"
                  />
                </View>
              }
              badgeStyle={{
                backgroundColor: "lightgrey",
              }}
              badgeStyle={{
                height: 25,
                width: 25,
                borderRadius: 50,
                backgroundColor: "grey",
              }}
              containerStyle={{
                position: "absolute",
                top: 5,
                right: -10,
              }}
            />
          )} */}

          {/* <Badge
            status={"primary"}
            value={
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon name="cards" type="material" size={25} color="white" />

                <Text style={[h7Style, { color: "white" }]}>
                  {_game.gameSettings?.stakes} {_game.gameSettings?.game}
                </Text>
              </View>
            }
            textStyle={{
              color: "white",
              fontSize: 20,
            }}
            badgeStyle={{
              width: 102,
              backgroundColor: "crimson",
              borderRadius: 0,
              height: 30,
            }}
            containerStyle={{
              position: "absolute",
              bottom: -45,
              left: -3,
              width: 102,
              borderRadius: 0,
              zIndex: 30,
            }}
          /> */}
          {/* 
          <Badge
            status={"primary"}
            value={_game.groupName}
            textStyle={{
              color: "white",
              fontSize: 14,
            }}
            badgeStyle={{
              width: 103,
              backgroundColor: "grey",
              borderRadius: 0,
              height: 20,
            }}
            containerStyle={{
              position: "absolute",
              top: -15,
              left: -4,
              width: 103,
              borderRadius: 0,
            }}
          /> */}
          {/* 
          <Badge
            status={"success"}
            value={
              <View style={{ flexDirection: "row" }}>
                <Icon
                  name={
                    _game.gameState.includes("RUNNING")
                      ? "cards"
                      : _game.gameState.includes("REGISTRATION")
                      ? "clipboard-text"
                      : "lock"
                  }
                  type="material"
                  size={20}
                  color="white"
                />
              </View>
            }
            badgeStyle={{
              height: 25,
              width: 25,
              borderRadius: 50,
            }}
            containerStyle={{
              position: "absolute",
              top: 5,
              left: -10,
            }}
          /> */}

          {/* {_game.gameState.includes("HIDDEN") ||
            (_game.gameState.includes("PRIVATE") && (
              <Badge
                value={
                  <View style={{ flexDirection: "row" }}>
                    <Icon
                      name={
                        _game.gameState.includes("HIDDEN")
                          ? "eye-off"
                          : _game.gameState.includes("PRIVATE")
                          ? "lock"
                          : "eye-check"
                      }
                      type="material"
                      size={20}
                      color="white"
                    />
                  </View>
                }
                badgeStyle={{
                  height: 25,
                  width: 25,
                  borderRadius: 50,
                }}
                status={"warning"}
                containerStyle={{
                  position: "absolute",
                  top: 5,
                  right: 10,
                }}
              />
            ))} */}
          <View style={[spacedRow]}>
            <MemoAvatar
              label={_game.groupName}
              rounded
              source={{ uri: _game?.groupPhotoURL }}
              updateOn={_game?.groupPhotoURL}
              size="small"
              overlayContainerStyle={{ backgroundColor: "blue" }}
            />

            <Text style={[h5Style]}>
              {_game.gameSettings.stakes} {_game.gameSettings.game}
            </Text>
          </View>

          <View style={vs10} />

          <View style={{ flexDirection: "row" }}>
            <Icon
              name="shield-account"
              type="material"
              size={15}
              color="grey"
            />

            <Text style={h6Style}>{_game.hostedBy}</Text>
          </View>

          <View style={spacedRow}>
            <View style={{ flexDirection: "row" }}>
              <Icon
                name="calendar-clock"
                type="material"
                size={15}
                color="grey"
              />

              <Text style={h6Style}>
                {format(
                  parse(_game.gameSettings.venueOpenTime, "PPPPp", new Date()),
                  "EEE/MMM/d"
                )}
              </Text>
            </View>
            <Text style={h6Style}>
              {formatDistance(
                new Date(Date.now()),
                new Date(
                  parse(_game.gameSettings.venueOpenTime, "PPPPp", new Date())
                ),
                { includeSeconds: false }
              )}
            </Text>
            <View style={{ flexDirection: "row" }}>
              <Icon
                name="clock-outline"
                type="material"
                size={15}
                color={_game.gameState.includes("RUNNING") ? "orange" : "grey"}
              />

              {_game.gameState.includes("RUNNING") ? (
                <Text style={[h6Style, { color: "orange" }]}>
                  {formatDistance(
                    new Date(Date.now()),
                    new Date(
                      parse(
                        _game.gameSettings.venueOpenTime,
                        "PPPPp",
                        new Date()
                      )
                    ),
                    { includeSeconds: false }
                  )}
                </Text>
              ) : (
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
              )}
            </View>
          </View>

          <View style={{ flexDirection: "row" }}>
            {_game.gameState.includes("RUNNING") && (
              <Icon name="poker-chip" type="material" size={15} color="green" />
            )}

            {_game.gameState.includes("RUNNING") ? (
              <Text style={[h6Style, { color: "green" }]}>
                {_game.chipsInPlay}
              </Text>
            ) : (
              <Text style={[h6Style]}>Join!</Text>
            )}
          </View>

          <View>
            {_game.seating?.map((u, i) => {
              return (
                <Text
                  key={i}
                  style={[h6Style, { color: u.requested ? "red" : "grey" }]}
                >
                  {i + 1}. {u.displayName} {u.requested ? "(R)" : ""}{" "}
                  {u.late ? `+${u.late}m` : ""}
                </Text>
              );
            })}

            {renderSpaceHolders()}
          </View>

          <Text style={h6Style}>{`Wait list: ${
            _game?.waitList?.length || 0
          }`}</Text>

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
          {_.isEmpty(_game) ? (
            <ActivityIndicator />
          ) : (
            <ChatPreview gameId={_game?.id} />
          )}
          {/* </TouchableOpacity> */}

          <TouchableOpacity
            onPress={async () => {
              handleClickGame(_game);
              navigation.navigate("SnapScreen", {
                destinationId: _game.id,
              });
            }}
          >
            {_game.lastSnapPhotoURL ? (
              <Image
                containerStyle={{
                  backgroundColor: "white",
                  // borderWidth: 3,
                  // borderColor: _game.testChange ? "orange" : "red",
                }}
                source={{ uri: _game.lastSnapPhotoURL }}
                style={{ width: 140, height: 140 }}
                PlaceholderContent={<ActivityIndicator />}
              />
            ) : (
              <Image
                containerStyle={{
                  backgroundColor: "white",
                  // borderWidth: 3,
                  // borderColor: _game.testChange ? "orange" : "red",
                }}
                placeholderStyle={{
                  backgroundColor: "white",
                }}
                source={{ uri: _game.lastSnapPhotoURL }}
                style={{ width: 140, height: 140 }}
              />
            )}
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

export default GameCard;
