import React, { useState, useEffect, useRef } from "react";
import { View, Text, Alert } from "react-native";
import { Overlay, Input, Button, Icon } from "react-native-elements";
import firebase from "../firebase";
import { useSelector, useDispatch } from "react-redux";
import { h5Style, vs30, errorStyle } from "../styles/styles";
import _ from "lodash";
import { debounce } from "lodash";
import { SET_DISPLAY_NAME } from "../constants/reducerConstants";
const EmailPassword = ({ onOkay }) => {
  const firestore = firebase.firestore();
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.firebase.profile || {});
  const auth = useSelector((state) => state.firebase.auth || {});
  const [_displayName, setDisplayName] = useState("");
  const [_displayNameChanged, displayNameChanged] = useState(false);
  const [_displayNameError, setDisplayNameError] = useState(false);
  const [_displayNameErrorMsg, setDisplayNameErrorMsg] = useState("");

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
  const [_loading, loading] = useState(false);
  const [_submitError, setSubmitError] = useState(false);
  const [_submitErrorMsg, setSubmitErrorMsg] = useState("");

  const debouncedSearchTerm = useDebounce(_displayName, 1000);

  function useDebounce(value, delay) {
    // State and setters for debounced value
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      if (_displayNameChanged) {
        setTimeout(() => {
          displayNameChanged(false);
        }, 500);
      }
    }, [_displayNameChanged]);

    useEffect(
      () => {
        // Update debounced value after delay
        const handler = setTimeout(() => {
          setDebouncedValue(value);
        }, delay);

        // Cancel the timeout if value changes (also on delay change or unmount)
        // This is how we prevent debounced value from updating if value is changed ...
        // .. within the delay period. Timeout gets cleared and restarted.
        return () => {
          clearTimeout(handler);
        };
      },
      [value, delay] // Only re-call effect if value or delay changes
    );

    return debouncedValue;
  }

  const displayNameRef = useRef(false);
  //   useEffect(() => {
  //     const updateDisplayName = async () => {
  //       var user = firebase.auth().currentUser;

  //       await firestore.collection("users").doc(auth.uid).update({
  //         displayName: _displayName,
  //         userHasSetDisplayName: true,
  //       });

  //       await user.updateProfile({
  //         displayName: _displayName,
  //       });

  //       displayNameChanged(true);
  //     };

  //     if (!_.isEmpty(debouncedSearchTerm)) {
  //       if (displayNameRef.current) updateDisplayName();
  //       else displayNameRef.current = true;
  //     }
  //   }, [debouncedSearchTerm]);

  useEffect(() => {
    auth.isLoaded && setEmail(auth.email);

    if (auth.isLoaded && !_.isEmpty(auth.email)) {
      setEmailSet(true);
      setEmail(auth.email);
    }

    if (profile.isLoaded) {
      setDisplayName(profile.displayName);
    }
  }, []);

  const checkIfEmailExists = async (email) => {
    const ROOT_URL = "https://us-central1-poker-cf130.cloudfunctions.net";

    try {
      let { data } = await axios.post(`${ROOT_URL}/checkIfUserExistsByEmail`, {
        email: email,
      });

      const { data: userExists } = data;

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
        displayName: _displayName,
        userHasSetDisplayName: true,
      });

      await user.updateProfile({
        displayName: _displayName,
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
    <Overlay isVisible={true}>
      <View>
        <Text style={h5Style}>Display Name</Text>
        <Input
          rightIcon={
            _displayNameChanged ? (
              <Icon name="check" size={24} color="green" />
            ) : (
              <Icon
                style={{ opacity: 0.3 }}
                name="check"
                size={24}
                color="black"
              />
            )
          }
          leftIcon={<Icon name="verified-user" size={24} color="black" />}
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
        <Button
          title="Later"
          loading={_loading}
          onPress={async () => {
            loading(true);
            var user = firebase.auth().currentUser;
            await firestore.collection("users").doc(auth.uid).update({
              displayName: _displayName,
              userHasSetDisplayName: true,
            });

            await user.updateProfile({
              displayName: _displayName,
            });

            dispatch({ type: SET_DISPLAY_NAME, payload: _displayName });

            loading(false);
            onOkay();
          }}
          type="outline"
        />
      </View>
    </Overlay>
  );
};

export default EmailPassword;
