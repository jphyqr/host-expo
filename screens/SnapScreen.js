import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ImageBackground,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Button, Image } from "react-native-elements";
import { vs30 } from "../styles/styles";
import { Video } from "expo-av";
import _ from "lodash";
import {
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import firebase from "../firebase";

import { useSelector } from "react-redux";
const SnapScreen = ({ navigation, route }) => {
  console.log({ route });
  const firestore = firebase.firestore();
  const [_snaps, setSnaps] = useState([]);
  const [_showIndex, setShowIndex] = useState(0);

  useEffect(() => {
    const getSnapsForDestination = async () => {
      console.log("GET SNAPS FOR DESTINATION");
      let snaps = [];
      let snapsSnap = await firestore
        .collection("snaps")
        .where("destinationId", "==", route.params.destinationId)
        .get();

      snapsSnap.forEach((doc) => {
        snaps.push({ id: doc.id, ...doc.data() });
      });

      setSnaps(snaps);
      console.log(snaps.length);

      await firestore
        .collection("snaps")
        .doc(snaps[0]?.id)
        .collection("viewers")
        .doc(firebase.auth().currentUser.uid)
        .set({
          viewedAt: Date.now(),
          viewerUid: firebase.auth().currentUser.uid,
          viewerPhotoURL: firebase.auth().currentUser.photoURL,
          viewerDisplayName: firebase.auth().currentUser.displayName,
        });
    };

    if (!_.isEmpty(route.params.destinationId)) getSnapsForDestination();
  }, [route?.params?.destinationId]);

  useEffect(() => {
    const logViewer = async () => {
      console.log("LOG VIEWER", _snaps[_showIndex]);
      await firestore
        .collection("snaps")
        .doc(_snaps[_showIndex]?.id)
        .collection("viewers")
        .doc(firebase.auth().currentUser.uid)
        .set({
          viewedAt: Date.now(),
          viewerUid: firebase.auth().currentUser.uid,
          viewerPhotoURL: firebase.auth().currentUser.photoURL,
          viewerDisplayName: firebase.auth().currentUser.displayName,
        });
    };

    if (!_.isEmpty(_snaps)) logViewer();
  }, [_showIndex]);

  return (
    <View style={{ flex: 1, flexDirection: "column" }}>
      <TouchableWithoutFeedback
        onPress={() => {
          console.log("TOUCHED ");
          if (_showIndex < _snaps.length - 1) setShowIndex(_showIndex + 1);
          else navigation.goBack();
        }}
      >
        {_snaps[_showIndex]?.mediaType === "video" ? (
          <Video
            source={{ uri: _snaps[_showIndex]?.url }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="cover"
            shouldPlay
            isLooping
            style={{ width: "100%", height: "100%" }}
          >
            <View
              style={{
                height: "100%",
                width: "25%",
              }}
            >
              <TouchableWithoutFeedback
                style={{
                  height: "100%",
                  width: "100%",
                }}
                onPress={() => {
                  console.log("TOUCHED ");
                  if (_showIndex > 0) setShowIndex(_showIndex - 1);
                  else navigation.goBack();
                }}
              ></TouchableWithoutFeedback>
            </View>
            <View style={vs30} />
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={{ fontSize: 30, color: "white" }}>X</Text>
            </TouchableOpacity>

            <View
              style={{
                width: "100%",
                height: 20,
                zIndex: 10,
                position: "absolute",
                bottom: 0,
                flexDirection: "row",
              }}
            >
              {_snaps.map((s, i) => {
                return (
                  <View
                    key={i}
                    style={{
                      height: 15,
                      width:
                        Dimensions.get("window").width / _snaps.length -
                        (_snaps.length - 1),
                      backgroundColor: i === _showIndex ? "lightgrey" : "grey",
                      borderRadius: 10,
                      marginRight: 5,
                    }}
                  ></View>
                );
              })}
            </View>
          </Video>
        ) : (
          <Image
            containerStyle={{
              height: "100%",
              width: "100%",
            }}
            source={{ uri: _snaps[_showIndex]?.url }}
            style={{ height: "100%", width: "100%" }}
            PlaceholderContent={<ActivityIndicator />}
          >
            <View
              style={{
                height: "100%",
                width: "25%",
              }}
            >
              <TouchableWithoutFeedback
                style={{
                  height: "100%",
                  width: "100%",
                }}
                onPress={() => {
                  console.log("TOUCHED ");
                  if (_showIndex > 0) setShowIndex(_showIndex - 1);
                  else navigation.goBack();
                }}
              ></TouchableWithoutFeedback>
            </View>
            <View style={vs30} />
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={{ fontSize: 30, color: "white" }}>X</Text>
            </TouchableOpacity>

            <View
              style={{
                width: "100%",
                height: 20,
                zIndex: 10,
                position: "absolute",
                bottom: 0,
                flexDirection: "row",
              }}
            >
              {_snaps.map((s, i) => {
                return (
                  <View
                    key={i}
                    style={{
                      height: 15,
                      width:
                        Dimensions.get("window").width / _snaps.length -
                        (_snaps.length - 1),
                      backgroundColor: i === _showIndex ? "lightgrey" : "grey",
                      borderRadius: 10,
                      marginRight: 5,
                    }}
                  ></View>
                );
              })}
            </View>
          </Image>
        )}
      </TouchableWithoutFeedback>
    </View>
  );
};

export default SnapScreen;
