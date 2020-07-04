import "react-native-gesture-handler";
import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Vibration,
  Button,
} from "react-native";

import { Provider } from "react-redux";
import { createFirestoreInstance } from "redux-firestore";
//import store from "./store";
import firebase from "./firebase";
import { TabNavigator, StackNavigator } from "react-navigation";
import { ReactReduxFirebaseProvider } from "react-redux-firebase";
import WelcomeScreen from "./screens/WelcomeScreen";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import FeedScreen from "./screens/FeedScreen";
import AreaScreen from "./screens/AreaScreen";
import RequestCodeScreen from "./screens/RequestCodeScreen";
import EnterCodeScreen from "./screens/EnterCodeScreen";
import { useSelector } from "react-redux/lib/hooks/useSelector";
import ProfileScreen from "./screens/ProfileScreen";
import GameScreen from "./screens/GameScreen";
import GroupScreen from "./screens/GroupScreen";
import configureStore from "./store";
import { PersistGate } from "redux-persist/integration/react";
import { registerForPushNotifications } from "./services/push_notifications";
import { Notifications } from "expo";
import * as Permissions from "expo-permissions";
import Constants from "expo-constants";

import { Alert } from "react-native";
import EmailPasswordScreen from "./screens/EmailPasswordScreen";
import GroupAdminScreen from "./screens/GroupAdminScreen";
import GroupMemberScreen from "./screens/GroupMemberScreen";
import { useDispatch } from "react-redux/lib/hooks/useDispatch";
import CreateGameScreen from "./screens/CreateGame/CreateGameScreen";
import ManagePlayerInGameScreen from "./screens/CreateGame/ManagePlayerInGameScreen";
import InviteMembersScreen from "./screens/CreateGame/InviteMembersScreen";
import {
  SET_GAME,
  SET_GROUP,
  SET_AVATARS,
  DELETE_GROUP,
} from "./constants/reducerConstants";
import AddMemberScreen from "./screens/AddMemberScreen";
import CreateGroupScreen from "./screens/CreateGroupScreen";
import { deleteGroup } from "./actions/gameActions";
import InviteGroupMembersScreen from "./screens/InviteGroupMembersScreen";
import GroupScoutScreen from "./screens/GroupScoutScreen";
import GroupPreviewScreen from "./screens/GroupPreviewScreen";
const { store, persistor } = configureStore();

const App = () => {
  const rrfConfig = {
    userProfile: "users",
    useFirestoreForProfile: true, // Firestore for Profile instead of Realtime DB
  };

  const rrfProps = {
    firebase,
    config: rrfConfig,
    dispatch: store.dispatch,
    createFirestoreInstance, // <- needed if using firestore
  };

  return (
    <Provider store={store}>
      <ReactReduxFirebaseProvider {...rrfProps}>
        <PersistGate
          persistor={persistor}
          loading={<ActivityIndicator />}
          onBeforeLift={() => console.log("lifted")}
        >
          <WrappedApp />
        </PersistGate>
      </ReactReduxFirebaseProvider>
    </Provider>
  );
};

