import React, { useMemo, useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { ListItem } from "react-native-elements";
import { useFirestoreConnect } from "react-redux-firebase";
import { useSelector, useDispatch } from "react-redux";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import _ from "lodash";
import firebase from "../../firebase";
import { ADD_URM, REMOVE_URM } from "../../constants/reducerConstants";
import { CHANNEL_TYPE } from "../../constants/helperConstants";
import { getNotMe } from "../../helperFunctions";
import { formatDistance } from "date-fns";
const MessageItem = ({ item, navigation }) => {
  const chatQuery = useMemo(
    () => ({
      collection: "channels",
      doc: item.channelId,

      storeAs: `chatDoc_${item.id}`,
    }),
    [item.id]
  );

  useFirestoreConnect(chatQuery);

  const chatData = useSelector(
    (state) => state.firestore.ordered[`chatDoc_${item.id}`]?.[0] || {}
  );
  const firestore = firebase.firestore();
  const [_uC, uC] = useState(-1);
  const [_item, setItem] = useState({});
  const dispatch = useDispatch();
  const getRecordById = async () => {
    const recordRef = firestore
      .collection("channels")

      .doc(item.channelId);
    let recordSnap = await recordRef.get();
    let record = recordSnap.data();

    setItem({ id: item.id, ...record });
    uC(_uC + 1);
  };

  useEffect(() => {
    const incrementBadgeCount = () => {
      dispatch({ type: ADD_URM, payload: _item });
    };

    const decrementBadgeCount = () => {
      dispatch({ type: REMOVE_URM, payload: _item });
    };

    if (_item.newChat) {
      incrementBadgeCount();
    } else decrementBadgeCount();
  }, [_item.newChat]);

  useEffect(() => {
    if (!_.isEmpty(item.id)) getRecordById();
  }, [item.id]);

  useEffect(() => {
    if (!_.isEmpty(chatData) && !_.isEmpty(item.id)) getRecordById();
  }, [chatData]);

  if (_.isEmpty(_item)) return <ActivityIndicator />;

  if (!_item.active) return null;

  console.log(item.channelType);
  const { url, name } =
    item.channelType === CHANNEL_TYPE.DM
      ? getNotMe(_item.channelMembers, firebase.auth().currentUser.uid)
      : {};
  return (
    <ListItem
      title={
        item.channelType === CHANNEL_TYPE.DM
          ? name
          : item.channelName || "loading"
      }
      leftAvatar={{
        source: {
          uri:
            item.channelType === CHANNEL_TYPE.DM
              ? url
              : item.channelPhotoURL || "",
        },
      }}
      subtitle={
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Icon name="arrow-right-thick" color={"lightblue"} size={25} />
          <Text>
            {formatDistance(new Date(_item?.lastSentAt), new Date(Date.now()))}
          </Text>
        </View>
      }
      rightIcon={
        _item.newChat ? <Icon name="close" color={"black"} size={35} /> : null
      }
      onPress={async () => {
        try {
          await firestore.collection("channels").doc(item.channelId).update({
            newChat: false,
            openedAt: Date.now(),
          });

          navigation.navigate("ChatScreen", {
            channelName: "DM",
            channelPhotoURL: "DM",
            channelMembers: _item.channelMembers,
            channelType: CHANNEL_TYPE.DM,
            channelId: item.channelId,
          });
        } catch (error) {
          console.log("problem clearing notification", error);
        }
      }}
    />
  );
};

export default MessageItem;
