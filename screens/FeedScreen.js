import React, { useEffect, useState, useMemo, useDebugValue } from "react";
import {
  View,
  Text,
  Button,
  Image,
  SectionList,
  AsyncStorage,
  ActivityIndicator,
} from "react-native";
import firebase from "../firebase";
import { useSelector } from "react-redux/lib/hooks/useSelector";
import { PRIVACY, GAME_STATES } from "../constants/helperConstants";
import { useFirestoreConnect } from "react-redux-firebase";
import { Avatar, Card, ListItem, Icon, Badge } from "react-native-elements";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { useDispatch } from "react-redux/lib/hooks/useDispatch";
import { SET_GAME, SET_GROUP, SET_GAME_S } from "../constants/reducerConstants";
import { registerForPushNotifications } from "../services/push_notifications";
import { Notifications } from "expo";
import axios from "axios";
import { h2Style, h6Style, h7Style } from "../styles/styles";
const FeedScreen = ({ navigation }) => {
  const auth = useSelector((state) => state.firebase.auth);
  const ROOT_URL = "https://us-central1-poker-cf130.cloudfunctions.net";
  const [_loading, loading] = useState(false);
  const profile = useSelector((state) => state.firebase.profile);
  const game_s = useSelector((state) => state.game_s || []);
  const [_feed, setFeed] = useState([]);
  const [_games, setGames] = useState([]);
  const [_groups, setGroups] = useState([]);
  const [_host_groups, setHostGroups] = useState([]);
  const [_member_groups, setMemberGroups] = useState([]);
  const [_area_groups, setAreaGroups] = useState([]);
  const [_my_invites, setMyInvites] = useState([]);
  const [_newFeed, setNewFeed] = useState(false);
  const firestore = firebase.firestore();
  const dispatch = useDispatch();
  const [count, setCount] = useState(-1);
  const gamesQuery = useMemo(
    () => ({
      collection: "games",

      storeAs: "gamesSnap",
    }),
    []
  );
  useFirestoreConnect(gamesQuery);
  const games = useSelector((state) => state.firestore.ordered.gamesSnap || []);

  useEffect(() => {
    setNewFeed(profile.newFeed);
  }, [profile]);

  useEffect(() => {
    const getFeedItems = async () => {
      loading(true);
      if (auth.isLoaded && !auth.isEmpty) {
        //  await checkPermissions();

        let { data } = await axios.post(`${ROOT_URL}/getMobileHomeData`, {
          uid: auth.uid,
        });

        const {
          hostGroups,
          justMember,
          other_groups_in_area,
          feed,
          games_registering,
        } = data || [];

        setGroups(other_groups_in_area);
        setHostGroups(hostGroups);
        setMemberGroups(justMember);
        setAreaGroups(other_groups_in_area);
        setFeed(feed);
        setGames(games_registering);
        dispatch({ type: SET_GAME_S, payload: games_registering });
        loading(false);
      }
    };

    const saveTokenToStorage = async () => {
      const token = await AsyncStorage.getItem("pushtoken", token);

      try {
        await firestore.collection("user_push_tokens").doc(auth.uid).set({
          push_token: token,
          tokenCreated: Date.now(),
        });
      } catch (error) {
        console.log({ error });
      }
    };

    auth.isLoaded && !auth.isEmpty && getFeedItems();

    auth.isLoaded && !auth.isEmpty && saveTokenToStorage();

    if (auth.isLoaded && auth.isEmpty) {
      navigation.navigate("Welcome");
    }
  }, [auth]);

  useEffect(() => {
    setGames(game_s);
    setCount(count + 1);
  }, [game_s]);

  if (auth.isEmpty || _loading) return <ActivityIndicator />;

  return (
    <ScrollView>
      <ScrollView style={{ marginBottom: 20 }} horizontal>
        <View style={{ marginRight: 5 }}>
          <Avatar
            key={"profile"}
            rounded
            source={{ uri: profile.photoURL }}
            size="medium"
            showAccessory
            accessory={{
              name: "add",
              type: "material",
              color: "red",
            }}
            overlayContainerStyle={{ backgroundColor: "blue" }}
            onPress={() => {
              navigation.openDrawer();
            }}
          />

          <Text style={{ fontSize: 10 }}>{profile.displayName}</Text>
        </View>

        {_host_groups.map((item, i) => {
          return (
            <View key={i} style={{ marginRight: 5 }}>
              <Avatar
                rounded
                showAccessory
                accessory={{
                  name: "mode-edit",
                  type: "material",
                  color: item.notificationBadge ? "red" : "grey",
                }}
                source={{ uri: item.groupPhotoURL }}
                size="large"
                overlayContainerStyle={{ backgroundColor: "blue" }}
                onPress={() => {
                  dispatch({ type: SET_GROUP, payload: item.groupId });
                  navigation.navigate("GroupAdminScreen");
                }}
              />
              <Text style={{ fontSize: 10 }}>{item.groupName}</Text>
            </View>
          );
        })}

        {_member_groups.map((item, i) => {
          return (
            <View key={i} style={{ marginRight: 5 }}>
              <Avatar
                rounded
                source={{ uri: item.groupPhotoURL }}
                size="large"
                overlayContainerStyle={{ backgroundColor: "blue" }}
                onPress={() => {
                  dispatch({ type: SET_GROUP, payload: item.groupId });
                  navigation.navigate("GroupScreen");
                }}
              />
              <Text style={{ fontSize: 10 }}>{item.groupName}</Text>
            </View>
          );
        })}

        {_area_groups.map((item, i) => {
          return (
            <View key={i} style={{ marginRight: 5 }}>
              <Avatar
                rounded
                source={{ uri: item.groupPhotoURL }}
                size="large"
                showAccessory
                accessory={{
                  name: "add",
                  type: "material",
                  color: "red",
                }}
                overlayContainerStyle={{ backgroundColor: "blue" }}
                onPress={() => {
                  dispatch({ type: SET_GROUP, payload: item.groupId });
                  navigation.navigate("GroupScreen");
                }}
              />
              <Text style={{ fontSize: 10 }}>{item.groupName}</Text>
              <Badge
                status="success"
                containerStyle={{ position: "absolute", bottom: 2, right: 2 }}
              />
            </View>
          );
        })}
      </ScrollView>

      <Text style={h2Style}>Live Games</Text>
      <ScrollView horizontal>
        {_games.map((item, i) => {
          return (
            <TouchableOpacity
              key={i}
              onPress={
                item.hostUid === auth.uid
                  ? () =>
                      navigation.navigate("InviteMembersScreen", {
                        id: item.id,
                      })
                  : () => {
                      dispatch({ type: SET_GAME, payload: item });
                      navigation.navigate("GameScreen");
                    }
              }
            >
              <Card title={item.groupName}>
                {item.hostUid === auth.uid && <Text style={h7Style}>Host</Text>}

                {item.confirmedList?.map((u, i) => {
                  return (
                    <Text key={i} style={h6Style}>
                      {u.displayName}
                    </Text>
                  );
                })}
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={h2Style}>Registering Games</Text>
      <ScrollView horizontal>
        {_games.map((item, i) => {
          return (
            <TouchableOpacity
              key={i}
              onPress={() => {
                dispatch({ type: SET_GAME, payload: item });
                navigation.navigate("GameScreen");
              }}
            >
              <Card title={item.groupName}>
                {item.confirmedList?.map((u, i) => {
                  return (
                    <Text key={i} style={h6Style}>
                      {u.displayName}
                    </Text>
                  );
                })}
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {_newFeed && (
        <Button
          title="New Feed"
          onPress={async () => {
            try {
              await firestore
                .collection("users")
                .doc(auth.uid)
                .update({ newFeed: false });
            } catch (error) {
              console.log({ error });
            }
          }}
        />
      )}

      <Text>Feed</Text>
      <ScrollView>
        {_feed.map((item, i) => {
          return (
            <TouchableOpacity key={i}>
              <ListItem
                subtitle={item.notification_type}
                title={item.createdBy}
                leftAvatar={{ source: { uri: item.createdByPhotoURL } }}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </ScrollView>
  );
};

export default FeedScreen;
