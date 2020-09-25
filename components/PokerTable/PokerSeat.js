import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  PanResponder,
  Animated,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import MemoAvatar from "../MemoAvatar";
import { h6Style, h5Style, moneyText } from "../../styles/styles";
import { renderPlayersStack } from "../../helperFunctions";
import { Avatar } from "react-native-elements";
import { TouchableOpacity } from "react-native-gesture-handler";
import {
  SET_TOUCH,
  SET_DRAG_POSITION,
  REGISTER_OPEN_SEAT,
  CLEAR_TOUCH,
  DROP_MEMBER,
  SET_MEMBER_OF_GROUP,
} from "../../constants/reducerConstants";
import { useDispatch, useSelector } from "react-redux";
import { useRefDimensions } from "../../hooks/panHooks";
import _ from "lodash";
const PokerSeat = ({
  seatingIndex,

  playerPressed,
  member,
  name,
  ...props
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const dispatch = useDispatch();
  const xReturnMember = useSelector((state) => state.touch.returnMember);
  const seatRef = useRef(null);
  //   useEffect(() => {
  //     console.log("dragged X", draggedX);
  //     console.log("dragged y", draggedY);
  //     console.log("seat 8 start", _seat8Dimensions);

  //     if (
  //       Math.abs(draggedX - _seat8Dimensions.x) < 10 &&
  //       Math.abs(draggedY - _seat8Dimensions.y) < 10
  //     )
  //       console.log("DIDNT REALLY MOVE");
  //     else console.log("MOVED");
  //   }, [draggedX, draggedY]);

  const [_member, setMember] = useState({});
  useEffect(() => {
    setMember(member);
  }, [member]);

  useEffect(() => {
    if (xReturnMember) {
      Animated.spring(
        pan, // Auto-multiplexed
        { toValue: { x: 0, y: 0 }, delay: 0 } // Back to zero
      ).start();
    }
  }, [xReturnMember]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          pan.setOffset({
            x: pan.x._value,
            y: pan.y._value,
          });
        },
        onPanResponderMove: (evt, gestureState) => {
          dispatch({
            type: SET_TOUCH,
            payload: { index: seatingIndex, member: member },
          });
          dispatch({
            type: SET_MEMBER_OF_GROUP,
            payload: member,
          });

          return Animated.event([
            null,
            {
              dx: pan.x,
              dy: pan.y,
            },
          ])(evt, gestureState);
        },

        onPanResponderRelease: async (evt, gestureState) => {
          console.log("ON PAN RELEASE");
          dispatch({
            type: SET_DRAG_POSITION,
            payload: {
              x: gestureState.moveX || 0,
              y: gestureState.moveY || 0,
              displacement:
                (Math.abs(gestureState.dx) + Math.abs(gestureState.dy)) | 0,
            },
          });
          dispatch({
            type: DROP_MEMBER,
          });

          pan.flattenOffset();

          // dispatch({ type: SET_TOUCH, payload: false });

          //playerPressed(pan.x, pan.y);
          console.log("EDITING");
        },
        onPanResponderStart: (event, gesture) => {
          console.log("pan started");
        },
      }),
    []
  );

  if (_.isEmpty(_member)) return <ActivityIndicator />;
  return (
    <Animated.View
      style={{
        zIndex: 10,
        borderRadius: 100,
        borderWidth: 5,
        borderColor: "black",
        transform: [{ translateX: pan.x }, { translateY: pan.y }],
      }}
      {...panResponder.panHandlers}
    >
      <View
        ref={seatRef}
        onLayout={(event) => {}}
        style={{
          position: "absolute",
          top: 20,
          backgroundColor: "lightgreen",
          width: "100%",

          flexDirection: "row",
          zIndex: 30,
        }}
      >
        <Icon name='poker-chip' size={24} color='black' />
        <Text
          style={[
            moneyText,
            {
              color: "black",

              textAlign: "center",
            },
          ]}
        >
          {renderPlayersStack(_member.borrowed || [], _member.bought || [])}
        </Text>
      </View>
      <MemoAvatar {...props} />

      <Text
        style={[
          h5Style,
          {
            width: "100%",
            position: "absolute",
            bottom: 0,
            textAlign: "center",
            backgroundColor: "grey",
            color: "white",
          },
        ]}
      >
        {name}
      </Text>
    </Animated.View>
  );
};

export default PokerSeat;
