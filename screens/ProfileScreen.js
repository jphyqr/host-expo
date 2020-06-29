import React from "react";
import { View, Text, Button } from "react-native";
import firebase from "../firebase";
import { useSelector } from "react-redux/lib/hooks/useSelector";
import { Avatar } from "react-native-elements";

const ProfileScreen = ({ navigation }) => {
  const profile = useSelector((state) => state.firebase.profile || {});
  return (
    <View>
      <Text>{profile?.displayName}</Text>
      <Avatar
        rounded
        source={{ uri: profile?.photoURL }}
        size="large"
        overlayContainerStyle={{ backgroundColor: "blue" }}
      />
      <Button
        title="Signout"
        onPress={() => {
          firebase.auth().signOut();
          navigation.navigate("Welcome");
        }}
      ></Button>
    </View>
  );
};

export default ProfileScreen;
