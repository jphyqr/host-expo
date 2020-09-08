import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Keyboard,
  Dimensions,
  TextInput,
  Button,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { TouchableOpacity, ScrollView } from "react-native-gesture-handler";
import { vs30, spacedRow, h5Style, h7Style } from "../styles/styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useDispatch, useSelector } from "react-redux";
import { SET_OVERLAY, SET_GROUP, SET_DM } from "../constants/reducerConstants";
import {
  OVERLAYS,
  CHANNEL_TYPE,
  MEDIA_TYPE,
} from "../constants/helperConstants";
import firebase from "../firebase";
import { Input } from "react-native-elements";
import _ from "lodash";
import { useFirestoreConnect } from "react-redux-firebase";
import MemoText from "../components/MemoText";
import MemoAvatar from "../components/MemoAvatar";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { getNotMe } from "../helperFunctions";
const ChatScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const firestore = firebase.firestore();
  const inputRef = useRef(null);
  const [_keyboardHeight, setKeyboardHeight] = useState(0);
  const [_loading, loading] = useState(false);
  const [_inputViewWidth, setInputViewWidth] = useState(0);
  const [clearInput, setClearInput] = useState(false);
  const [_inputValue, setInputValue] = useState("");
  const hiddenRef = useRef(null);
  const [_uC, uC] = useState(-1);
  const [_chats, setChats] = useState([]);
  const [_lastChatPull, setLastChatPull] = useState(0);
  const scrollRef = useRef(null);

  const [_url, setUrl] = useState("");
  const [_name, setName] = useState("");
  useEffect(() => {
    const createChannelIfDoesntExist = async () => {
      try {
        let document = await firestore
          .collection("channels")
          .doc(route.params.channelId)
          .get();

        if (document && document.exists) {
          console.log("channel already exists");
        } else {
          await firestore
            .collection("channels")
            .doc(route.params.channelId)
            .set({
              channelType: "DM",
              channelId: route.params.channelId,
              channelName: route.params.channelName,
              channelPhotoURL: route.params.channelPhotoURL,
              channelMembers: route.params.channelMembers || {},
              createdDate: Date.now(),
              adminDisplayName: "DM",
              adminPhotoURL: "DM",

              adminUid: "DM",
            });

          Object.keys(route.params.channelMembers).forEach(async (key) => {
            await firestore
              .collection("channel_member")
              .doc(`${route.params.channelId}_${key}`)
              .set({
                channelType: "DM",
                channelId: route.params.channelId,
                memberId: key,
                channelName: route.params.channelName,
                channelPhotoURL: route.params.channelPhotoURL,
                joinDate: Date.now(),
                memberDisplayName:
                  route.params.channelMembers[`${key}`].displayName,
                memberPhotoURL: route.params.channelMembers[`${key}`].photoURL,

                admin: false,
              });
          });
        }
      } catch (err) {
        return console.log(err);
      }
    };

    const unsubscribe = navigation.addListener("focus", (e) => {
      // Prevent default behavior

      console.log("CHAT OPENED");
      // Do something manually

      if (route.params.channelType === CHANNEL_TYPE.DM) {
        console.log("NEW DM OPENED");
        //  createChannelIfDoesntExist();
      }
      // ...
    });

    return unsubscribe;
  }, [navigation]);

  const chatQuery = useMemo(
    () => ({
      collection: "channels",
      doc: route?.params?.channelId || null,
      subcollections: [{ collection: "messages" }],
      orderBy: ["createdAt", "desc"],
      storeAs: "chatSnap",
    }),
    [route?.params?.channelId]
  );

  const unsubscribe = navigation.addListener("focus", (e) => {
    // Prevent default action
    console.log("focus");

    console.log("SET OFCUS TO inputRef");
    setTimeout(() => inputRef.current.focus(), 150);
  });
  useEffect(() => {
    console.log("SET OFCUS TO inputRef");
    setTimeout(() => inputRef.current.focus(), 150);
  }, []);

  useFirestoreConnect(chatQuery);
  const chatData = useSelector(
    (state) => state.firestore.ordered.chatSnap || []
  );

  useEffect(() => {
    console.log("CHAT DATA USE EFFECT");
    if (!_.isEmpty(chatData)) getChatsForId();
  }, [chatData]);

  const getNewChats = async () => {
    console.log("GET NEW CHATS AFTER", _lastChatPull);

    const recordRef = firestore
      .collection("channels")
      .doc(route?.params?.channelId)
      .collection("messages")
      .where("createdAt", ">=", _lastChatPull)
      .orderBy("createdAt", "desc");
    let recordSnap = await recordRef.get();

    let newChats = [];

    recordSnap.forEach((doc) => {
      newChats.push({ id: doc.id, ...doc.data() });
    });
    setChats([..._chats, ...newChats]);
    setLastChatPull(Date.now());
    uC(_uC + 1);
  };

  const getChatsForId = async () => {
    console.log("GET CHATS BY ID", Date.now());
    setLastChatPull(Date.now());
    const recordRef = firestore
      .collection("channels")
      .doc(route.params.channelId)
      .collection("messages")
      .orderBy("createdAt", "desc");
    let recordSnap = await recordRef.get();

    let chats = [];

    recordSnap.forEach((doc) => {
      chats.push({ id: doc.id, ...doc.data() });
    });
    setChats(chats);
    uC(_uC + 1);
  };

  const loadChannelDoc = async () => {
    console.log("LOAD CHANNEL DOC");
    switch (route?.params?.channelType) {
      case CHANNEL_TYPE.GROUP:
        {
          let group;
          try {
            loading(true);
            let groupDoc = await firestore
              .collection("groups")
              .doc(route?.params?.channelId)
              .get();

            group = { id: route?.params?.channelId, ...groupDoc.data() };
            dispatch({
              type: SET_GROUP,
              payload: group,
            });

            loading(false);
          } catch (error) {
            console.log("error moving groups", error);
            loading(false);
          }
        }
        break;
      case CHANNEL_TYPE.GAME:
        break;
      case CHANNEL_TYPE.DM:
        break;
      default:
    }
  };

  useEffect(() => {
    // loadChannelDoc();
    setChats([]);
    if (!_.isEmpty(route?.params?.channelId)) {
      getChatsForId();
    }
  }, [route?.params?.channelId]);

  useEffect(() => {
    if (!_.isEmpty(route.params.channelMembers)) {
      const { url, name } = getNotMe(
        route.params.channelMembers,
        firebase.auth().currentUser.uid
      );

      console.log("SHOULD SET TO", url);
      setUrl(url);
      setName(name);
      uC(_uC + 1);
    }
  }, [route.params.channelMembers]);

  useEffect(() => {
    console.log("width", inputRef.current ? inputRef.current.offsetWidth : 0);
  }, [inputRef.current]);

  if (_loading) return <ActivityIndicator />;

  const handleSendMessage = async (value) => {
    console.log("handeSendMEssage", value.trim());
    try {
      await firestore
        .collection("channels")
        .doc(route?.params?.channelId)
        .collection("messages")
        .add({
          channelId: route?.params?.channelId,
          senderUid: firebase.auth().currentUser.uid,
          senderDisplayName: firebase.auth().currentUser.displayName,
          senderPhotoURL: firebase.auth().currentUser.photoURL,
          createdAt: Date.now(),
          type: "TEXT",
          message: _inputValue,
        });
      await firestore
        .collection("channels")
        .doc(route?.params?.channelId)
        .update({
          active: true,
          lastSender: firebase.auth().currentUser.displayName,
          lastMediaType: MEDIA_TYPE.MESSAGE,
          lastSentAt: Date.now(),
        });
    } catch (error) {
      loading(false);
      console.log("error in handleSendMessage", error);
    }
  };

  const keyboardDidShowListener = Keyboard.addListener(
    "keyboardDidShow",
    (e) => {
      if (_keyboardHeight === 0) setKeyboardHeight(e.endCoordinates.height);
    }
  );

  const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", (e) =>
    setKeyboardHeight(0)
  );

  const keyboardReturnListener = Keyboard.addListener("keyDownListener", (e) =>
    console.log("KEY DOWN LISTENER")
  );

  const getRecipientsPhoto = () => {
    let recipientUIDs = Object.keys(route.params.channelPhotoURL).filter(
      (k) => k !== firebase.auth().currentUser.uid
    );

    let recipientURL;

    if (recipientUIDs.length === 0) {
      console.log("SOMETHING WRONG WITH UIDS");
    } else if (recipientUIDs.length === 1) {
      console.log("THIS IS A DM");
      recipientURL = route.params.channelPhotoURL[`${recipientUIDs[0]}`];
    } else {
      console.log("THIS IS A MULTI WAY DM");
    }

    return recipientURL;
  };

  const handleKeyPress = (e) => {
    console.log("handle key press", _inputValue);
    if (e.nativeEvent.key == "Enter") {
      console.log("Should clear input");
      setClearInput(true);

      return;
      inputRef.current.clear();
      setInputValue("");
    }
  };

  useEffect(() => {
    uC(_uC + 1);
    console.log("USE EFFECT INPUT VALUE");

    if (clearInput) {
      setInputValue("");
      inputRef.current.clear();
    }
  }, [_inputValue]);

  return (
    <View
      style={{
        position: "relative",
        height: "100%",
        backgroundColor: "pink",
      }}
    >
      <View style={vs30} />
      <View style={spacedRow}>
        {/* <TouchableOpacity
          style={{}}
          onPress={async () => {
            let group;
            try {
              loading(true);
              let groupDoc = await firestore
                .collection("groups")
                .doc(route?.params?.groupId)
                .get();

              group = { id: route?.params?.groupId, ...groupDoc.data() };
              dispatch({
                type: SET_GROUP,
                payload: group,
              });

              loading(false);
            } catch (error) {
              console.log("error moving groups", error);
              loading(false);
            }

            navigation.navigate("Main", {
              screen: "ManageGroupFlow",
              groupPhotoURL: group.groupPhotoURL,
              groupName: group.groupName,
            });
          }}
        > */}

        <MemoAvatar
          rounded
          source={{
            uri:
              route.params.channelType === CHANNEL_TYPE.DM
                ? _url
                : route?.params?.channelPhotoURL,
          }}
          updateOn={
            route.params.channelType === CHANNEL_TYPE.DM
              ? _url
              : route?.params?.channelPhotoURL
          }
          size="medium"
          overlayContainerStyle={{ backgroundColor: "blue" }}
          onPress={
            route.params.channelType === CHANNEL_TYPE.GROUP
              ? async () => {
                  console.log("memo press");
                  let group;
                  let groupDoc = await firestore
                    .collection("groups")
                    .doc(route?.params?.channelId)
                    .get();

                  group = { id: route?.params?.channelId, ...groupDoc.data() };
                  dispatch({
                    type: SET_GROUP,
                    payload: group,
                  });

                  inputRef.current.blur();
                  navigation.navigate("MyModal", {
                    channelType: route.params.channelType,
                  });
                }
              : route.params.channelType === CHANNEL_TYPE.GAME
              ? async () => {
                  console.log("memo press");
                  let member;
                  let groupDoc = await firestore
                    .collection("users")
                    .doc(route?.params?.channelId)
                    .get();

                  group = { id: route?.params?.channelId, ...groupDoc.data() };
                  dispatch({
                    type: SET_GROUP,
                    payload: group,
                  });

                  inputRef.current.blur();
                  navigation.navigate("MyModal", {
                    channelType: route.params.channelType,
                  });
                }
              : async () => {
                  let compoundId =
                    firebase.auth().currentUser.uid > route.params.channelId
                      ? `${route.params.channelId}_${
                          firebase.auth().currentUser.uid
                        }`
                      : `${firebase.auth().currentUser.uid}_${
                          route.params.channelId
                        }`;

                  let dm;
                  let dmDoc = await firestore
                    .collection("channels")
                    .doc(compoundId)
                    .get();

                  dm = { id: route?.params?.channelId, ...dmDoc.data() };
                  dispatch({
                    type: SET_DM,
                    payload: dm,
                  });

                  inputRef.current.blur();
                  navigation.navigate("MyModal", {
                    channelType: route.params.channelType,
                  });
                }
          }
        />

        <Text>
          {route.params.channelType === CHANNEL_TYPE.DM
            ? _name
            : route.params.channelName}
        </Text>
        <TouchableOpacity
          style={{}}
          onPress={() => {
            navigation.goBack();
            dispatch({ type: SET_OVERLAY, payload: OVERLAYS.CLEAR });
          }}
        >
          <Icon name="close" color={"black"} size={35} />
        </TouchableOpacity>
      </View>

      <View style={vs30} />
      <ScrollView
        ref={scrollRef}
        onContentSizeChange={() =>
          scrollRef.current.scrollToEnd({ animated: true })
        }
        keyboardShouldPersistTaps="always"
        style={{
          height: 350,
          width: "100%",
          position: "absolute",
          top: 100,
          zIndex: 10,
          padding: 10,
        }}
      >
        {_.isEmpty(_chats) && (
          <Text
            style={[h7Style, { width: "100%", textAlign: "center" }]}
          >{`New Chat for ${route?.params?.channelName}`}</Text>
        )}
        {_chats.reverse().map((c, i) => {
          return (
            <MemoText key={i} label={c.senderDisplayName} message={c.message} />
          );
        })}
        <View style={vs30} />
        <View style={vs30} />
        <View style={vs30} />
      </ScrollView>

      <View
        style={{
          position: "absolute",

          flexDirection: "row",
          alignItems: "flex-end",
          bottom: _keyboardHeight,
          opacity: _keyboardHeight > 0 ? 1 : 0,
          // transform: [{ translateY: "200%" }],
          maxWidth: Dimensions.get("window").width,

          zIndex: 30,
        }}
      >
        <Icon name="camera" color={"black"} size={30} />
        <Icon name="camera" color={"black"} size={30} />
        <Icon name="camera" color={"black"} size={30} />
        <View
          onLayout={(event) => {
            var { x, y, width, height } = event.nativeEvent.layout;
            console.log("view width", width);
            setInputViewWidth(width);
          }}
          style={{ flexGrow: 1 }}
        >
          <TextInput
            onSubmitEditing={(e) => {
              console.log("On submit editing", _inputValue);
              handleSendMessage(_inputValue);
              inputRef.current.clear();
              setInputValue("");
              setClearInput(false);
            }}
            clearButtonMode="always"
            ref={inputRef}
            autoCorrect={false}
            style={{
              fontSize: 22,
              maxWidth: _inputViewWidth,
              zIndex: 30,
              maxHeight: 300,
            }}
            returnKeyType={"send"}
            multiline={true}
            // onBlur={() => console.log("blur")}
            onKeyPress={handleKeyPress}
            autoFocus
            value={clearInput ? "" : _inputValue}
            onChangeText={(e) => {
              console.log("on change text..S", e);
              if (!clearInput) setInputValue(e);

              if (clearInput) setClearInput(false);
            }}
          />
        </View>
        <Icon name="camera" color={"black"} size={30} />
        <Icon name="camera" color={"black"} size={30} />

        {/* <TouchableOpacity
          style={{}}
          onPress={async () => {
            let group;
            try {
              loading(true);
              let groupDoc = await firestore
                .collection("groups")
                .doc(route?.params?.groupId)
                .get();

              group = { id: route?.params?.groupId, ...groupDoc.data() };
              dispatch({
                type: SET_GROUP,
                payload: group,
              });

              loading(false);
            } catch (error) {
              console.log("error moving groups", error);
              loading(false);
            }

            navigation.navigate("Main", {
              screen: "ManageGroupFlow",
              groupPhotoURL: group.groupPhotoURL,
              groupName: group.groupName,
            });
          }}
        >
          <Icon name="cards" color={"black"} size={30} />
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

export default ChatScreen;
