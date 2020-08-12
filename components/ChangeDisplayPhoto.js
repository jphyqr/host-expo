import React, { useState, useEffect, useRef } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Overlay, Button, Avatar } from "react-native-elements";
import { useSelector, useDispatch } from "react-redux";
import _ from "lodash";
import * as ImagePicker from "expo-image-picker";
import firebase from "../firebase";
import { vs30, h5Style } from "../styles/styles";
import { ScrollView } from "react-native-gesture-handler";
import {
  ADD_USER_PHOTO,
  SET_PHOTO_URL,
  SET_OVERLAY,
} from "../constants/reducerConstants";
import { uploadUserDisplayPhoto } from "../actions/userActions";
import MemoAvatar from "./MemoAvatar";
import { OVERLAYS } from "../constants/helperConstants";
const ChangeDisplayPhoto = ({ onOkay }) => {
  const profile = useSelector((state) => state.firebase.profile || {});
  const auth = useSelector((state) => state.firebase.auth || {});
  const [_photoLoading, photoLoading] = useState(false);
  const avatars = useSelector((state) => state.avatars.user || []);
  const [_photoUploaded, setPhotoUploaded] = useState(false);
  const [_uploadedPhotoSelected, setUploadedPhotoSelected] = useState(false);
  const firestore = firebase.firestore();
  const [_photo, setPhoto] = useState("");
  const dispatch = useDispatch();
  const [_avatar, setAvatar] = useState("");
  const [_fU, fU] = useState(1);
  const xUserPhotos = useSelector((state) => state.userPhotos || []);
  const [_userPhotos, setUserPhotos] = useState([]);
  useEffect(() => {
    if (!_.isEmpty(profile) && !_.isEmpty(avatars)) setAvatar(auth.photoURL);

    if (!_.isEmpty(avatars) && !_.isEmpty(profile)) {
      if (_.isEmpty(profile.photoURL)) {
        setAvatar(avatars[0].url);
      } else {
        setAvatar(profile.photoURL);
      }
    }
  }, [profile, avatars]);

  //   useEffect(() => {
  //     if (!_.isEmpty(xUserPhotos)) setUserPhotos(xUserPhotos);
  //   }, [xUserPhotos]);

  const avatarRef = useRef(false);
  useEffect(() => {
    const updatePhotoURL = async () => {
      photoLoading(true);
      try {
        await firestore.collection("users").doc(auth.uid).update({
          photoURL: _avatar,
        });

        var user = firebase.auth().currentUser;

        await user.updateProfile({
          photoURL: _avatar,
        });
        dispatch({ type: SET_PHOTO_URL, payload: _avatar });
        dispatch({ type: SET_OVERLAY, payload: OVERLAYS.CLEAR });

        photoLoading(false);
      } catch (error) {
        photoLoading(false);
        console.log("error uploading photo", error);
      }
    };

    if (!_.isEmpty(profile) && profile.photoURL !== _avatar) {
      if (avatarRef.current) updatePhotoURL();
      else avatarRef.current = true;
    }
  }, [_avatar]);

  const handlePickPhoto = async () => {
    let permissionResult = await ImagePicker.requestCameraRollPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync();

    setPhoto(pickerResult.uri);

    dispatch({
      type: ADD_USER_PHOTO,
      payload: {
        url: pickerResult.uri,
      },
    });

    dispatch({ type: SET_PHOTO_URL, payload: pickerResult.uri });

    setUploadedPhotoSelected(true);
    try {
      photoLoading(true);
      setPhotoUploaded(true);
      setAvatar("");
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
        xhr.open("GET", pickerResult.uri, true);
        xhr.send(null);
      });
      let photo = await dispatch(uploadUserDisplayPhoto(blob));

      setAvatar(photo.url);
      await firestore.collection("users").doc(auth.uid).update({
        userHasSetAvatar: true,
      });

      fU(_fU + 1);
      photoLoading(false);
    } catch (error) {
      console.log("error picking photo", error);
      photoLoading(false);
    }
  };

  return (
    <Overlay isVisible={true}>
      <View>
        <Text>ChangeDisplayPhoto</Text>
        <View style={vs30} />

        <Text style={h5Style}>Select Avatar</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <Avatar
            key={"addphoto"}
            rounded
            icon={{ name: "add" }}
            size="large"
            overlayContainerStyle={{ backgroundColor: "blue" }}
            onPress={async () => {
              await handlePickPhoto();
            }}
          />

          {_photoUploaded && (
            <MemoAvatar
              key={"addedphoto"}
              rounded
              source={{
                uri: _photo,
              }}
              updateOn={_photo}
              avatarStyle={{
                opacity: _.isEmpty(_avatar) ? 0.5 : 1,
              }}
              showAccessory={_uploadedPhotoSelected}
              accessory={{
                name: "check",
                type: "material",
                color: "green",
              }}
              size="large"
              onPress={async () => {
                await firestore.collection("users").doc(auth.uid).update({
                  userHasSetAvatar: true,
                });
                setAvatar(_photo);
                setUploadedPhotoSelected(true);
              }}
            />
          )}

          {_userPhotos.map((a, i) => {
            return React.useMemo(
              () => (
                <MemoAvatar
                  onPress={async () => {
                    await firestore.collection("users").doc(auth.uid).update({
                      userHasSetAvatar: true,
                    });
                    setAvatar(a.url);
                    setUploadedPhotoSelected(false);
                  }}
                  key={i}
                  showAccessory={_avatar === a.url}
                  accessory={{
                    name: "check",
                    type: "material",
                    color: "green",
                  }}
                  size="large"
                  rounded
                  source={{
                    uri: a.url,
                  }}
                  updateOn={a.url}
                />
              ),
              []
            );
          })}

          {avatars.map((a, i) => {
            return React.useMemo(
              () => (
                <MemoAvatar
                  onPress={async () => {
                    await firestore.collection("users").doc(auth.uid).update({
                      userHasSetAvatar: true,
                    });
                    setAvatar(a.url);
                    setUploadedPhotoSelected(false);
                  }}
                  key={i}
                  showAccessory={_avatar === a.url}
                  accessory={{
                    name: "check",
                    type: "material",
                    color: "green",
                  }}
                  size="large"
                  rounded
                  source={{
                    uri: a.url,
                  }}
                  updateOn={a.url}
                />
              ),
              []
            );
          })}
        </View>
        <Text style={h5Style}>Selected Avatar</Text>
        <Avatar
          size="large"
          rounded
          source={{
            uri: profile.photoURL,
          }}
        ></Avatar>
        <Button loading={_photoLoading} onPress={onOkay} title="Close" />
      </View>
    </Overlay>
  );
};

export default ChangeDisplayPhoto;
