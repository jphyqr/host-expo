import React, { useState } from "react";
import firebase from "../firebase";
import { View, Button, Text, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux/lib/hooks/useSelector";
import { Input } from "react-native-elements";
import axios from "axios";
const ROOT_URL = "https://us-central1-poker-cf130.cloudfunctions.net";

const EnterCodeScreen = ({ navigation }) => {
  const [_phone, setPhone] = useState(
    useSelector((state) => state.phone || "")
  );

  const [_loading, loading] = useState(false);
  const [_code, setCode] = useState("");
  const [_error, error] = useState(false);
  const [_errorText, errorText] = useState("");
  const handleSubmit = async () => {
    try {
      loading(true);
      let { data } = await axios.post(`${ROOT_URL}/verifyOneTimePassword`, {
        phone: _phone,
        code: _code,
      });

      firebase.auth().signInWithCustomToken(data.token);
      loading(false);
      navigation.navigate("Main");
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
      <View style={{ marginBottom: 10 }}>
        <Text>Enter Phone Number</Text>
        <Input value={_phone} onChangeText={(phone) => setPhone(phone)} />
      </View>

      <View style={{ marginBottom: 10 }}>
        <Text>Enter Code</Text>
        <Input value={_code} onChangeText={(code) => setCode(code)} />
      </View>

      <Button onPress={handleSubmit} title="Submit" />
      {_error && <Text>{_errorText}</Text>}
    </View>
  );
};

export default EnterCodeScreen;
