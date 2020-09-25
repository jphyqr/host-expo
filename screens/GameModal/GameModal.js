import React from "react";
import { View, Text, ActivityIndicator, Button } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import _ from "lodash";
import firebase from "../../firebase";
import {
  SET_GAME,
  SET_MEMBERS_IN_AREA,
  SET_MEMBER_OF_GROUP,
} from "../../constants/reducerConstants";
import StoryAvatar from "../../components/StoryAvatar";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import PokerTable from "../../components/PokerTable/PokerTable";
import { vs30, spacedRow } from "../../styles/styles";
import { CHANNEL_TYPE } from "../../constants/helperConstants";
import { useNavigationState } from "@react-navigation/native";
const GameModal = ({ navigation }) => {
  console.log("GAME MODAL");
  const dispatch = useDispatch();

  const xPIG = useSelector((state) => state.memberOfGroup || {});

  const navState = useNavigationState((state) => state.routes);

  return (
    <View style={{ position: "relative" }}>
      {/* {Object.keys(openSeatLocations).map((seat, i) => {
        return (
          <View
            key={i}
            style={{
              position: "absolute",
              backgroundColor: "green",
              zIndex: 30,
              opacity: 0.5,
              top: openSeatLocations[`${seat}`].TOP,
              left: openSeatLocations[`${seat}`].LEFT,
              height:
                openSeatLocations[`${seat}`].BOTTOM -
                openSeatLocations[`${seat}`].TOP,
              width:
                openSeatLocations[`${seat}`].RIGHT -
                openSeatLocations[`${seat}`].LEFT,
            }}
          />
        );
    
    })} */}
      <View style={vs30} />
      <View style={spacedRow}>
        <Icon name='close' type='material' size={40} color='grey' />
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("MyModal", { channelType: CHANNEL_TYPE.GAME })
          }
        >
          <Icon name='settings' type='material' size={40} color='grey' />
        </TouchableOpacity>
      </View>

      <View style={vs30} />
      <View style={vs30} />
      <View style={vs30} />
      <View
        style={{
          padding: 20,
          justifyContent: "center",
          flexDirection: "row",
          width: "100%",
          backgroundColor: "darkgrey",
        }}
      >
        <PokerTable navigation={navigation} />
      </View>
    </View>
  );
};

export default GameModal;
