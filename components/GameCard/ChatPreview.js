import React, { useMemo, useState, useEffect } from "react";
import { View, Text, Button, ActivityIndicator } from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { useFirestoreConnect } from "react-redux-firebase";
import MemoText from "../MemoText";
import { useSelector } from "react-redux";
import { CHANNEL_TYPE } from "../../constants/helperConstants";
import _ from "lodash";
const ChatPreview = ({ gameId }) => {
  const chatQuery = useMemo(
    () => ({
      collection: "channels",
      doc: gameId || null,
      subcollections: [{ collection: "messages" }],
      orderBy: ["createdAt", "desc"],
      storeAs: `previewChat_${gameId}`,
    }),
    [gameId]
  );
  useFirestoreConnect(chatQuery);

  const [_chats, setChats] = useState([]);
  const chatData = useSelector(
    (state) => state.firestore.ordered[`previewChat_${gameId}`] || []
  );

  const [_uC, uC] = useState(0);
  useEffect(() => {
    console.log("chat data changed");
    setChats(chatData);
  }, [chatData]);

  if (_.isEmpty(_chats)) return <ActivityIndicator />;
-

  return (
    <ScrollView
      style={{
        backgroundColor: "cornsilk",
        height: 100,
        width: "100%",
      }}
    >
      {_chats?.map((c, i) => {
        return (
          <MemoText key={i} label={c.senderDisplayName} message={c.message} />
        );
      })}
    </ScrollView>
  );
};

export default ChatPreview;
