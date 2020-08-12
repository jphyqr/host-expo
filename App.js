import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Vibration,
  Button,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Provider } from "react-redux";
import { createFirestoreInstance } from "redux-firestore";
//import store from "./store";
import firebase from "./firebase";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import MaterialIcons from "react-native-vector-icons/MaterialIcons";

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
  SET_OVERLAY,
} from "./constants/reducerConstants";
import AddMemberScreen from "./screens/AddMemberScreen";
import CreateGroupScreen from "./screens/CreateGroupScreen";
import { deleteGroup } from "./actions/gameActions";
import InviteGroupMembersScreen from "./screens/InviteGroupMembersScreen";
import GroupScoutScreen from "./screens/GroupScoutScreen";
import GroupPreviewScreen from "./screens/GroupPreviewScreen";
import SecurityScreen from "./screens/SecurityScreen";
import { Icon, Avatar } from "react-native-elements";
import GroupsGamesScreen from "./screens/GroupsGamesScreen";
import GameDetailScreen from "./screens/CreateGame/GameDetailScreen";
import ManageGameScreen from "./screens/CreateGame/ManageGameScreen";
import PlayGameScreen from "./screens/CreateGame/PlayGameScreen";
import GameRunning from "./screens/GameRunning";
import RegistrationDetails from "./screens/RegistrationDetails";
const { store, persistor } = configureStore();
import { YellowBox } from "react-native";
import _ from "lodash";
import MemoAvatar from "./components/MemoAvatar";
import EmailPassword from "./components/EmailPassword";
import ChangeDisplayPhoto from "./components/ChangeDisplayPhoto";
import { OVERLAYS } from "./constants/helperConstants";
import ProfileAvatar from "./components/ProfileAvatar";
import EditProfileAvatar from "./components/EditProfileAvatar";
import { spacedRow } from "./styles/styles";
import Handle from "./components/Handle";
const App = () => {
  YellowBox.ignoreWarnings(["Setting a timer"]);
  const _console = _.clone(console);
  console.warn = (message) => {
    if (message.indexOf("Setting a timer") <= -1) {
      _console.warn(message);
    }
  };

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
    let isCancelled = false;
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
        if (!isCancelled)
          dispatch({
            type: SET_AVATARS,
            payload: { user: avatars, venue: venue_avatars },
          });
      } catch (error) {}
    };

    checkPermissions();
    loadAvatars();

    return () => {
      isCancelled = true;
    };
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

  const LiveGameFlow = ({ route }) => {
    return (
      <TopTab.Navigator
        tabBarOptions={{
          activeTintColor: "#e91e63",
          labelStyle: { fontSize: 12 },
          style: { backgroundColor: "powderblue" },
          showIcon: true,
        }}
        initialRouteName={
          route.params.gameState.includes("RUNNING")
            ? "Game Running"
            : "Game Registering"
        }
      >
        {route.params.gameState.includes("RUNNING") ? (
          <TopTab.Screen
            options={{
              tabBarLabel: "Game Running",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="cards" color={color} size={25} />
              ),
            }}
            name="Game Running"
            component={GameRunning}
          />
        ) : (
          <TopTab.Screen
            name="Game Registering"
            options={{
              tabBarLabel: `Register for ${route.params.gameName}`,
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="playlist-edit"
                  color={color}
                  size={25}
                />
              ),
            }}
            component={GameScreen}
          />
        )}

        {route.params.gameState.includes("REGISTRATION") && (
          <TopTab.Screen
            name="Game Info"
            options={{
              tabBarLabel: `Game Details`,
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="information"
                  color={color}
                  size={25}
                />
              ),
            }}
            component={RegistrationDetails}
          />
        )}

        {route.params.hostUid === firebase.auth().currentUser.uid && (
          <TopTab.Screen name="Live Host Screen" component={GameScreen} />
        )}
      </TopTab.Navigator>
    );
  };

  const CreateGameFlow = ({ route }) => {
    return (
      <TopTab.Navigator
        lazy
        initialRouteName={
          route.params.gameState.includes("RUNNING")
            ? "GameRunning"
            : "CreateGameScreen"
        }
        tabBarOptions={{
          activeTintColor: "#e91e63",
          labelStyle: { fontSize: 12 },
          style: { backgroundColor: "powderblue" },
          showIcon: true,
        }}
      >
        {route.params.gameState.includes("RUNNING") && (
          <TopTab.Screen
            name="GameRunning"
            component={ManagePlayerInGameScreen}
            options={{
              tabBarLabel: "Manage",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="poker-chip"
                  color={color}
                  size={25}
                />
              ),
            }}
          />
        )}
        {route.params.isPlaying && route.params.gameState.includes("RUNNING") && (
          <TopTab.Screen
            name="Play"
            component={GameRunning}
            options={{
              tabBarLabel: "Play",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="cards" color={color} size={25} />
              ),
            }}
          />
        )}
        <TopTab.Screen
          name="CreateGameScreen"
          component={CreateGameScreen}
          options={{
            tabBarLabel: "Edit",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="calendar-edit"
                color={color}
                size={25}
              />
            ),
          }}
        />
        <TopTab.Screen
          name="GameDetailScreen"
          options={{
            tabBarLabel: "More",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="more-horiz" color={color} size={25} />
            ),
          }}
          component={GameDetailScreen}
        />
        <TopTab.Screen
          name="InviteMembersScreen"
          options={{
            tabBarLabel: "Invite",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="person-add" color={color} size={25} />
            ),
          }}
          component={InviteMembersScreen}
        />
      </TopTab.Navigator>
    );
  };

  const ManageGroupFlow = () => {
    return (
      <TopTab.Navigator
        initialRouteName="GroupsGamesScreen"
        tabBarOptions={{
          activeTintColor: "#e91e63",
          labelStyle: { fontSize: 12 },
          style: { backgroundColor: "powderblue" },
          showIcon: true,
        }}
      >
        <TopTab.Screen
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="cards" color={color} size={25} />
            ),

            tabBarLabel: "Games",
          }}
          name="GroupsGamesScreen"
          component={GroupsGamesScreen}
        />

        <TopTab.Screen
          options={{
            tabBarLabel: "Group",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="account-group"
                color={color}
                size={25}
              />
            ),
          }}
          name="GroupAdminScreen"
          component={GroupAdmin}
        />
        <TopTab.Screen
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="account-search"
                color={color}
                size={25}
              />
            ),
            tabBarLabel: "Invite",
          }}
          name="InviteGroupMembersScreen"
          component={InviteGroupMembersScreen}
        />

        <TopTab.Screen
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="group-add" color={color} size={25} />
            ),
            tabBarLabel: "Add",
          }}
          name="AddMemberScreen"
          component={AddMemberScreen}
        />
      </TopTab.Navigator>
    );
  };

  const ProfileTabs = () => {
    return (
      <TopTab.Navigator
        initialRouteName="ProfileScreen"
        tabBarOptions={{
          activeTintColor: "#e91e63",
          labelStyle: { fontSize: 12 },
          style: { marginTop: 20 },
        }}
      >
        <TopTab.Screen
          options={{ tabBarLabel: "Profile" }}
          name="ProfileScreen"
          component={ProfileScreen}
        />
        <TopTab.Screen
          options={{ tabBarLabel: "Account" }}
          name="SecurityScreen"
          component={SecurityScreen}
        />
      </TopTab.Navigator>
    );
  };

  const Area = ({ navigation }) => {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="AreaScreen"
          options={{
            title: "Regina",

            headerLeft: () => <ProfileAvatar navigation={navigation} />,
          }}
          component={AreaScreen}
        />
      </Stack.Navigator>
    );
  };

  const Feed = ({ route, navigation }) => {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="FeedScreen"
          options={{
            headerRight: () => <Handle />,
            title: "Private Host",
            headerLeft: () => <ProfileAvatar navigation={navigation} />,
          }}
          component={FeedScreen}
        />
        <Stack.Screen name="GameScreen" component={LiveGameFlow} />
        <Stack.Screen name="GroupScoutScreen" component={GroupScoutScreen} />

        <Stack.Screen
          name="GroupPreviewScreen"
          component={GroupPreviewScreen}
        />

        <Stack.Screen name="CreateGroupFlow" component={CreateGroupFlow} />

        <Stack.Screen
          options={{
            title: `${route?.params?.groupName || "No Name"}`,
            headerBackImage: () => (
              <Ionicons
                style={{ marginLeft: 5 }}
                name={"ios-home"}
                size={30}
                color={"blue"}
              />
            ),
            headerBackTitleVisible: false,
            headerRight: () => (
              <MemoAvatar
                key={"groupAvatar"}
                rounded
                source={{ uri: route.params.groupPhotoURL }}
                updateOn={route.params.groupPhotoURL}
                size="small"
                onPress={() => {
                  navigation.openDrawer();
                }}
              />
            ),
          }}
          name="ManageGroupFlow"
          component={ManageGroupFlow}
        />

        <Stack.Screen name="GroupScreen" component={GroupScreen} />

        <Stack.Screen name="AddMemberScreen" component={AddMemberScreen} />

        <Stack.Screen name="CreateGameFlow" component={CreateGameFlow} />
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
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Feed") {
              iconName = focused ? "ios-home" : "ios-home";
            } else if (route.name === "AreaScreen") {
              iconName = focused ? "ios-people" : "ios-people";
            } else if (route.name === "ProfileScreen") {
              iconName = focused ? "ios-settings" : "ios-settings";
            }

            // You can return any component that you like here!
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
        tabBarOptions={{
          activeTintColor: "tomato",
          inactiveTintColor: "gray",
        }}
      >
        <Tab.Screen name="Feed" component={Feed} />

        <Tab.Screen name="AreaScreen" component={Area} />
        {/* 
        <Tab.Screen name="ProfileScreen" component={Profile} /> */}
      </Tab.Navigator>
    );
  };

  const Drawer = createDrawerNavigator();

  function CustomDrawerContent({ route, navigation, ...props }) {
    return (
      <DrawerContentScrollView {...props}>
        <DrawerItem
          label={() => (
            <View
              style={[
                spacedRow,
                {
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "lightblue",
                  padding: 10,
                  fontSize: 17,
                  fontWeight: "bold",
                  borderRadius: 10,
                  width: 150,
                },
              ]}
            >
              <Handle />
              <Icon name="edit" />
            </View>
          )}
          labelStyle={{}}
          icon={() => <EditProfileAvatar />}
          onPress={() =>
            dispatch({
              type: SET_OVERLAY,
              payload: OVERLAYS.EDIT_PROFILE,
            })
          }
        />

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
        openByDefault={false}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen
          name={firebase.auth().currentUser.displayName}
          component={MainClosed}
        />
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
          options={{ title: () => <Handle />, tabBarVisible: false }}
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
