import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ViewComponent,
  Dimensions,
} from "react-native";
import { TouchableOpacity, ScrollView } from "react-native-gesture-handler";
import StoryAvatar from "../StoryAvatar";
import {
  SET_MEMBER_OF_GROUP,
  UPDATE_GAME_S,
  UPDATE_GAME,
  SET_GAME,
  MOVE_MEMBER,
  RETURN_MEMBER,
  REGISTER_WAIT_DROP_ZONE,
} from "../../constants/reducerConstants";
import PokerSeat from "./PokerSeat";
import MemoAvatar from "../MemoAvatar";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { Avatar } from "react-native-elements";
import { useDispatch, useSelector } from "react-redux";
import { useRefDimensions } from "../../hooks/panHooks";
import { tenPlayerPositions } from "../../constants/helperConstants";
import OpenSeat from "./OpenSeat";
import firebase from "../../firebase";
import _ from "lodash";
import UnseatedPlayer from "./UnseatedPlayer";
import { vs30, h5Style } from "../../styles/styles";
import { groupReducer } from "../../reducers/groupsReducer";
import Slider from "./Slider";
const PokerTable = ({ navigation }) => {
  const dispatch = useDispatch();

  const frontOfListRef = useRef(null);
  const xGame = useSelector((state) => state.game || {});

  useEffect(() => {
    const unsubscribe = () => {
      setGame(xGame);

      if (xGame?.members) {
        let gMs = [];
        let keys = Object.keys(xGame.members) || [];
        //   .filter((m) => xGame.seating.filter((s) => s.uid === m).length === 0)
        //   .filter((m) => xGame.waitList.filter((w) => w.uid === m).length === 0)
        //   .slice(_groupPage * 3, 3 * _groupPage + 3);

        if (xGame.seating)
          keys = keys.filter(
            (m) => xGame.seating.filter((s) => s.uid === m).length === 0
          );

        if (xGame.waitList)
          keys = keys.filter(
            (m) => xGame.waitList.filter((w) => w.uid === m).length === 0
          );

        for (const key of keys) {
          gMs.push({ uid: key, ...xGame.members[`${key}`] });
        }

        setGroupMembers(gMs);
      }

      uC(_uC + 1);
    };
    return unsubscribe();
  }, [xGame]);

  useEffect(() => {
    console.log("group change");
  }, [_groupPage]);
  const changePage = (page) => {
    setGroupPage(page);
    console.log("group change", page);
    console.log("group change");
    let gMs = [];
    let keys = Object.keys(xGame.members) || [];
    //   .filter((m) => xGame.seating.filter((s) => s.uid === m).length === 0)
    //   .filter((m) => xGame.waitList.filter((w) => w.uid === m).length === 0)
    //   .slice(_groupPage * 3, 3 * _groupPage + 3);

    if (xGame.seating)
      keys = keys.filter(
        (m) => xGame.seating.filter((s) => s.uid === m).length === 0
      );

    if (xGame.waitList)
      keys = keys.filter(
        (m) => xGame.waitList.filter((w) => w.uid === m).length === 0
      );

    keys = keys.slice(_groupPage * 3, 3 * _groupPage + 3);
    for (const key of keys) {
      gMs.push({ uid: key, ...xGame.members[`${key}`] });
    }

    setGroupMembers(gMs);
    console.log("GROUP PAGE CHANGED", _groupPage, gMs);
    uC(_uC + 1);
  };
  //useEffect(() => {
  // console.log("group change");
  // let gMs = [];
  // let keys = Object.keys(xGame.members)
  //   .filter((m) => xGame.seating.filter((s) => s.uid === m).length === 0)
  //   .filter((m) => xGame.waitList.filter((w) => w.uid === m).length === 0)
  //   .slice(_groupPage * 3, 3 * _groupPage + 3);

  // for (const key of keys) {
  //   gMs.push({ uid: key, ...xGame.members[`${key}`] });
  // }

  // setGroupMembers(gMs);
  // console.log("GROUP PAGE CHANGED", _groupPage, gMs);
  // uC(_uC + 1);
  //}, [_groupPage]);

  const [_groupMembers, setGroupMembers] = useState([]);

  const [game, setGame] = useState({});
  const firestore = firebase.firestore();
  const xDragX = useSelector((state) => state.touch.x);
  const xDragY = useSelector((state) => state.touch.y);
  const xDropped = useSelector((state) => state.touch.dropped);
  const xMember = useSelector((state) => state.memberOfGroup);
  const xTouched = useSelector((state) => state.touch.touched || false);
  const xDisplacement = useSelector((state) => state.touch.displacement || 0);
  const [_uC, uC] = useState(0);
  const xIndex = useSelector((state) => state.touch.index || -1);
  const openSeatLocations = useSelector(
    (state) => state.touch.openSeatLocations || {}
  );
  const waitDropZones = useSelector((state) => state.touch.waitDropZones || {});

  const [_groupPage, setGroupPage] = useState(0);

  useEffect(() => {
    const unsubscribe = () => {
      if (xDropped) {
        //CHECK IF HIT OPEN SEAT

        if (xDisplacement < 30) {
          console.log("no displacement", xMember);
          navigation.navigate("PIGModal", {
            title: xMember.displayName,
          });
        }

        setTimeout(() => {
          Object.keys(openSeatLocations).map((seat, i) => {
            const location = openSeatLocations[`${seat}`];
            if (
              xDragX > location.LEFT &&
              xDragX < location.RIGHT &&
              xDragY < location.BOTTOM &&
              xDragY > location.TOP
            ) {
              // console.log("CHANGE SEAT To for index", location);

              updateSeating(location.seatIndex);
              dispatch({ type: RETURN_MEMBER, payload: false });

              console.log("FOUND A DROP, EXIT");
              return;
            } else {
            }
          });
          //CHECK IF HIT WAIT ZONE
          console.log("WAIT DROP ZONES", waitDropZones);
          Object.keys(waitDropZones).map((waitIndex, i) => {
            const location = waitDropZones[`${waitIndex}`];
            if (
              xDragX > location.LEFT &&
              xDragX < location.RIGHT &&
              xDragY < location.BOTTOM &&
              xDragY > location.TOP
            ) {
              // console.log("CHANGE SEAT To for index", location);

              //   updateSeating(location.seatIndex);
              //  dispatch({ type: RETURN_MEMBER, payload: false });

              console.log("FOUND A WAIT DROP DROP", waitIndex);
              addPlayerToWaitList(waitIndex);
              return;
            } else {
            }
          });

          console.log("WAS A BAD DROP");

          dispatch({ type: RETURN_MEMBER, payload: true });
          // dispatch({
          //   type: SET_MEMBER_OF_GROUP,
          //   payload: xMember,
          // });
          // navigation.navigate("PIGModal", {
          //   title: xMember.displayName,
          // });

          uC(_uC + 1);
        }, 200);
      }
    };

    return unsubscribe();
  }, [xDropped]);

  const addPlayerToWaitList = async (waitIndex) => {
    try {
      let updatedGame = game;
      let updatedWaitList = updatedGame.waitList || [];

      //if player was on waitlist remove him
      let indexOnWaitList = -1;
      indexOnWaitList = updatedWaitList.findIndex((i) => i.uid === xMember.uid);
      if (indexOnWaitList > -1) {
        updatedWaitList.splice(indexOnWaitList, 1);
      }

      console.log("addPlayerToWaitList at", waitIndex);
      if (waitIndex === 0) updatedWaitList = [xMember, ...updatedWaitList];
      else updatedWaitList.splice(waitIndex, 0, xMember);
      updatedGame.waitList = updatedWaitList;

      console.log({ updatedWaitList });

      // console.log("updated seating", updatedSeating);
      dispatch({ type: UPDATE_GAME_S, payload: updatedGame });

      dispatch({ type: SET_GAME, payload: updatedGame });
      await firestore.collection("games").doc(game.id).set(updatedGame);
      uC(_uC + 1);
    } catch (error) {
      console.log("error adding to wait list", error);
    }
  };

  const registerDropZone = () => {
    frontOfListRef?.current?.measure((x, y, w, h, pX, pY) => {
      let boundaries = {
        LEFT: pX,
        RIGHT: pX + w,
        TOP: pY,
        BOTTOM: pY + h,
      };
      console.log("REGISTERING INITAL WAIT DROP ZONE");
      dispatch({
        type: REGISTER_WAIT_DROP_ZONE,
        payload: { waitIndex: 0, boundaries: boundaries },
      });
    });
  };

  const updateSeating = async (moveIndex) => {
    try {
      let updatedGame = game;
      let updatedSeating = updatedGame.seating || [];
      let updatedWaitList = updatedGame.waitList || [];
      //if player was sitting in a seat, clear that seat.
      let passonRequested;
      let indexOfCurrent = -1;
      indexOfCurrent = updatedSeating.findIndex((i) => i.uid === xMember.uid);

      //   console.log(xMember, indexOfCurrent);
      if (indexOfCurrent > -1) {
        passonRequested = updatedSeating[indexOfCurrent].requested;
        updatedSeating[indexOfCurrent] = { taken: false };
      }

      //if player was on waitlist remove him
      let indexOnWaitList = -1;
      indexOnWaitList = updatedWaitList.findIndex((i) => i.uid === xMember.uid);

      if (indexOnWaitList > -1) {
        updatedWaitList.splice(indexOnWaitList, 1);
      }

      updatedSeating[moveIndex] = {
        taken: true,
        displayName: xMember.displayName,
        photoURL: xMember.photoURL,
        uid: xMember.uid,
        bookedOn: Date.now(),
        requested: passonRequested || false,
      };
      updatedGame.seating = updatedSeating;
      updatedGame.waitList = updatedWaitList;

      // console.log("updated seating", updatedSeating);
      dispatch({ type: UPDATE_GAME_S, payload: updatedGame });

      dispatch({ type: SET_GAME, payload: updatedGame });
      await firestore.collection("games").doc(game.id).set(updatedGame);
      uC(_uC + 1);
    } catch (error) {
      console.log("error moving seat", error);
    }
  };

  if (_.isEmpty(game) || _.isEmpty(xGame)) return <ActivityIndicator />;

  return (
    <View>
      <View
        style={{
          position: "relative",
          width: 400,
          height: 200,
          borderRadius: 100,
          backgroundColor: "grey",
          borderColor: "brown",
          borderWidth: 20,
          padding: 20,
        }}
      >
        {game.seating.map((seat, i) => {
          return (
            <View
              key={i}
              style={{
                position: "absolute",
                top: tenPlayerPositions[i].top,
                left: tenPlayerPositions[i].left,
              }}
            >
              {seat.taken ? (
                <View style={{ position: "relative" }}>
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                  >
                    <MemoAvatar
                      containerStyle={{
                        borderRadius: 100,
                        borderWidth: 5,
                        borderColor: "black",
                        backgroundColor: "green",
                        opacity: 0.5,
                      }}
                      updateOn={xTouched}
                      imageStyle={{
                        backgroundColor: "orange",
                      }}
                      size='large'
                      rounded
                      icon={{ name: "event-seat" }}
                    />
                  </View>

                  <PokerSeat
                    taken={game.seating[i].taken}
                    seatingIndex={i}
                    name={game.seating[i].displayName}
                    member={{
                      uid: game.seating[i].uid,
                      ...game.members[`${game.seating[i].uid}`],
                    }}
                    rounded
                    source={{ uri: game.seating[i].photoURL }}
                    updateOn={game.seating[i].photoURL}
                    size='large'
                    playerPressed={() => {
                      dispatch({
                        type: SET_MEMBER_OF_GROUP,
                        payload: game.seating[i],
                      });
                      navigation.navigate("PIGModal", {
                        title: game.seating[i].displayName,
                      });
                    }}
                    overlayContainerStyle={{ backgroundColor: "blue" }}
                  />
                </View>
              ) : (
                <OpenSeat
                  seatIndex={i}
                  top={tenPlayerPositions[i].top}
                  left={tenPlayerPositions[i].left}
                />
              )}
            </View>
          );
        })}
      </View>
      <View style={vs30} />
      <View style={vs30} />
      <Text style={h5Style}>Wait List</Text>
      <View style={{ paddingLeft: 20, flexDirection: "row", flexWrap: "wrap" }}>
        <View
          ref={frontOfListRef}
          onLayout={(event) => {
            setTimeout(() => registerDropZone(), 200);
          }}
          style={{
            width: 50,
            height: 50,
            paddingRight: 20,
            backgroundColor: "yellow",

            borderColor: "black",
            borderWidth: 1,
            opacity: xTouched ? 1 : 0,
            zIndex: 10,
          }}
        ></View>

        {game.waitList?.map((player, i) => {
          return (
            <UnseatedPlayer
              waitlist={true}
              waitIndex={i}
              key={i}
              name={player.displayName}
              member={player}
              rounded
              source={{ uri: player.photoURL }}
              updateOn={player.photoURL}
              size='medium'
              playerPressed={() => {
                dispatch({
                  type: SET_MEMBER_OF_GROUP,
                  payload: player,
                });
                navigation.navigate("PIGModal", {
                  title: player.displayName,
                });
              }}
              overlayContainerStyle={{ backgroundColor: "blue" }}
            />
          );
        })}
      </View>
      <Text style={h5Style}>Group List</Text>
      <View
        style={{ alignItems: "center", flexDirection: "row", flexWrap: "wrap" }}
      >
        <Slider
          items={_groupMembers}
          sliderWidth={Dimensions.get("screen").width}
          itemWidth={50}
          gutter={20}
        />
      </View>
    </View>
  );
};

export default PokerTable;
