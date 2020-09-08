import React, { useMemo, useState, useEffect } from "react";
import { View, Text } from "react-native";
import { useFirestoreConnect } from "react-redux-firebase";
import { useSelector } from "react-redux";
import { ListItem } from "react-native-elements";
import firebase from "../../firebase";
import _ from "lodash";
import { vs30 } from "../../styles/styles";
import { ScrollView } from "react-native-gesture-handler";
import MessageItem from "./MessageItem";

const MessagesScreen = ({ navigation }) => {
  const firestore = firebase.firestore();
  const chatsQuery = useMemo(
    () => ({
      collection: "channel_member",
      where: ["memberId", "==", firebase.auth().currentUser.uid],

      storeAs: "channelSnap",
    }),
    [firebase.auth().currentUser.uid]
  );

  useFirestoreConnect(chatsQuery);
  const channelData = useSelector(
    (state) => state.firestore.ordered.channelSnap || []
  );

  const [_channels, setChannels] = useState([]);
  const [_uC, uC] = useState(-1);
  const getChatsForUser = async () => {
    let chats = [];

    let chatSnap = await firestore
      .collection("channel_member")
      .where("memberId", "==", firebase.auth().currentUser.uid)

      .get();

    chatSnap.forEach((doc) => {
      chats.push({ id: doc.id, ...doc.data() });
    });

    setChannels(chats);
    uC(_uC + 1);
  };

  useEffect(() => {
    console.log("channel data changed");
    if (!_.isEmpty(channelData)) getChatsForUser();
  }, [channelData]);

  useEffect(() => {
    if (firebase.auth().currentUser) getChatsForUser();
  }, [firebase.auth().currentUser.uid]);
  return (
    <View>
      <View style={vs30}></View>
      <View style={vs30}></View>
      <View style={vs30}></View>
      <ScrollView>
        {_channels.map((c, i) => {
          return (
            <MessageItem
              onPress={() => console.log("press")}
              key={i}
              item={c}
              navigation={navigation}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

export default MessagesScreen;