function WrappedApp({ navigation }) {
  const Stack = createStackNavigator();
  const Tab = createBottomTabNavigator();
  const TopTab = createMaterialTopTabNavigator();
  const firestore = firebase.firestore();
  const dispatch = useDispatch();

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        await registerForPushNotifications();
      } catch (error) {
        console.log("error with notifications", error);
      }

      Notifications.addListener(async (notification) => {
        const { data, origin } = notification;
        const { routeId, action } = data || {};

        switch (action) {
          case "GAME":
            {
              let gameDoc = await firestore
                .collection("games")
                .doc(routeId)
                .get();
              let game = { id: gameDoc.id, ...gameDoc.data() };
              dispatch({ type: SET_GAME, payload: game });
              navigation.navigate("GameScreen");
            }
            break;
          case "GROUP_USER": {
            let groupDoc = await firestore
              .collection("groups")
              .doc(routeId)
              .get();
            let group = { id: groupDoc.id, ...groupDoc.data() };

            navigation.navigate("GroupScreen");
          }
          case "GROUP":
            {
              let groupDoc = await firestore
                .collection("groups")
                .doc(routeId)
                .get();
              let group = { id: groupDoc.id, ...groupDoc.data() };

              dispatch({ type: SET_GROUP, payload: group });
              navigation.navigate("GroupAdminScreen");
            }
            break;
          default:
        }
      });
    };

    const loadAvatars = async () => {
      let avatars = [];
      let venue_avatars = [];
      try {
        let avatarsSnap = await firestore.collection("stock_avatars").get();

        avatarsSnap.forEach((doc) => {
          avatars.push({ ...doc.data() });
        });

        let venueAvatars = await firestore.collection("venue_avatars").get();

        venueAvatars.forEach((doc) => {
          venue_avatars.push({ ...doc.data() });
        });

        dispatch({
          type: SET_AVATARS,
          payload: { user: avatars, venue: venue_avatars },
        });
      } catch (error) {}
    };

    checkPermissions();
    loadAvatars();
  }, []);

  const registerForPushNotificationsAsync = async () => {
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.askAsync(
        Permissions.NOTIFICATIONS
      );
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Permissions.askAsync(
          Permissions.NOTIFICATIONS
        );
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      token = await Notifications.getExpoPushTokenAsync();
    } else {
      alert("Must use physical device for Push Notifications");
    }

    if (Platform.OS === "android") {
      Notifications.createChannelAndroidAsync("default", {
        name: "default",
        sound: true,
        priority: "max",
        vibrate: [0, 250, 250, 250],
      });
    }
  };

  const handleDeleteGroup = async (navigation) => {
    Alert.alert(
      "Delete Group",
      "This will delete all games, and stats for group.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete Group",
          onPress: async () => {
            try {
              await dispatch(deleteGroup({ firestore }));

              console.log("should navigate to main");

              navigation.navigate("FeedScreen");
              navigation.goBack();
            } catch (error) {
              console.log("error", error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const CreateGame = () => {
    return (
      <Stack.Navigator>
        <Stack.Screen name="CreateGameScreen" component={CreateGameScreen} />
        <Stack.Screen
          name="InviteMembersScreen"
          component={InviteMembersScreen}
        />
      </Stack.Navigator>
    );
  };

  const GroupAdmin = () => {
    return (
      <Drawer.Navigator
        drawerPosition="right"
        initialRouteName="GroupAdmin"
        drawerContent={(props) => <GroupAdminCustom {...props} />}
      >
        <Drawer.Screen name="GroupAdmin" component={GroupAdminScreen} />
      </Drawer.Navigator>
    );
  };

  const CreateGroupFlow = () => {
    return (
      <Stack.Navigator>
        <Stack.Screen name="CreateGroupScreen" component={CreateGroupScreen} />
        <Stack.Screen
          name="InviteGroupMembersScreen"
          component={InviteGroupMembersScreen}
        />
      </Stack.Navigator>
    );
  };

  const ManageGroupFlow = () => {
    return (
      // <Stack.Navigator>
      //   <Stack.Screen name="GroupAdminScreen" component={GroupAdmin} />
      //   <Stack.Screen
      //     name="InviteGroupMembersScreen"
      //     component={InviteGroupMembersScreen}
      //   />
      // </Stack.Navigator>

      <TopTab.Navigator>
        <TopTab.Screen name="GroupAdminScreen" component={GroupAdmin} />
        <TopTab.Screen
          name="InviteGroupMembersScreen"
          component={InviteGroupMembersScreen}
        />

        <TopTab.Screen name="AddMemberScreen" component={AddMemberScreen} />
      </TopTab.Navigator>
    );
  };

  const Feed = () => {
    return (
      <Stack.Navigator>
        <Stack.Screen name="FeedScreen" component={FeedScreen} />
        <Stack.Screen name="GameScreen" component={GameScreen} />
        <Stack.Screen name="GroupScoutScreen" component={GroupScoutScreen} />

        <Stack.Screen
          name="GroupPreviewScreen"
          component={GroupPreviewScreen}
        />

        <Stack.Screen name="CreateGroupFlow" component={CreateGroupFlow} />

        <Stack.Screen name="ManageGroupFlow" component={ManageGroupFlow} />

        <Stack.Screen name="GroupScreen" component={GroupScreen} />

        <Stack.Screen name="AddMemberScreen" component={AddMemberScreen} />

        <Stack.Screen name="CreateGameScreen" component={CreateGameScreen} />
        <Stack.Screen
          name="InviteMembersScreen"
          component={InviteMembersScreen}
        />
        <Stack.Screen
          name="ManagePlayerInGameScreen"
          component={ManagePlayerInGameScreen}
        />

        <Stack.Screen name="GroupMemberScreen" component={GroupMemberScreen} />
      </Stack.Navigator>
    );
  };

  const MainClosed = () => {
    return (
      <Tab.Navigator>
        <Tab.Screen name="Feed" component={Feed} />

        <Tab.Screen name="AreaScreen" component={AreaScreen} />

        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: "Profile" }}
        />
      </Tab.Navigator>
    );
  };

  const Drawer = createDrawerNavigator();

  function CustomDrawerContent(props) {
    return (
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
        <DrawerItem
          label="Help"
          onPress={() => Linking.openURL("https://privatehost.ca/help")}
        />
        <DrawerItem
          label="Sign Out"
          onPress={() => {
            firebase.auth().signOut();
          }}
        />
      </DrawerContentScrollView>
    );
  }

  function GroupAdminCustom({ navigation, ...props }) {
    return (
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />

        <DrawerItem
          label="Delete Group"
          onPress={() => handleDeleteGroup(navigation)}
        />
      </DrawerContentScrollView>
    );
  }

  const Main = () => {
    return (
      <Drawer.Navigator
        initialRouteName="Main"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen name="Main" component={MainClosed} />
      </Drawer.Navigator>
    );
  };

  const Auth = () => {
    return (
      <Stack.Navigator>
        <Stack.Screen name="RequestAccess" component={RequestCodeScreen} />
        <Stack.Screen name="EmailPassword" component={EmailPasswordScreen} />

        <Stack.Screen name="EnterCode" component={EnterCodeScreen} />
      </Stack.Navigator>
    );
  };

  // const auth = useSelector((state) => state.firebase.auth);

  // useEffect(() => {
  //   if (auth?.isLoaded) {
  //     if (!auth?.isEmpty) {
  //       navigation.navigate("Main");
  //     }s
  //   }
  // }, [auth]);

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{
            tabBarVisible: false,
          }}
        />
        <Tab.Screen
          name="Auth"
          component={Auth}
          options={{ title: "Request Access", tabBarVisible: false }}
        />
        <Tab.Screen
          name="Main"
          component={Main}
          options={{ title: "Private Host", tabBarVisible: false }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default App;
