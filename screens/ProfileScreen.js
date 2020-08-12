import React, { useEffect, useState, useRef } from "react";
import { View, Text, Alert, ActivityIndicator } from "react-native";
import firebase from "../firebase";
import { useSelector } from "react-redux/lib/hooks/useSelector";
import { Avatar, Input, Button, Icon } from "react-native-elements";
import { ScrollView } from "react-native-gesture-handler";
import { useDispatch } from "react-redux";
import _ from "lodash";
import * as ImagePicker from "expo-image-picker";
import {
  vs30,
  h5Style,
  vsKeyboard,
  spacedRow,
  averageRow,
  errorStyle,
} from "../styles/styles";
import { debounce } from "lodash";
import { uploadUserDisplayPhoto } from "../actions/userActions";
import { useFirestoreConnect } from "react-redux-firebase";
import { ADD_USER_PHOTO } from "../constants/reducerConstants";
import images from "../assets/images";
import MemoAvatar from "../components/MemoAvatar";
const ProfileScreen = ({ navigation }) => {
  const profile = useSelector((state) => state.firebase.profile || {});
  const auth = useSelector((state) => state.firebase.auth || {});
  const [_photoLoading, photoLoading] = useState(false);
  const avatars = useSelector((state) => state.avatars.user || []);
  const [_photoUploaded, setPhotoUploaded] = useState(false);
  const [_uploadedPhotoSelected, setUploadedPhotoSelected] = useState(false);
  const firestore = firebase.firestore();
  const [_photo, setPhoto] = useState("");
  const [_displayName, setDisplayName] = useState("");
  const [_displayNameChanged, displayNameChanged] = useState(false);
  const [_displayNameError, setDisplayNameError] = useState(false);
  const [_displayNameErrorMsg, setDisplayNameErrorMsg] = useState("");
  const [user_photos, setPhotos] = useState([]);
  const dispatch = useDispatch();
  const [_avatar, setAvatar] = useState("");
  const [_fU, fU] = useState(1);
  const [_updatingDisplayName, updatingDisplayName] = useState(false);

  const xUserPhotos = useSelector((state) => state.userPhotos || []);

  useEffect(() => {
    setPhotos(xUserPhotos);
  }, [xUserPhotos]);

  useEffect(() => {
    setDisplayName(auth.displayName);

    if (!_.isEmpty(auth) && !_.isEmpty(avatars)) setAvatar(auth.photoURL);

    if (!_.isEmpty(avatars) && !_.isEmpty(auth)) {
      if (_.isEmpty(auth.photoURL)) {
        setAvatar(avatars[0].url);
      } else {
        setAvatar(auth.photoURL);
      }
    }
  }, [auth, avatars]);

  useEffect(() => {
    if (profile.userHasSetAvatar && profile.userHasSetDisplayName) {
      if (profile.userHasSetEP) {
        navigation.navigate("Main");
      } else {
        navigation.navigate("SecurityScreen");
      }
    }
  }, []);

  useEffect(() => {
    console.log("auth changed use effect");
  }, [auth.displayName]);

  const avatarRef = useRef(false);
  useEffect(() => {
    console.log("ener useEffect", _avatar);
    const updatePhotoURL = async () => {
      console.log("avatar changed, should updatePhotoURL");

      try {
        await firestore.collection("users").doc(auth.uid).update({
          photoURL: _avatar,
        });

        var user = firebase.auth().currentUser;

        await user.updateProfile({
          photoURL: _avatar,
        });
      } catch (error) {
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

      console.log({ photo });

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

  if (!profile.isLoaded) return <ActivityIndicator />;
  return (
    <ScrollView>
      <View style={vs30} />

      <View style={vs30} />

      <View style={vs30} />

      <View style={spacedRow}>
        <View>
          <Text style={h5Style}>Display Name</Text>
          <Input
            inputStyle={{ flexBasis: "50%" }}
            placeholder="Big Al"
            value={_displayName}
            onChangeText={(p) => {
              setDisplayName(p);
              displayNameChanged(true);
            }}
            errorStyle={{ color: "red" }}
            errorMessage={_displayNameError ? _displayNameErrorMsg : ""}
          />
        </View>
        <Button
          loading={_updatingDisplayName}
          disabled={!_displayNameChanged}
          title="Update Display Name"
          onPress={async () => {
            try {
              updatingDisplayName(true);
              await firestore.collection("users").doc(auth.uid).update({
                displayName: _displayName,
                userHasSetDisplayName: true,
              });
              var user = firebase.auth().currentUser;

              await user.updateProfile({
                displayName: _displayName,
              });

              console.log(auth.displayName);
              fU(_fU + 1);
              updatingDisplayName(false);
              displayNameChanged(false);
            } catch (error) {
              console.log("error updating display name", error);
              updatingDisplayName(false);
              displayNameChanged(false);
            }
          }}
        ></Button>
      </View>

      <View style={vs30} />

      <Text style={h5Style}>Select Avatar</Text>
      <ScrollView horizontal>
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
          <Avatar
            key={"addedphoto"}
            rounded
            source={{
              uri: _photo,
            }}
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

        {xUserPhotos.map((a, i) => {
          return React.useMemo(
            () => (
              <Avatar
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
              />
            ),
            []
          );
        })}

        {avatars.map((a, i) => {
          return React.useMemo(
            () => (
              <Avatar
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
              />
            ),
            []
          );
        })}
      </ScrollView>

      <View style={vsKeyboard} />
    </ScrollView>
  );
};

export default ProfileScreen;
