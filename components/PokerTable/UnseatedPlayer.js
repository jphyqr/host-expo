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
  REGISTER_WAIT_DROP_ZONE,
  SET_MEMBER_OF_GROUP,
} from "../../constants/reducerConstants";
import { useDispatch, useSelector } from "react-redux";
import { useRefDimensions } from "../../hooks/panHooks";
import _ from "lodash";
const UnseatedPlayer = ({
  waitIndex,
  waitlist,
  playerPressed,
  member,
  name,
  hide,
  ...props
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const dispatch = useDispatch();
  const xReturnMember = useSelector((state) => state.touch.returnMember);
  const waitDropRef = useRef(null);
  const xShowWaitDrop = useSelector(
    (state) => state.touch.showWaitDrop || false
  );
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

  const registerDropZone = () => {
    waitDropRef?.current?.measure((x, y, w, h, pX, pY) => {
      let boundaries = {
        LEFT: pX,
        RIGHT: pX + w,
        TOP: pY,
        BOTTOM: pY + h,
      };
      console.log("REGISTERING WAIT DROP ZONE");
      dispatch({
        type: REGISTER_WAIT_DROP_ZONE,
        payload: { waitIndex: waitIndex + 1, boundaries: boundaries },
      });
    });
  };

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
            payload: { index: waitIndex, member: member, showWaitDrop: true },
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
          console.log("ON PAN RELEASE", gestureState);
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
    <View
      style={{
        opacity: hide ? 0 : 1,
      }}
    >
      <Animated.View
        style={{
          zIndex: 10,
          position: "relative",
          borderRadius: 100,

          borderWidth: 5,
          borderColor: "black",
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        }}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity>
          <MemoAvatar {...props} />

          <Text
            style={[
              h6Style,
              {
                width: "100%",
                position: "absolute",
                bottom: 20,
                textAlign: "center",
                backgroundColor: "grey",
                color: "white",
              },
            ]}
          >
            {name}
          </Text>
        </TouchableOpacity>
      </Animated.View>
      {waitlist && xShowWaitDrop && (
        <View
          ref={waitDropRef}
          onLayout={(event) => {
            if (waitlist) setTimeout(() => registerDropZone(), 200);

            // const { width, height, x, y } = event.nativeEvent.layout;
            // console.log(width, height, x, y);
            // console.log("onlayout", event.nativeEvent.layout);
            // dispatch({
            //   type: REGISTER_OPEN_SEAT,
            //   payload: { seatIndex: seatIndex, seatDimensions: seatDimensions },
            // });
          }}
          style={{
            width: 40,
            height: "100%",
            backgroundColor: "green",
            position: "absolute",
            right: 0,
            bottom: 0,
            borderColor: "black",
            borderWidth: 1,
            opacity: 0.2,
            zIndex: 10,
          }}
        ></View>
      )}
    </View>
  );
};

export default UnseatedPlayer;
