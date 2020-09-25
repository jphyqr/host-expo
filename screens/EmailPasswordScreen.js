import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, AsyncStorage } from "react-native";
import { Input, Button } from "react-native-elements";
import firebase from "../firebase";
const EmailPasswordScreen = ({ navigation }) => {
  const [_updating, setUpdating] = useState(false);
  const [_success, setSuccess] = useState(false);
  const [_error, setError] = useState(false);
  const [_errorText, errorText] = useState(false);
  const [_email, setEmail] = useState("");
  const [_password, setPassword] = useState("");

  useEffect(() => {
    const getEmailfromAsyncStorage = async () => {
      let previousEmail = await AsyncStorage.getItem("email");

      if (previousEmail) {
        setEmail(previousEmail);
      }
    };

    getEmailfromAsyncStorage();
  }, []);

  const handleLogin = async () => {
    setUpdating(true);
    AsyncStorage.setItem("email", _email);
    try {
      await firebase.auth().signInWithEmailAndPassword(_email, _password);

      navigation.navigate("Main");
      setUpdating(false);
    } catch (error) {
      console.log('error logging in', error)
      setUpdating(false);
      setError(true);
      errorText(error);
    }
  };

  if (_updating) return <ActivityIndicator />;

  return (
    <View style={{ marginTop: 30 }}>
      <Text>Email</Text>
      <Input
        value={_email}
        placeholder="email@gmail.com"
        onChangeText={(email) => setEmail(email)}
      />
      <Text>Password</Text>
      <Input
        value={_password}
        placeholder="password"
        secureTextEntry
        onChangeText={(password) => setPassword(password)}
        errorMessage={_error}
        errorText={_errorText}
        
      />

      <Button
        onPress={handleLogin}
        loading={_updating}
        disabled={!(_password.length > 5 && _email.length > 4)}
        title="Login"
      />
    </View>
  );
};

export default EmailPasswordScreen;
