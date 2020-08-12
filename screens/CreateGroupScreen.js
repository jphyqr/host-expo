import React, { useEffect, useState } from "react";
import { View, Text, Alert } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { useSelector, useDispatch } from "react-redux";
import { ScrollView } from "react-native-gesture-handler";
import { Avatar, Input, ButtonGroup, Button } from "react-native-elements";
import _ from "lodash";
import * as ImagePicker from "expo-image-picker";
import firebase from "../firebase";

import { h5Style, errorStyle, h6Style, vs30, vs10 } from "../styles/styles";
import { PRIVACY } from "../constants/helperConstants";
import {
  CREATE_GROUP,
  SET_GROUP,
  CREATE_HOST_GROUP,
} from "../constants/reducerConstants";
import { uploadPhotoPreGroup } from "../actions/groupActions";
import MemoAvatar from "../components/MemoAvatar";
const CreateGroupScreen = ({ navigation }) => {
  const avatars = useSelector((state) => state.avatars.venue || []);
  const dispatch = useDispatch();
  const [_avatar, setAvatar] = useState({});
  const [_privacyIndex, setPrivacyIndex] = useState(0);
  const [_submitError, setSubmitError] = useState(false);
  const [_submitErrorMsg, setSubmitErrorMsg] = useState("");
  const [_photoUploaded, setPhotoUploaded] = useState(false);
  const [_photo, setPhoto] = useState({});
  const [_photoLoading, photoLoading] = useState(false);
  const [_displayName, setDisplayName] = useState("");
  const [_displayNameError, setDisplayNameError] = useState(false);
  const [_displayNameErrorMsg, setDisplayNameErrorMsg] = useState("");
  const firestore = firebase.firestore();
  const [_uploadedPhotoSelected, setUploadedPhotoSelected] = useState(false);
  const [_loading, loading] = useState(false);
  const privacies = [PRIVACY.OPEN, PRIVACY.PRIVATE];
  const auth = useSelector((state) => state.firebase.auth || {});
  const profile = useSelector((state) => state.firebase.profile || {});

  useEffect(() => {
    if (_.isEmpty(_avatar) && !_.isEmpty(avatars)) setAvatar(avatars[0].url);
  }, [avatars]);

  const handleSubmit = async () => {
    setDisplayNameErrorMsg("");
    setDisplayNameError(false);
    try {
      loading(true);

      if (_displayName.length < 1 || _displayName.length > 10) {
        setDisplayNameError(true);
        setDisplayNameErrorMsg("display name should be 1-10 Chars");
        loading(false);
        return;
      }
      let newGroup = {
        creationDate: Date.now(),
        name: _displayName,
        privacy: privacies[_privacyIndex],
        hostUid: auth.uid,
        photoURL: _avatar,
        area: "REGINA_SK",
        hostedBy: profile.displayName,
        hostPhotoURL: profile.photoURL || "/assets/user.png",
        members: {
          [auth.uid]: {
            joinDate: Date.now(),
            photoURL: profile.photoURL || "/assets/user.png",
            displayName: profile.displayName,
            host: true,
            rankScore: 0,
          },
        },
      };
      let addGroup = await firestore.collection("groups").add(newGroup);
      console.log("addgroupid", addGroup.id);
      let newGroupMember = {
        groupName: _displayName,
        privacy: privacies[_privacyIndex],
        groupId: addGroup.id,
        userUid: auth.uid,
        userDisplayName: profile.displayName,
        groupPhotoURL: _avatar,
        userPhotoURL: profile.photoURL,
        hostUid: auth.uid,
        joinDate: Date.now(),
        host: true,
        area: "REGINA_SK",
      };

      await firestore
        .collection("group_member")
        .doc(`${addGroup.id}_${auth.uid}`)
        .set(newGroupMember);

      dispatch({
        type: CREATE_HOST_GROUP,
        payload: { id: `${addGroup.id}_${auth.uid}`, ...newGroupMember },
      });

      dispatch({
        type: SET_GROUP,
        payload: { id: addGroup.id, ...newGroup },
      });
      navigation.goBack();
      navigation.navigate("Feed", {
        screen: "ManageGroupFlow",
        groupPhotoURL: _avatar,
        groupName: _displayName,
      });
      loading(false);
    } catch (error) {
      console.log("create group error", error);
      setSubmitErrorMsg(error);
      setSubmitError(true);
      loading(false);
    }
  };

  const handlePickPhoto = async () => {
    let permissionResult = await ImagePicker.requestCameraRollPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync();

    setPhoto(pickerResult.uri);

    setUploadedPhotoSelected(true);
    try {
      photoLoading(true);
      setPhotoUploaded(true);
      setAvatar({});
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
      let photo = await dispatch(uploadPhotoPreGroup(blob));
      console.log({ photo });

      setAvatar(photo.url);

      photoLoading(false);
    } catch (error) {
      console.log("error picking photo", error);
      photoLoading(false);
    }
  };

  return (
    <View>
      <View>
        <Text style={h5Style}>Group Name</Text>
        <Input
          placeholder="Big Game"
          value={_displayName}
          onChangeText={(p) => setDisplayName(p)}
          errorStyle={{ color: "red" }}
          errorMessage={_displayNameError ? _displayNameErrorMsg : ""}
        />
      </View>

      <Text style={h5Style}>Group Privacy</Text>

      <Text style={h6Style}>Private groups are invite only</Text>
      <Text style={h6Style}>Open groups are discoverable in area</Text>

      <ButtonGroup
        selectedIndex={_privacyIndex}
        buttons={privacies}
        onPress={(i) => setPrivacyIndex(i)}
      />

      <View style={vs30} />
      <Text style={h5Style}>Select Group Avatar</Text>

      <View style={vs10} />
      <ScrollView horizontal>
        <Avatar
          key={"addphoto"}
          rounded
          icon={{ name: "add" }}
          size="large"
          overlayContainerStyle={{ backgroundColor: "blue" }}
          onPress={handlePickPhoto}
        />

        {_photoUploaded && (
          <MemoAvatar
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
            onPress={() => {
              setAvatar(_photo);
              setUploadedPhotoSelected(true);
            }}
          />
        )}

        {avatars.map((a, i) => {
          return (
            <MemoAvatar
              onPress={() => {
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
                uri: a?.url,
              }}
            />
          );
        })}
      </ScrollView>
      <View style={vs30} />
      <Button
        loading={_.isEmpty(_avatar) || _loading}
        disabled={_loading}
        onPress={handleSubmit}
        title="Create Group"
      />
      {_.isEmpty(_avatar) && <Text style={h5Style}>Uploading photo...</Text>}
      <Text style={[h5Style, errorStyle]}>{_submitErrorMsg}</Text>
    </View>
  );
};

export default CreateGroupScreen;
