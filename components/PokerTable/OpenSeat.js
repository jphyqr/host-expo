import React, { useMemo, useRef, useState, useEffect } from "react";
import MemoAvatar from "../MemoAvatar";
import { REGISTER_OPEN_SEAT } from "../../constants/reducerConstants";
import { useDispatch, useSelector } from "react-redux";
import { findNodeHandle, UIManager, View } from "react-native";
import { useRefDimensions } from "../../hooks/panHooks";
import { TouchableOpacity } from "react-native-gesture-handler";

const OpenSeat = ({ seatIndex }) => {
  const [_dimensions, setDimensions] = useState({});
  const dispatch = useDispatch();
  const openSeatRef = useRef(null);
  const [_uC, uC] = useState(0);
  const touched = useSelector((state) => state.touch.touched || false);

  const [_touched, setTouched] = useState(false);

  useEffect(() => {
    console.log("TOUCH CHANGED", touched);
    setTouched(touched);
    uC(_uC + 1);
  }, [touched]);
  const unsubscribe = () => {
    openSeatRef?.current?.measure((x, y, w, h, pX, pY) => {
      let boundaries = {
        LEFT: pX,
        RIGHT: pX + w,
        TOP: pY,
        BOTTOM: pY + h,
      };

      //  console.log("unsubscribe should register", boundaries);
      dispatch({
        type: REGISTER_OPEN_SEAT,
        payload: { seatIndex: seatIndex, seatDimensions: boundaries },
      });
    });
  };

  return (
    <View
      ref={openSeatRef}
      onLayout={(event) => {
        setTimeout(() => unsubscribe(), 1000);

        // const { width, height, x, y } = event.nativeEvent.layout;
        // console.log(width, height, x, y);
        // console.log("onlayout", event.nativeEvent.layout);
        // dispatch({
        //   type: REGISTER_OPEN_SEAT,
        //   payload: { seatIndex: seatIndex, seatDimensions: seatDimensions },
        // });
      }}
    >
      <MemoAvatar
        containerStyle={{
          borderRadius: 100,
          borderWidth: 5,
          borderColor: _touched ? "red" : "black",
          backgroundColor: "green",
        }}
        updateOn={_touched}
        imageStyle={{
          backgroundColor: "orange",
        }}
        size='large'
        rounded
        icon={{ name: "event-seat" }}
      />
    </View>
  );
};

export default OpenSeat;
