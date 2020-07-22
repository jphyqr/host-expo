import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useSelector } from "react-redux";
import GameSummary from "../components/GameSummary";
import _ from "lodash";
import firebase from "../firebase";
import { vs30 } from "../styles/styles";
import { ListItem } from "react-native-elements";
const RegistrationDetails = () => {
  const xGame = useSelector((state) => state.game || {});
  const firestore = firebase.firestore();
  const [_invites, setInvites] = useState([]);

  useEffect(() => {
    const getInvitesForGame = async () => {
      console.log("USE EFFECT GET INVITES");
      let inviteDocs = await firestore
        .collection("game_invite")
        .where("gameId", "==", xGame.id)
        .get();
      let invites = [];
      console.log({ inviteDocs });
      inviteDocs.forEach((doc) => {
        invites.push({ id: doc.id, ...doc.data() });
      });

      setInvites(invites);
    };

    if (!_.isEmpty(xGame)) getInvitesForGame();
  }, [xGame]);

  return (
    <View>
      <Text>RegistrationDetails</Text>
      <GameSummary game={xGame} />

      <View style={vs30} />

      {_invites?.map((i, x) => {
        return <ListItem title={i.userUid} key={x} />;
      })}
    </View>
  );
};

export default RegistrationDetails;
