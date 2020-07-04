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
import {
  SET_GAME,
  SET_GROUP,
  SET_GAME_S,
  SET_MEMBER_OF_GROUP,
  SET_GROUP_S,
  SET_HOST_GROUPS,
  SET_MEMBER_GROUPS,
  SET_INVITE_GROUPS,
  SET_AREA_GROUPS,
} from "../constants/reducerConstants";
import { registerForPushNotifications } from "../services/push_notifications";
import { Notifications } from "expo";
import axios from "axios";
import {
  h2Style,
  h6Style,
  h7Style,
  spacedRow,
  column,
  h5Style,
} from "../styles/styles";
const FeedScreen = ({ navigation }) => {
  const auth = useSelector((state) => state.firebase.auth);
  const ROOT_URL = "https://us-central1-poker-cf130.cloudfunctions.net";
  const [_loading, loading] = useState(false);
  const profile = useSelector((state) => state.firebase.profile);
  const game_s = useSelector((state) => state.game_s || []);
  const [_feed, setFeed] = useState([]);
  const [_games, setGames] = useState([]);
  const [_groups, setGroups] = useState([]);
  const [_groups_invited, setInvitedGroups] = useState([]);
  const [_member_groups, setMemberGroups] = useState([]);
  const [_host_groups, setHostGroups] = useState([]);
  const xHostGroups = useSelector((state) => state.hostGroups || []);

  const xAreaGroups = useSelector((state) => state.areaGroups || []);

  const xInviteGroups = useSelector((state) => state.inviteGroups || []);

  const xMemberGroups = useSelector((state) => state.memberGroups || []);

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
    setHostGroups(xHostGroups);
    setCount(count + 1);
  }, [xHostGroups]);

  useEffect(() => {
    setAreaGroups(xAreaGroups);
    setCount(count + 1);
  }, [xAreaGroups]);
  useEffect(() => {
    console.log("INVITE GROUPS CHANGED");
    setInvitedGroups(xInviteGroups);
    setCount(count + 1);
  }, [xInviteGroups]);
  useEffect(() => {
    console.log("MEMBER GROUPS CHANGED");
    setMemberGroups(xMemberGroups);
    setCount(count + 1);
  }, [xMemberGroups]);

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
          groupsInvited,
        } = data || [];

        setGroups(other_groups_in_area);

        dispatch({ type: SET_HOST_GROUPS, payload: hostGroups });
        dispatch({ type: SET_MEMBER_GROUPS, payload: justMember });

        dispatch({ type: SET_INVITE_GROUPS, payload: groupsInvited });

        dispatch({ type: SET_AREA_GROUPS, payload: other_groups_in_area });

        setFeed(feed);
        setGames(games_registering);

        setCount(count + 1);
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
      <View style={{ display: "flex", flexDirection: "row" }}>
        <View style={{ marginRight: 20 }}>
          <Avatar
            key={"profile"}
            rounded
            source={{ uri: profile.photoURL }}
            size="small"
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
        </View>
        <View style={{ flexDirection: "column" }}>
          <Text style={h5Style}>My Groups</Text>
          <ScrollView
            style={{ marginBottom: 20 }}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <View style={{ marginRight: 5 }}>
              <Avatar
                key={"creategroup"}
                rounded
                icon={{ name: "add" }}
                size="medium"
                overlayContainerStyle={{ backgroundColor: "blue" }}
                onPress={() => {
                  navigation.navigate("CreateGroupFlow");
                }}
              />

              <Text style={{ fontSize: 10 }}>Create Group</Text>
            </View>

            {_groups_invited?.map((item, i) => {
              return (
                <View key={i} style={{ marginRight: 5 }}>
                  <Avatar
                    rounded
                    showAccessory
                    accessory={{
                      name: "mail",
                      type: "material",
                      color: "red",
                    }}
                    source={{ uri: item.groupPhotoURL }}
                    size="medium"
                    overlayContainerStyle={{ backgroundColor: "blue" }}
                    onPress={async () => {
                      try {
                        loading(true);
                        let groupDoc = await firestore
                          .collection("groups")
                          .doc(item.groupId)
                          .get();

                        dispatch({
                          type: SET_GROUP,
                          payload: { id: item.groupId, ...groupDoc.data() },
                        });
                        loading(false);
                      } catch (error) {
                        console.log("error moving groups", error);
                        loading(false);
                      }

                      console.log("group set, should navigate ");
                      navigation.navigate("GroupScoutScreen");
                    }}
                  />
                  <Text style={{ fontSize: 10 }}>invited</Text>
                </View>
              );
            })}

            {_host_groups?.map((item, i) => {
              return (
                <View key={i} style={{ marginRight: 5 }}>
                  <Avatar
                    rounded
                    showAccessory
                    accessory={{
                      name: "security",
                      type: "material",
                      color: item.notificationBadge ? "red" : "black",
                    }}
                    source={{ uri: item.groupPhotoURL }}
                    size="medium"
                    overlayContainerStyle={{ backgroundColor: "blue" }}
                    onPress={async () => {
                      try {
                        console.log("pressed", item);
                        loading(true);
                        let groupDoc = await firestore
                          .collection("groups")
                          .doc(item.groupId)
                          .get();
                        dispatch({
                          type: SET_GROUP,
                          payload: { id: item.groupId, ...groupDoc.data() },
                        });
                        loading(false);
                      } catch (error) {
                        console.log("error moving groups", error);
                        loading(false);
                      }

                      console.log("group set, should navigate ");
                      navigation.navigate("ManageGroupFlow");
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
                    size="medium"
                    overlayContainerStyle={{ backgroundColor: "blue" }}
                    showAccessory
                    accessory={{
                      name: "verified-user",
                      type: "material",
                      color: item.notificationBadge ? "red" : "grey",
                    }}
                    onPress={async () => {
                      try {
                        loading(true);
                        let groupDoc = await firestore
                          .collection("groups")
                          .doc(item.groupId)
                          .get();

                        dispatch({
                          type: SET_GROUP,
                          payload: { id: groupDoc.id, ...groupDoc.data() },
                        });

                        dispatch({ type: SET_MEMBER_OF_GROUP, payload: item });
                        loading(false);
                        navigation.navigate("GroupScreen");
                      } catch (error) {
                        console.log("error moving", error);
                        loading(false);
                      }
                    }}
                  />
                  <Text style={{ fontSize: 10 }}>{item.groupName}</Text>
                </View>
              );
            })}
          </ScrollView>
          <Text style={h7Style}>Other groups In Area</Text>
          <ScrollView
            style={{ marginBottom: 20 }}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {_area_groups.map((item, i) => {
              return (
                <View key={i} style={{ marginRight: 5 }}>
                  <Avatar
                    rounded
                    source={{ uri: item.groupPhotoURL }}
                    size="medium"
                    overlayContainerStyle={{ backgroundColor: "blue" }}
                    onPress={async () => {
                      try {
                        loading(true);
                        let groupDoc = await firestore
                          .collection("groups")
                          .doc(item.groupId)
                          .get();

                        dispatch({
                          type: SET_GROUP,
                          payload: { id: groupDoc.id, ...groupDoc.data() },
                        });

                        dispatch({ type: SET_MEMBER_OF_GROUP, payload: item });
                        loading(false);
                        navigation.navigate("GroupPreviewScreen");
                      } catch (error) {
                        console.log("error moving", error);
                        loading(false);
                      }
                    }}
                  />
                  <Text
                    style={{ fontSize: 10, width: "100%", textAlign: "center" }}
                  >
                    {item.groupName}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <Text style={h2Style}>Live Games</Text>
      <ScrollView horizontal>
        {_games
          .filter(
            (g) =>
              g.gameState === GAME_STATES.GAME_RUNNING_FULL ||
              g.gameState === GAME_STATES.GAME_RUNNING_OPEN
          )
          .map((item, i) => {
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
                  {item.hostUid === auth.uid && (
                    <Text style={h7Style}>Host</Text>
                  )}

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
