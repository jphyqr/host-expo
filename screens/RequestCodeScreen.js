import React, { useState } from "react";

import { View, Button, Text, ActivityIndicator } from "react-native";
import { useDispatch } from "react-redux/lib/hooks/useDispatch";
import axios from "axios";
import { Input } from "react-native-elements";
import { SET_PHONE } from "../constants/reducerConstants";
import { AppLoading } from "expo";
import { h1Style, h2Style } from "../styles/styles";

const ROOT_URL = "https://us-central1-poker-cf130.cloudfunctions.net";

const RequestCodeScreen = ({ navigation }) => {
  const [_phone, setPhone] = useState("");
  const [_error, error] = useState(false);
  const [_errorText, errorText] = useState("");
  const [_loading, loading] = useState(false);
  const dispatch = useDispatch();
  const handleSubmit = async () => {
    dispatch({ type: SET_PHONE, payload: _phone });

    try {
      loading(true);
      await axios.post(`${ROOT_URL}/createUserByPhone`, {
        phone: _phone,
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

  return (
    <View>
      <View style={{ marginBottom: 10, marginTop: 30 }}>
        <Text style={[h1Style, { marginBottom: 10 }]}>
          Register or Login with Mobile
        </Text>
        <Text style={h2Style}>Enter Phone Number</Text>
        <Input value={_phone} onChangeText={(phone) => setPhone(phone)} />
      </View>
      <Button onPress={handleSubmit} title="Submit" />
      <Button onPress={() => navigation.navigate("Welcome")} title="Back" />
      {_error && <Text>{_errorText}</Text>}

      <View style={{ marginBottom: 10, marginTop: 30 }}>
        <Text style={h1Style}>Already A Member?</Text>
        <Button
          onPress={() => navigation.navigate("EmailPassword")}
          title="Login with Email/Password"
        />
      </View>
    </View>
  );
};

export default RequestCodeScreen;
