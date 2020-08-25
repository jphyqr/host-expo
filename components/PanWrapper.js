import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  Animated,
  PanResponder,
  StyleSheet,
  TextInput,
} from "react-native";
import { Input } from "react-native-elements";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import { SET_TOUCH } from "../constants/reducerConstants";
import { getDistance } from "../constants/helperConstants";

const PanWrapper = ({
  item,
  index,
  onPress,
  selectedIndex,
  editing,
  setEditing,
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const [_edit, setEdit] = useState(false);
  const [_text, setText] = useState(item.text);
  const [_distanceBetween, setDistanceBetween] = useState(0);
  const [_y, setY] = useState(0);
  const dispatch = useDispatch();
  const xTouch = useSelector((state) => state.touch || {});
  const [_panPosition, updatePanPosition] = useState({});
  const [_uC, uC] = useState(-1);
  const [_scale, setScale] = useState(1);
  const [_rotate, setRotate] = useState(0);

  //   useEffect(() => {
  //     console.log("use Effect hit");
  //     uC(_uC + 1);
  //   }, [xTouch]);

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
          dispatch({ type: SET_TOUCH, payload: true });
          console.log("EDITING DONE");
          console.log("gesturestate.move", gestureState.moveX);
          const touches = evt.nativeEvent.touches;

          if (touches.length >= 2) {
            let touch1X = touches[0];
            let touch2x = touches[1];

            let newDistanceBetween = getDistance(touches);
            if (
              _distanceBetween !== 0 &&
              newDistanceBetween < _distanceBetween
            ) {
              //pinching, sohuld shrink
              setScale(_scale - 0.1);
            } else if (
              _distanceBetween !== 0 &&
              newDistanceBetween > _distanceBetween
            ) {
              setScale(_scale + 0.1);
            }

            setDistanceBetween(newDistanceBetween);

            // We have a pinch-to-zoom movement
            // Track locationX/locationY to know by how much the user moved their fingers
          } else {
            return Animated.event([
              null,
              {
                dx: pan.x,
                dy: pan.y,
              },
            ])(evt, gestureState);
          }
        },
        //   (event, gesture) => {
        //     Animated.event([null, { dx: pan.x, dy: pan.y }]);
        //     const touches = event.nativeEvent.touches;

        //     if (touches.length >= 2) {
        //       // We have a pinch-to-zoom movement
        //       // Track locationX/locationY to know by how much the user moved their fingers
        //       console.log("TWO FINGER");
        //       () => Animated.event([null, { dx: pan.x, dy: pan.y }])();
        //     } else {
        //       console.log("ONE FINGER");
        //       () => Animated.event([null, { dx: pan.x, dy: pan.y }])();
        //     }
        //   },
        onPanResponderRelease: async () => {
          pan.flattenOffset();
          dispatch({ type: SET_TOUCH, payload: false });
          console.log("EDITING");
        },
        onPanResponderStart: (event, gesture) => {},
      }),
    [_distanceBetween]
  );

  const callFunction = (touches) => {};

  return (
    <Animated.View
      style={{
        width: "100%",
        backgroundColor: "yellow",
        transform: [
          { translateX: pan.x },
          { translateY: pan.y },
          { scale: _scale },
        ],
      }}
      {...panResponder.panHandlers}
    >
      {index === selectedIndex ? (
        <TouchableOpacity onPress={() => onPress(index)}>
          <TextInput
            autoFocus
            placeholder="Click to edit"
            onChangeText={(value) => setText(value)}
            onPress={() => onPress(index)}
            onBlur={() => onPress(-1)}
            value={_text}
            style={{
              padding: 5,
              fontSize: 25,
              textAlign: "center",
            }}
          ></TextInput>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity>
          <Text
            style={{
              padding: 5,
              fontSize: 25,
              textAlign: "center",
            }}
          >
            {_text}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "green",
    width: "100%",
    position: "relative",
  },
  titleText: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "bold",
  },
  box: {
    height: 150,
    width: 150,
    backgroundColor: "blue",
    borderRadius: 5,
  },
});

export default PanWrapper;
