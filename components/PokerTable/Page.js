import React, { useEffect, useMemo, useCallback, useState } from "react";
import { View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import UnseatedPlayer from "./UnseatedPlayer";
import Animated from "react-native-reanimated";
import { useSelector } from "react-redux";

const Page = ({ page, i, sliderWidth, activePageIndex, gutter }) => {
  const xSeating = useSelector((state) => state.game.seating || []);
  const [_playersInGame, setPlayersInGame] = useState([]);
  useEffect(() => {
    console.log("SEATING CHANGED", xSeating);

    setPlayersInGame(xSeating.filter((s) => s.taken === true));
  }, [xSeating.filter((s) => s.taken === true).length]);

  useEffect(() => {}, [page]);
  return (
    <Animated.View
      style={{
        width: sliderWidth - 100,
        flexDirection: "row",
        position: "absolute",
        left: i * (sliderWidth - 100) - activePageIndex * (sliderWidth - 100),
        bottom: 0,
      }}
    >
      {page.map((member, i) => {
        return (
          <View style={{ flexDirection: "row" }}>
            <UnseatedPlayer
              key={i}
              outOfGame={true}
              name={member.displayName}
              member={member}
              hide={
                _playersInGame.filter((p) => p.uid === member.uid).length > 0
              }
              rounded
              source={{ uri: member.photoURL }}
              updateOn={[member.photoURL, member.uid]}
              size='medium'
              playerPressed={() => {
                dispatch({
                  type: SET_MEMBER_OF_GROUP,
                  payload: member,
                });
                navigation.navigate("PIGModal", {
                  title: member.displayName,
                });
              }}
              overlayContainerStyle={{ backgroundColor: "blue" }}
            />
            <View style={{ width: gutter }} />
          </View>
        );
      })}
    </Animated.View>
  );
};

export default Page;
