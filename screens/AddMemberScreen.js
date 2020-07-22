import React, { useEffect, useState, useMemo } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Input, Icon, Button, CheckBox, Avatar } from "react-native-elements";
import {
  h2Style,
  h3Style,
  h4Style,
  h6Style,
  h5Style,
  vs30,
  selectedAvatar,
  errorStyle,
  spacedRow,
  vsKeyboard,
} from "../styles/styles";
import { useSelector, useDispatch } from "react-redux";
import _ from "lodash";
import axios from "axios";
import firebase from "../firebase";
import { useFirestoreConnect } from "react-redux-firebase";
import { ScrollView } from "react-native-gesture-handler";
import {
  ADD_MEMBER_TO_GROUP,
  ADD_MEMBER_TO_AREA,
} from "../constants/reducerConstants";
const ROOT_URL = "https://us-central1-poker-cf130.cloudfunctions.net";

const AddMemberScreen = ({ navigation }) => {
  const firestore = firebase.firestore();
  const xAvatars = useSelector((state) => state.avatars.user || []);
  const [_loading, loading] = useState(false);
  const [_phone, setPhone] = useState("");
  const [_email, setEmail] = useState("");
  const [_avatar, selectAvatar] = useState(
    "https://firebasestorage.googleapis.com/v0/b/poker-cf130.appspot.com/o/avatars%2Ffish.png?alt=media&token=6381537c-65b8-4ecd-a952-a3a8579ff883"
  );
  const [_password, setPassword] = useState("");
  const [_displayName, setDisplayName] = useState("");
  const xGroup = useSelector((state) => state.group || {});
  const [_phoneError, setPhoneError] = useState(false);
  const [_phoneErrorMsg, setPhoneErrorMsg] = useState("");
  const [_showAvatarPicker, avatarPicker] = useState(false);
  const [_emailError, setEmailError] = useState(false);
  const [_emailErrorMsg, setEmailErrorMsg] = useState("");
  const [_submitError, setSubmitError] = useState(false);
  const [_submitErrorMsg, setSubmitErrorMsg] = useState("");
  const [_displayNameError, setDisplayNameError] = useState(false);
  const [_displayNameErrorMsg, setDisplayNameErrorMsg] = useState("");

  const [_passwordError, setPasswordError] = useState(false);
  const [_passwordErrorMsg, setPasswordErrorMsg] = useState("");

  const [_includeEP, setIncludeEP] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    selectAvatar(xAvatars?.[0]?.url || "");
  }, [xAvatars]);

  const updateIfMatchesPhonePattern = async (value) => {
    console.log("UPDATEIFMATCHES", value);
    if (value) {
      var numericReg = /^[0-9\b]+$/;
      if (numericReg.test(value)) {
        setPhone(value);
      }
    } else {
      setPhone(value);
    }
  };

  const checkIfPhoneExists = async (phone) => {
    console.log("CHECKING IF PHONE EXISTS", phone);
    try {
      let { data } = await axios.post(`${ROOT_URL}/checkIfUserExistsByPhone`, {
        phone: phone,
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

  const checkIfEmailExists = async (email) => {
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
    setPhoneErrorMsg("");
    setPhoneError(false);
    setEmailError(false);
    setEmailErrorMsg("");
    setPasswordError(false);
    setPasswordErrorMsg("");
    setDisplayNameError(false);
    setDisplayNameErrorMsg("");
    loading(true);

    try {
      if (_displayName.length < 3) {
        setDisplayNameError(true);
        setDisplayNameErrorMsg(
          "Display name should be at least 2 characters (initials?)"
        );
      }

      if (_phone.length !== 10) {
        setPhoneError(true);
        setPhoneErrorMsg("Phone should be 10 digits long");
        loading(false);
        return;
      }

      if (_includeEP) {
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test(_email)) {
          setEmailError(true);
          setEmailErrorMsg("Bad email format");
          loading(false);
          return;
        }

        if (_password.length < 6) {
          setPasswordError(true);
          setPasswordErrorMsg("Password must be 6 characters");
          loading(false);
          return;
        }
      }

      let phoneExits = await checkIfPhoneExists(_phone);
      if (phoneExits) {
        setPhoneError(true);
        setPhoneErrorMsg("Phone Number already exists");
        loading(false);
        return;
      }

      if (_includeEP) {
        let emailExists = await checkIfEmailExists(_email);
        if (emailExists) {
          setEmailError(true);
          setEmailErrorMsg("Email already exists");
          loading(false);
          return;
        }
      }

      let { data } = await axios.post(`${ROOT_URL}/createUser`, {
        includeEP: _includeEP,
        email: _email,
        phone: `1${_phone}`,
        id: xGroup.id,
        displayName: _displayName,
        password: _password,
        photoURL: _avatar,
      });

      const { data: newUser } = data;
      dispatch({ type: ADD_MEMBER_TO_GROUP, payload: newUser });
      dispatch({ type: ADD_MEMBER_TO_AREA, payload: newUser });
      setPassword("");
      setPhone("");
      setEmail("");

      navigation.goBack();

      loading(false);
    } catch (error) {
      console.log("ERROR", error);
      setSubmitError(true);
      setSubmitErrorMsg(error);
      loading(false);
    }
  };

  if (_.isEmpty(xAvatars)) return <ActivityIndicator />;
  return (
    <ScrollView>
      <Text style={h2Style}>{`Add a new member to ${xGroup.groupName}`}</Text>

      <Text style={h5Style}>Phone Number</Text>
      <Input
        placeholder="3069999999"
        required
        maxLength={10}
        value={_phone}
        onChangeText={(p) => updateIfMatchesPhonePattern(p)}
        errorStyle={{ color: "red" }}
        errorMessage={_phoneError ? _phoneErrorMsg : ""}
        leftIcon={<Icon name="phone" size={24} color="black" />}
      />

      <View style={spacedRow}>
        <View>
          <Text style={h5Style}>Display Name</Text>
          <Input
            placeholder="Big Al"
            value={_displayName}
            onChangeText={(p) => setDisplayName(p)}
            errorStyle={{ color: "red" }}
            errorMessage={_displayNameError ? _displayNameErrorMsg : ""}
          />
        </View>
        <Avatar
          onPress={() => avatarPicker(true)}
          showAccessory
          accessory={{
            name: "check",
            type: "material",
            color: "green",
          }}
          size="medium"
          rounded
          source={{
            uri: _avatar,
          }}
        />
      </View>

      {_showAvatarPicker && (
        <ScrollView horizontal>
          {xAvatars.map((a, i) => {
            return (
              <Avatar
                onPress={() => {
                  selectAvatar(a.url);
                  avatarPicker(false);
                }}
                key={i}
                showAccessory={_avatar === a.url}
                accessory={{
                  name: "check",
                  type: "material",
                  color: "green",
                }}
                size="medium"
                rounded
                source={{
                  uri: a?.url,
                }}
              />
            );
          })}
        </ScrollView>
      )}

      <CheckBox
        title="Include Email and Password"
        checked={_includeEP}
        onPress={() => setIncludeEP(!_includeEP)}
      />

      {_includeEP && (
        <View>
          <Text style={h5Style}>Email</Text>
          <Input
            placeholder="test@mail.com"
            value={_email}
            onChangeText={(p) => setEmail(p)}
            leftIcon={<Icon name="email" size={24} color="black" />}
            errorStyle={{ color: "red" }}
            errorMessage={_emailError ? _emailErrorMsg : ""}
          />

          <Text style={h5Style}>Password</Text>
          <Input
            placeholder="6 char w/#"
            secureTextEntry
            leftIcon={<Icon name="lock" size={24} color="black" />}
            value={_password}
            onChangeText={(p) => setPassword(p)}
            errorStyle={{ color: "red" }}
            errorMessage={_passwordError ? _passwordErrorMsg : ""}
          />
        </View>
      )}
      <View style={vs30} />

      <View style={vs30} />
      <Button loading={_loading} onPress={handleSubmit} title="Add Memeber" />
      {_submitError && (
        <Text style={[h5Style, errorStyle]}>{_submitErrorMsg}</Text>
      )}
      <View style={vs30} />
      <View style={vsKeyboard} />
    </ScrollView>
  );
};

export default AddMemberScreen;
