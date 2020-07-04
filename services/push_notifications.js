import { Notifications } from "expo";
import * as Permissions from "expo-permissions";
import { AsyncStorage } from "react-native";
import firebase from "../firebase";
export const registerForPushNotifications = async (userId) => {
  const firestore = firebase.firestore();
  let previousToken = await AsyncStorage.getItem("pushtoken");

  if (previousToken) {
    return;
  } else {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);

    if (status !== "granted") {
      return;
    } else {
      try {
        let token = await Notifications.getExpoPushTokenAsync();

        AsyncStorage.setItem("pushtoken", token);
      } catch (error) {
        console.log("error push_notifictaions", error);
      }
    }
  }
};
