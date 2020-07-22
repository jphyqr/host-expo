import React, { useState, useEffect } from "react";
import { View, Text, Alert } from "react-native";
import { Overlay, Input, Button, Icon } from "react-native-elements";
import firebase from "../firebase";
import { useSelector, useDispatch } from "react-redux";
import { h5Style, vs30, errorStyle } from "../styles/styles";
import _ from "lodash";
const EmailPassword = ({ onOkay }) => {
  const firestore = firebase.firestore();
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.firebase.profile || {});
  const auth = useSelector((state) => state.firebase.auth || {});

  const [_fU, fU] = useState(1);
  const [_updatingEP, updatingEP] = useState(false);
  const [_confirm, setConfirm] = useState("");
  const [_passwordError, setPasswordError] = useState(false);
  const [_passwordErrorMsg, setPasswordErrorMsg] = useState("");
  const [_confirmError, setConfirmError] = useState(false);
  const [_confirmErrorMsg, setConfirmErrorMsg] = useState("");
  const [_emailSet, setEmailSet] = useState(false);
  const [_email, setEmail] = useState("");
  const [_password, setPassword] = useState("");
  const [_emailError, setEmailError] = useState(false);
  const [_emailErrorMsg, setEmailErrorMsg] = useState("");

  const [_submitError, setSubmitError] = useState(false);
  const [_submitErrorMsg, setSubmitErrorMsg] = useState("");

  useEffect(() => {
    auth.isLoaded && setEmail(auth.email);

    if (auth.isLoaded && !_.isEmpty(auth.email)) {
      setEmailSet(true);
      setEmail(auth.email);
    }
  }, [auth]);

  const checkIfEmailExists = async (email) => {
    const ROOT_URL = "https://us-central1-poker-cf130.cloudfunctions.net";

    try {
      let { data } = await axios.post(`${ROOT_URL}/checkIfUserExistsByEmail`, {
        email: email,
      });

      const { data: userExists } = data;

      console.log({ userExists });
      if (userExists) {
        return true;
      } else {
        return false;
      }
    } catch {
      (error) => {
        console.log({ error });
        return false;
      };
    }
  };

  const handleSubmit = async () => {
    setEmailError(false);
    setEmailErrorMsg("");
    setPasswordError(false);
    setPasswordErrorMsg("");
    setConfirmError(false);
    setConfirmErrorMsg("");
    updatingEP(true);

    try {
      if (!_emailSet) {
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test(_email)) {
          setEmailError(true);
          setEmailErrorMsg("Bad email format");
          updatingEP(false);
          return;
        }
      }

      if (_password.length < 6) {
        setPasswordError(true);
        setPasswordErrorMsg("Password must be 6 characters");
        updatingEP(false);
        return;
      }

      if (_password !== _confirm) {
        setConfirmError(true);
        setConfirmErrorMsg("Password does not match");
        updatingEP(false);
        return;
      }
      if (!_emailSet) {
        let emailExists = await checkIfEmailExists(_email);
        if (emailExists) {
          setEmailError(true);
          setEmailErrorMsg("Email already exists");
          updatingEP(false);
          return;
        }
      }
      var user = firebase.auth().currentUser;

      if (!_emailSet) {
        await user.updateEmail(_email);
        await user.sendEmailVerification();
      }
      await user.updatePassword(_password);

      await firestore.collection("users").doc(auth.uid).update({
        userHasSetEP: true,
      });

      setEmailSet(true);

      if (_emailSet) {
        Alert.alert(
          "Password Updated",
          `Updated passworkd for  ${_email}`,
          [
            {
              text: "OK",
              onPress: () => onOkay(),
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          "Email and Password updated",
          `A verification e-mail has been sent to  ${_email}`,
          [
            {
              text: "OK",
              onPress: () => onOkay(),
            },
          ],
          { cancelable: false }
        );
      }

      updatingEP(false);
    } catch (error) {
      console.log("ERROR", error);
      setSubmitError(true);
      setSubmitErrorMsg(error.message);
      updatingEP(false);
    }
  };

  return (
    <Overlay>
      <View>
        <Text style={h5Style}>Email</Text>

        <Input
          inputStyle={{ flexBasis: "50%" }}
          placeholder="test@mail.com"
          value={_email}
          onChangeText={(p) => setEmail(p)}
          leftIcon={<Icon name="email" size={24} color="black" />}
          errorStyle={{ color: "red" }}
          disabled={_emailSet}
          errorMessage={_emailError ? _emailErrorMsg : ""}
        />

        <Text style={h5Style}>{`${
          _emailSet ? "Update Password" : "Password"
        }`}</Text>
        <Input
          placeholder="6 char w/#"
          secureTextEntry
          leftIcon={<Icon name="lock" size={24} color="black" />}
          value={_password}
          onChangeText={(p) => setPassword(p)}
          errorStyle={{ color: "red" }}
          errorMessage={_passwordError ? _passwordErrorMsg : ""}
        />
        <Text style={h5Style}>Confirm Password</Text>
        <Input
          placeholder="match password"
          secureTextEntry
          leftIcon={<Icon name="lock" size={24} color="black" />}
          value={_confirm}
          onChangeText={(p) => setConfirm(p)}
          errorStyle={{ color: "red" }}
          errorMessage={_confirmError ? _confirmErrorMsg : ""}
        />

        <Button
          disabled={
            !(
              _email?.length > 3 &&
              _password?.length > 5 &&
              _password?.length === _confirm?.length
            )
          }
          title={_emailSet ? "Update Password" : "Update E-mail/Password"}
          onPress={handleSubmit}
          loading={_updatingEP}
        />
        {_submitError && (
          <Text style={[h5Style, errorStyle]}>{_submitErrorMsg}</Text>
        )}

        <View style={vs30} />
        <Button title="Later" onPress={onOkay} type="outline" />
      </View>
    </Overlay>
  );
};

export default EmailPassword;
