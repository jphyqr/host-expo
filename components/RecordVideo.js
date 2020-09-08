import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as VideoThumbnails from "expo-video-thumbnails";
import { Overlay, Image, Input, ListItem } from "react-native-elements";
import { Camera } from "expo-camera";
import { TouchableOpacity, ScrollView } from "react-native-gesture-handler";
import * as Permissions from "expo-permissions";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {
  SET_OVERLAY,
  SET_GAME,
  UPDATE_A_GAMES_THUMBNAIL,
} from "../constants/reducerConstants";
import { OVERLAYS } from "../constants/helperConstants";
import { useDispatch, useSelector } from "react-redux";
import { vs10, vs30, hs5, spacedRow, h5Style } from "../styles/styles";
import { RNPhotoEditor } from "react-native-photo-editor";
import { GLView } from "expo-gl";
import firebase from "../firebase";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { captureScreen, ViewShot, captureRef } from "react-native-view-shot";
import _ from "lodash";
import PanWrapper from "./PanWrapper";
import { membersInAreaReducer } from "../reducers/membersInAreaReducer";
import { uploadPhotoPreGroup } from "../actions/groupActions";
const RecordVideo = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [_photo, setPhoto] = useState({});
  const [_finalURI, setFinalURI] = useState({});
  const [cameraRef, setCameraRef] = useState(null);
  const [_processing, setProcessing] = useState(false);
  const [_texts, setTexts] = useState([]);
  const viewRef = useRef(null);
  const [_editing, setEditing] = useState(false);
  const [_selectedTextIndex, selectTextForEdit] = useState(-1);
  const xTouch = useSelector((state) => state.touch || false);
  const [_uC, uC] = useState(-1);
  const dispatch = useDispatch();
  const [_sendTo, setSendTo] = useState([]);
  const [_loading, loading] = useState(false);
  const auth = useSelector((state) => state.firebase.auth || {});
  const [_thumbnail, setThumbnail] = useState({});
  const xHostGroups = useSelector((state) => state.hostGroups || []);
  const [_mediaType, setMediaType] = useState("");
  const xMembersInArea = useSelector(
    (state) => state.membersInArea.members || []
  );

  const firestore = firebase.firestore();
  const xGames = useSelector((state) => state.game_s || []);
  const unsubscribe = navigation.addListener("focus", (e) => {
    // Prevent default action
    console.log("focus");

    dispatch({
      type: SET_OVERLAY,
      payload: OVERLAYS.RECORD,
    });
  });

  const us2 = navigation.addListener("blur", (e) => {
    // Prevent default action
    console.log("blur");

    dispatch({
      type: SET_OVERLAY,
      payload: OVERLAYS.CLEAR,
    });
  });

  const generateThumbnail = async (url) => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(url, {
        time: 1000,
      });
      console.log("thumbnail uri", uri);
      return uri;
    } catch (e) {
      console.warn(e);
    }
  };

  const sendSnap = async () => {
    try {
      loading(true);
      console.log("blobing picture");
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function (e) {
          console.log(e);
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", _finalURI, true);
        xhr.send(null);
      });
      let photo = await dispatch(uploadPhotoPreGroup(blob));

      let thumbnail;
      if (_mediaType === "video") {
        let thumbUri = await generateThumbnail(photo.url);
        const thumbBlob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = function () {
            resolve(xhr.response);
          };
          xhr.onerror = function (e) {
            console.log(e);
            reject(new TypeError("Network request failed"));
          };
          xhr.responseType = "blob";
          xhr.open("GET", thumbUri, true);
          xhr.send(null);
        });
        let thumbObj = await dispatch(uploadPhotoPreGroup(thumbBlob));
        thumbnail = thumbObj.url;
      } else thumbnail = photo.url;

      _sendTo.forEach(async (person) => {
        console.log("send up", person);

        await firestore.collection("snaps").add({
          date: Date.now(),
          senderUid: auth.uid,
          type: person.TYPE,
          url: photo.url,
          thumbnail: thumbnail,
          mediaType: _mediaType,
          destinationId:
            person.TYPE === "GAME"
              ? person.gameId
              : person.TYPE === "GROUP"
              ? person.groupId
              : person.id,
        });

        switch (person.TYPE) {
          case "PERSON":
            console.log(
              "Send Notification From Cloud",
              "color:blue; font-size:15px"
            );

            break;
          case "GROUP":
            console.log(
              "Send Notification From Cloud",
              "color:blue; font-size:15px"
            );
            await firestore.collection("games").doc(person.gameId).update({
              lastSnapDate: Date.now(),
              lastSnapPhotoURL: thumbnail,
            });

            break;
          case "GAME":
            console.log(
              "Send Notification From Cloud",
              "color:blue; font-size:15px"
            );

            dispatch({
              type: UPDATE_A_GAMES_THUMBNAIL,
              payload: { id: person.gameId, url: thumbnail },
            });

            await firestore.collection("games").doc(person.gameId).update({
              lastSnapDate: Date.now(),
              lastSnapPhotoURL: thumbnail,
            });
            break;
          default:
        }
      });

      dispatch({
        type: SET_OVERLAY,
        payload: OVERLAYS.CLEAR,
      });

      navigation.navigate("FeedScreen", {
        screen: "Feed",
        photoTaken: false,
      });

      setFinalURI({});
      setPhoto({});
      loading(false);
    } catch (error) {
      loading(false);
      console.log("error in sendSnap ", error);
    }
  };

  useEffect(() => {
    setEditing(xTouch);
    uC(_uC + 1);
  }, [xTouch]);

  useEffect(() => {
    (async () => {
      console.log("CHECK FOR PERMISSIONS");
      const { status } = await Permissions.askAsync(
        Permissions.CAMERA,
        Permissions.AUDIO_RECORDING
      );
      console.log({ status });
      setHasPermission(status === "granted");
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  if (hasPermission === false) {
    return (
      <Overlay>
        <Text>No access to camera</Text>
      </Overlay>
    );
  }

  const renderSendTo = () => {
    let str = "";
    for (const entity of _sendTo) {
      str = str + entity.name + ", ";
    }

    return str;
  };

  return (
    <View style={{ width: "100%", height: "100%" }}>
      <Overlay isVisible={_loading}>
        <ActivityIndicator />
      </Overlay>

      {_.isEmpty(_photo) ? (
        <Camera
          style={{ flex: 1 }}
          type={type}
          ref={(ref) => {
            setCameraRef(ref);
          }}
        >
          <View style={vs30} />

          <View
            style={{
              flex: 1,
              backgroundColor: "transparent",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              style={{
                flex: 0.1,
                alignSelf: "flex-end",
                alignItems: "center",
                marginRight: 10,
              }}
              onPress={() => {
                navigation.goBack();
                dispatch({ type: SET_OVERLAY, payload: OVERLAYS.CLEAR });
              }}
            >
              <Icon name="close" color={_editing ? "red" : "white"} size={35} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 0.1,
                alignSelf: "flex-end",
                alignItems: "center",
                marginLeft: 10,
              }}
              onPress={() => {
                setType(
                  type === Camera.Constants.Type.back
                    ? Camera.Constants.Type.front
                    : Camera.Constants.Type.back
                );
              }}
            >
              <MaterialIcons name="switch-camera" color={"white"} size={35} />
            </TouchableOpacity>
          </View>

          <View style={spacedRow}>
            <TouchableOpacity
              style={{}}
              onPress={async () => {
                let permissionResult = await ImagePicker.requestCameraRollPermissionsAsync();

                if (permissionResult.granted === false) {
                  alert("Permission to access camera roll is required!");
                  return;
                }

                let pickerResult = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.All,
                  allowsEditing: true,
                });

                //if a video file, should skip ahead to rendering

                console.log({ pickerResult });
                if (pickerResult.type === "video") {
                  setFinalURI(pickerResult.uri);
                }

                setPhoto(pickerResult);
                setMediaType(pickerResult.type);
              }}
            >
              <Icon
                name="content-save-settings"
                color={_editing ? "red" : "white"}
                size={35}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{}}
              onPress={async () => {
                if (cameraRef) {
                  let photo = await cameraRef.takePictureAsync();
                  console.log("photo", photo);

                  navigation.navigate("FeedScreen", {
                    screen: "RecordContent",
                    photoTaken: true,
                  });

                  setPhoto(photo);
                  setMediaType("image");
                }
              }}
            >
              <View
                style={{
                  alignSelf: "center",
                  height: 100,
                  width: 100,
                  borderRadius: 100,
                  backgroundColor: "white",
                }}
              ></View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{}}
              onPress={async () => {
                //LAUNCH photo selector
              }}
            >
              <Icon name="close" color={_editing ? "red" : "white"} size={35} />
            </TouchableOpacity>
          </View>
        </Camera>
      ) : _.isEmpty(_finalURI) ? (
        <ImageBackground
          source={_photo}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
          }}
          ref={viewRef}
        >
          {!_editing && !_processing && (
            <View
              style={{
                width: "100%",
                height: "auto",
                position: "absolute",
                top: 40,
                left: 0,
                backgroundColor: "transparent",
                flexDirection: "row",
                justifyContent: "space-between",
                zIndex: 5,
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 0.1,
                  alignSelf: "flex-end",
                  alignItems: "center",
                  marginRight: 10,
                }}
                onPress={() => {
                  navigation.navigate("FeedScreen", {
                    screen: "RecordContent",
                    photoTaken: false,
                  });

                  setFinalURI({});
                  setPhoto({});
                }}
              >
                <MaterialIcons name="close" color={"white"} size={35} />
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 0.1,
                  alignSelf: "flex-end",
                  alignItems: "center",
                  marginLeft: 10,
                }}
                onPress={async () => {
                  setProcessing(true);
                  await sleep(100);
                  try {
                    let result = await captureRef(viewRef, {
                      format: "jpg",
                      quality: 0.8,
                    });

                    setFinalURI(result);

                    console.log("screen shot", result);
                    setProcessing(false);
                  } catch (error) {
                    console.log("Error", result);
                  }
                }}
              >
                <MaterialIcons
                  name="subdirectory-arrow-right"
                  color={"red"}
                  size={35}
                />
              </TouchableOpacity>
            </View>
          )}
          <View
            style={{
              height: "auto",
              position: "absolute",
              top: 90,
              right: 0,
              backgroundColor: "transparent",
              flexDirection: "row",
              justifyContent: "space-between",
              zIndex: 5,
            }}
          >
            {!_processing && (
              <TouchableOpacity
                style={{
                  flex: 0.1,
                  alignSelf: "flex-end",
                  alignItems: "center",
                  marginLeft: 10,
                }}
                onPress={() =>
                  setTexts([..._texts, { text: `text ${_texts.length}` }])
                }
              >
                <Text
                  style={{ color: "white", fontSize: 40, fontWeight: "bold" }}
                >
                  T
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={() => selectTextForEdit(-1)}>
            <View
              style={{
                height: "100%",
                width: "100%",
                paddingTop: 150,
                paddingBottom: 50,
              }}
            >
              {_texts?.map((t, i) => {
                return (
                  <PanWrapper
                    item={t}
                    key={i}
                    index={i}
                    setEditing={setEditing}
                    editing={_editing}
                    selectedIndex={_selectedTextIndex}
                    onPress={selectTextForEdit}
                  />
                );
              })}
            </View>
          </TouchableOpacity>
        </ImageBackground>
      ) : (
        <View style={{ flexGrow: 1 }}>
          <View style={[vs30]} />
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Abandon",
                "Abandon Media",
                [
                  {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel",
                  },
                  {
                    text: "Delete",
                    onPress: () => {
                      navigation.navigate("FeedScreen", {
                        screen: "RecordContent",
                        photoTaken: false,
                      });

                      setFinalURI({});
                      setPhoto({});
                    },
                  },
                ],
                { cancelable: true }
              );
            }}
          >
            <MaterialIcons name="close" color={"red"} size={35} />
          </TouchableOpacity>
          {/* 
          <View
            style={{
              position: "absolute",
              bottom: 60,
              right: 30,
              backgroundColor: "blue",
              borderRadius: 100,
              padding: 20,
            }}
          >
            <TouchableOpacity
              onPress={() =>
                setTexts([..._texts, { text: `text ${_texts.length}` }])
              }
            >
              <MaterialIcons name="send" color={"white"} size={50} />
            </TouchableOpacity>
          </View> */}
          <ScrollView style={{ height: 500 }}>
            {xHostGroups.map((h, i) => {
              return (
                <ListItem
                  key={i}
                  leftIcon={
                    <MaterialIcons name="group" color={"green"} size={30} />
                  }
                  title={h.groupName}
                  bottomDivider
                  onPress={
                    _sendTo.filter((s) => s.groupId === h.groupId).length > 0
                      ? () =>
                          setSendTo(
                            _sendTo.filter((s) => s.groupId !== h.groupId)
                          )
                      : () =>
                          setSendTo([
                            ..._sendTo,
                            Object.assign(
                              {},
                              {
                                groupId: h.groupId,
                                TYPE: "GROUP",
                                name: h.groupName,
                              }
                            ),
                          ])
                  }
                  checkBox={{
                    checked:
                      _sendTo.filter((s) => s.groupId === h.groupId).length > 0
                        ? true
                        : false,
                  }}
                />
              );
            })}

            {xGames?.map((h, i) => {
              return (
                <ListItem
                  key={i}
                  leftIcon={
                    <Icon
                      name="cards"
                      type="material"
                      size={25}
                      color="green"
                    />
                  }
                  title={h.groupName}
                  subtitle={h?.gameSettings?.title}
                  bottomDivider
                  onPress={
                    _sendTo.filter((s) => s.gameId === h.id).length > 0
                      ? () =>
                          setSendTo(_sendTo.filter((s) => s.gameId !== h.id))
                      : () =>
                          setSendTo([
                            ..._sendTo,
                            Object.assign(
                              {},
                              {
                                gameId: h.id,
                                name: h.gameSettings.title,
                                TYPE: "GAME",
                              }
                            ),
                          ])
                  }
                  checkBox={{
                    checked:
                      _sendTo.filter((s) => s.gameId === h.id).length > 0
                        ? true
                        : false,
                  }}
                />
              );
            })}

            {xMembersInArea?.map((h, i) => {
              return (
                <ListItem
                  key={i}
                  leftAvatar={{ source: { uri: h.photoURL } }}
                  title={h.displayName}
                  bottomDivider
                  onPress={
                    _sendTo.filter((s) => s.id === h.id).length > 0
                      ? () => setSendTo(_sendTo.filter((s) => s.id !== h.id))
                      : () =>
                          setSendTo([
                            ..._sendTo,
                            Object.assign(
                              {},
                              { id: h.id, name: h.displayName, TYPE: "PERSON" }
                            ),
                          ])
                  }
                  checkBox={{
                    checked:
                      _sendTo.filter((s) => s.id === h.id).length > 0
                        ? true
                        : false,
                  }}
                />
              );
            })}
          </ScrollView>
          {_sendTo.length > 0 ? (
            <View
              style={[
                spacedRow,
                {
                  backgroundColor: "lightblue",
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                },
              ]}
            >
              <Text style={h5Style}>{renderSendTo()}</Text>
              <View
                style={{
                  backgroundColor: "blue",
                  borderRadius: 100,
                  padding: 10,
                }}
              >
                <TouchableOpacity onPress={sendSnap}>
                  <MaterialIcons name="send" color={"white"} size={30} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
};

export default RecordVideo;
