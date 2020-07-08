import React, { useState } from "react";

import {
  View,
  Text,
  ActivityIndicator,
  Picker,
  StyleSheet,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { useDispatch } from "react-redux/lib/hooks/useDispatch";
import axios from "axios";
import { Input, Button, Icon } from "react-native-elements";
import { SET_PHONE } from "../constants/reducerConstants";
import { AppLoading } from "expo";
import {
  h1Style,
  h2Style,
  h5Style,
  h6Style,
  spacedRow,
  vsKeyboard,
  centeredRow,
  vs30,
} from "../styles/styles";

const ROOT_URL = "https://us-central1-poker-cf130.cloudfunctions.net";

const RequestCodeScreen = ({ navigation }) => {
  const [_phone, setPhone] = useState("");
  const [_phoneError, setPhoneError] = useState(false);
  const [_phoneErrorMsg, setPhoneErrorMsg] = useState("");
  const [_error, error] = useState(false);
  const [_errorText, errorText] = useState("");
  const [_area, sA] = useState("REGINA_SK");
  const [_loading, loading] = useState(false);
  const dispatch = useDispatch();
  const handleSubmit = async () => {
    setPhoneErrorMsg("");
    setPhoneError(false);
    dispatch({ type: SET_PHONE, payload: _phone });
    loading(true);
    try {
      if (_phone.length !== 10) {
        setPhoneError(true);
        setPhoneErrorMsg("Phone should be 10 digits long");
        loading(false);
        return;
      }

      await axios.post(`${ROOT_URL}/createUserByPhone`, {
        phone: _phone,
        area: _area,
      });
      await axios.post(`${ROOT_URL}/requestOneTimePassword`, {
        phone: `+1${_phone}`,
      });
      loading(false);
      navigation.navigate("EnterCode");
    } catch (err) {
      console.log(err);
      error(true);
      errorText(err);
      loading(false);
    }
  };

  if (_loading) {
    return <ActivityIndicator size="large" />;
  }

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

  return (
    <View>
      <View>
        <Text style={h5Style}>Select Area</Text>
        <RNPickerSelect
          style={pickerSelectStyles}
          value={_area}
          onValueChange={(value) => sA(value)}
          items={[
            { label: "Regina", value: "REGINA_SK" },
            { label: "Saskatoon", value: "SASKATOON_SK" },
          ]}
        />
      </View>
      <View style={vs30} />
      <View style={{ marginBottom: 10 }}>
        <Text style={[h5Style, { marginBottom: 10 }]}>
          Register or Login with Mobile
        </Text>

        <Text style={h6Style}>Enter Phone Number</Text>

        <View style={spacedRow}>
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
        </View>
      </View>

      <Button
        disabled={_phone.length < 10}
        onPress={handleSubmit}
        title="Submit"
        loading={_loading}
      />
      {/* <Button onPress={() => navigation.navigate("Welcome")} title="Back" /> */}
      {_error && <Text>{_errorText}</Text>}

      <View style={{ marginBottom: 10, marginTop: 30 }}>
        <Text style={h1Style}>Already A Member?</Text>
        <Button
          onPress={() => navigation.navigate("EmailPassword")}
          title="Login with Email/Password"
        />
      </View>

      <View style={vsKeyboard} />
    </View>
  );
};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    color: "black",
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: "purple",
    borderRadius: 8,
    color: "black",
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});

export default RequestCodeScreen;
