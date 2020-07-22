import React, { useState, useEffect } from "react";
import { View, Text, Alert } from "react-native";
import { Overlay, Input, Button } from "react-native-elements";
import { useSelector } from "react-redux";
import { h5Style } from "../styles/styles";
import firebase from "../firebase";
const DisplayName = ({ onOkay }) => {
  const [_displayName, setDisplayName] = useState("");
  const [_displayNameChanged, displayNameChanged] = useState(false);
  const [_displayNameError, setDisplayNameError] = useState(false);
  const [_displayNameErrorMsg, setDisplayNameErrorMsg] = useState("");
  const auth = useSelector((state) => state.firebase.auth || {});
  const [_fU, fU] = useState(1);
  const [_updatingDisplayName, updatingDisplayName] = useState(false);
  const firestore = firebase.firestore();
  useEffect(() => {
    setDisplayName(auth.displayName);
  }, [auth]);

  return (
    <Overlay>
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

      <Button
        title={
          !_displayNameChanged ? `${_displayName} is fine` : "Set Displayname"
        }
        loading={_updatingDisplayName}
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

            updatingDisplayName(false);
            displayNameChanged(false);
            onOkay();
          } catch (error) {
            console.log("error updating display name", error);
            Alert.alert(
              "Oops!",
              "cound not update display name",
              [{ text: "OK", onPress: () => onOkay() }],
              { cancelable: false }
            );
            updatingDisplayName(false);
            displayNameChanged(false);
          }
        }}
      />
    </Overlay>
  );
};

export default DisplayName;
