import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import {
  ListItem,
  Button,
  ButtonGroup,
  Icon,
  Overlay,
  Input,
} from "react-native-elements";
import _ from "lodash";
import firebase from "../../firebase";
import {
  spacedRow,
  centeredRow,
  averageRow,
  h5Style,
} from "../../styles/styles";
import { SET_MEMBER_OF_GROUP } from "../../constants/reducerConstants";
const ManageGameScreen = ({ navigation }) => {
  const xGame = useSelector((state) => state.game || {});
  const [_game, setGame] = useState({});

  const [_selectedMember, selectMember] = useState({});
  const dispatch = useDispatch();
  const [_fU, fU] = useState(0);
  useEffect(() => {
    if (!_.isEmpty(xGame)) {
      setGame(xGame);
      console.log("USE EFFECT GAME CHANGED");
      fU(_fU + 1);
    }
  }, [xGame]);

  useEffect(() => {
    if (!_.isEmpty(xGame)) {
      console.log("USE EFFECT ESATING CHANGED");
    }
  }, [xGame.seating]);

  return (
    <View>
      {_game?.seating?.map((u, i) => {
        return u.taken === true ? (
          <ListItem
            key={i}
            roundAvatar
            title={u.displayName}
            chevron
            onPress={() => {
              dispatch({
                type: SET_MEMBER_OF_GROUP,
                payload: { id: u.uid, ...xGame.members[u.uid] },
              });

              navigation.navigate("ManagePlayerInGameScreen");
            }}
            subtitle={`Seat ${i + 1}`}
            leftAvatar={{ source: { uri: u?.photoURL } }}
          />
        ) : (
          <ListItem key={i} roundAvatar title={`Seat ${i + 1}`} />
        );
      })}
    </View>
  );
};

export default ManageGameScreen;
