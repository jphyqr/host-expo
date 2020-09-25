import React, { useMemo, useState, useEffect, useRef } from "react";
import { View, Text, Button, ActivityIndicator } from "react-native";
import {
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import { useFirestoreConnect, isLoaded } from "react-redux-firebase";
import MemoText from "../MemoText";
import { useSelector } from "react-redux";
import firebase from "../../firebase";
import { CHANNEL_TYPE } from "../../constants/helperConstants";
import _ from "lodash";
import { useSubCollection } from "../../hooks/firestoreHooks";
import {
  spacedRow,
  h5Style,
  h7Style,
  h6Style,
  h4Style,
} from "../../styles/styles";
import { formatDistance } from "date-fns";
const ChatPreview = ({ gameId, onWindowPress }) => {
  const firestore = firebase.firestore();
  const ref = firestore
    .collection("channels")
    .doc(gameId)
    .collection("messages")
    .orderBy("createdAt", "desc")
    .limit(5);
  const [data, loading, error] = useSubCollection(ref);
  const [_chats, setChats] = useState([]);
  const [_uC, uC] = useState(-1);
  const scrollRef = useRef(null);

  useEffect(() => {
    setChats(data);
    uC(_uC + 1);
  }, [data, loading, error]);

  if (loading) return <ActivityIndicator />;

  return (
    <ScrollView
      style={{
        backgroundColor: "cornsilk",
        height: 150,
        borderRadius: 10,
        width: "100%",
      }}
      ref={scrollRef}
      onContentSizeChange={() =>
        scrollRef.current.scrollToEnd({ animated: true })
      }
    >
      <TouchableWithoutFeedback onPress={onWindowPress}>
        <View>
          {_chats?.reverse().map((c, i) => {
            return (
              <View key={i}>
                <View style={spacedRow}>
                  <Text style={h5Style}>{c.senderDisplayName}</Text>
                  {c.createdAt && (
                    <Text style={h6Style}>
                      {formatDistance(
                        new Date(c.createdAt),
                        new Date(Date.now())
                      )}
                    </Text>
                  )}
                </View>

                <Text style={h4Style}>{c.message}</Text>
              </View>
            );
          })}
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
};

export default ChatPreview;
