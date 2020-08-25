import React from "react";
import { View, Text, ImageBackground, ActivityIndicator } from "react-native";
import { Button, Image } from "react-native-elements";
import { vs30 } from "../styles/styles";
import { TouchableOpacity } from "react-native-gesture-handler";

const SnapScreen = ({ navigation, route }) => {
  console.log({ route });
  return (
    <View style={{ flex: 1, flexDirection: "column" }}>
      <Image
        containerStyle={{
          height: "100%",
          width: "100%",
        }}
        source={{ uri: route.params.initialPhotoURL }}
        style={{ height: "100%", width: "100%" }}
        PlaceholderContent={<ActivityIndicator />}
      >
        <View style={vs30} />
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 30, color: "white" }}>X</Text>
        </TouchableOpacity>
      </Image>
    </View>
  );
};

export default SnapScreen;
