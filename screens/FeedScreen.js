import React, { useEffect, useState, useMemo, useDebugValue } from "react";
import {
  View,
  Text,
  Button,
  Image,
  SectionList,
  AsyncStorage,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import firebase from "../firebase";
import { useSelector } from "react-redux/lib/hooks/useSelector";
import { PRIVACY, GAME_STATES } from "../constants/helperConstants";
import { useFirestoreConnect } from "react-redux-firebase";
import { Avatar, Card, ListItem, Badge, Overlay } from "react-native-elements";
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
  SET_MEMBERS_IN_AREA,
  SET_USER_PHOTOS,
} from "../constants/reducerConstants";
import { registerForPushNotifications } from "../services/push_notifications";
import { Notifications } from "expo";
import axios from "axios";
import _ from "lodash";
import {
  h2Style,
  h6Style,
  h7Style,
  spacedRow,
  column,
  h5Style,
  hs30,
  vs30,
} from "../styles/styles";
import {
  formatDuration,
  intervalToDuration,
  parse,
  format,
  formatDistance,
} from "date-fns";
import { useFocusEffect } from "@react-navigation/native";
import DisplayName from "../components/DisplayName";
import EmailPassword from "../components/EmailPassword";
const FeedScreen = ({ navigation }) => {
  const auth = useSelector((state) => state.firebase.auth);
  const ROOT_URL = "https://us-central1-poker-cf130.cloudfunctions.net";
  const [_loading, loading] = useState(false);
  const profile = useSelector((state) => state.firebase.profile || {});
  const game_s = useSelector((state) => state.game_s || []);
  const [_feed, setFeed] = useState([]);
  const [_gamesLive, setGamesLive] = useState([]);

  const [_groups, setGroups] = useState([]);
  const [_groups_invited, setInvitedGroups] = useState([]);
  const [_profile, setProfile] = useState({});
  const [_member_groups, setMemberGroups] = useState([]);
  const [_host_groups, setHostGroups] = useState([]);
  const xHostGroups = useSelector((state) => state.hostGroups || []);
  const [_noDisplayName, setNoDisplayName] = useState(false);
  const [_noPassword, setNoPassword] = useState(false);
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
  useFocusEffect(
    React.useCallback(() => {
      console.log("USE FOCUS EFFECT");

      return () => refreshFeed();
    }, [])
  );

  useEffect(() => {
    if (profile.isLoaded && !profile.isEmpty) {
      if (!profile.userHasSetDisplayName) setNoDisplayName(true);
      if (!profile.userHasSetEP) {
        setNoPassword(true);
      }
      setProfile(profile);
      setNewFeed(profile.newFeed);
    }
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

  const refreshFeed = async () => {
    //  await checkPermissions();
    loading(true);
    let { data } = await axios.post(`${ROOT_URL}/getMobileHomeData`, {
      uid: auth.uid,
    });

    const {
      hostGroups,
      justMember,
      other_groups_in_area,
      feed,
      games,
      groupsInvited,
      following,
      other_users_in_area,
      user_photos,
    } = data || [];

    setGroups(other_groups_in_area);

    dispatch({ type: SET_USER_PHOTOS, payload: user_photos });

    dispatch({
      type: SET_MEMBERS_IN_AREA,
      payload: { members: other_users_in_area, following: following },
    });
    dispatch({ type: SET_HOST_GROUPS, payload: hostGroups });
    dispatch({ type: SET_MEMBER_GROUPS, payload: justMember });

    dispatch({ type: SET_INVITE_GROUPS, payload: groupsInvited });

    dispatch({ type: SET_AREA_GROUPS, payload: other_groups_in_area });

    setFeed(feed);

    setGamesLive(games);

    setCount(count + 1);
    dispatch({ type: SET_GAME_S, payload: games });
    loading(false);
  };

  useEffect(() => {
    const getFeedItems = async () => {
      loading(true);
      if (auth.isLoaded && !auth.isEmpty) {
        await refreshFeed();
      }
      loading(false);
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
    console.log("game_s changed");
    setGamesLive(game_s);
    setCount(count + 1);
  }, [game_s]);

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);

    await refreshFeed();

    setRefreshing(false);
  }, []);

  if (!auth.isLoaded || !profile.isLoaded || _loading)
    return <ActivityIndicator />;

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {_noDisplayName && <DisplayName onOkay={() => setNoDisplayName(false)} />}

      {_noPassword && <EmailPassword onOkay={() => setNoPassword(false)} />}

      <View style={{ display: "flex", flexDirection: "row" }}>
        <View style={{ marginRight: 20 }}>
          <Avatar
            key={"profile"}
            avatarStyle={{
              borderWidth: 1,
              borderRadius: 50,
              borderColor: "orange",
            }}
            rounded
            source={{
              uri:
                _profile?.photoURL ||
                "https://firebasestorage.googleapis.com/v0/b/poker-cf130.appspot.com/o/avatars%2Ffish.png?alt=media&token=6381537c-65b8-4ecd-a952-a3a8579ff883",
            }}
            size="small"
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
                    source={{ uri: item?.groupPhotoURL }}
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
                    source={{ uri: item?.groupPhotoURL }}
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
                </View>
              );
            })}

            {_member_groups.map((item, i) => {
              return (
                <View key={i} style={{ marginRight: 5 }}>
                  <Avatar
                    rounded
                    source={{ uri: item?.groupPhotoURL }}
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
                </View>
              );
            })}

            <View style={hs30}></View>
            <View style={hs30}></View>
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
                    source={{ uri: item?.groupPhotoURL }}
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
                </View>
              );
            })}
            <View style={hs30}></View>
            <View style={hs30}></View>
          </ScrollView>
        </View>
      </View>

      <Text style={h5Style}>Games in Area</Text>
      <ScrollView style={{ padding: 10 }} horizontal>
        {_gamesLive
          .sort(
            (a, b) =>
              parse(a.gameSettings.venueOpenTime, "PPPPp", new Date()) -
              parse(b.gameSettings.venueOpenTime, "PPPPp", new Date())
          )
          .map((item, i) => {
            return (
              <TouchableOpacity
                key={i}
                onPress={
                  item.hostUid === auth.uid
                    ? () => {
                        dispatch({ type: SET_GAME, payload: item });
                        navigation.navigate("CreateGameFlow", {
                          hostUid: item.hostUid,
                          gameState: item.gameState,
                          gameName: item.gameSettings.title,
                          isPlaying:
                            item.seating.filter((s) => s.uid === auth.uid)
                              .length > 0,
                        });
                      }
                    : () => {
                        dispatch({ type: SET_GAME, payload: item });
                        navigation.navigate("GameScreen", {
                          hostUid: item.hostUid,
                          gameState: item.gameState,
                          gameName: item.gameSettings.title,
                        });
                      }
                }
              >
                <Card
                  containerStyle={{
                    width: 100,
                    height: 300,
                    backgroundColor: "cornsilk",
                    borderRadius: 5,
                    shadowColor: "#000",
                    shadowOffset: { width: 1, height: 2 },
                    shadowOpacity: 0.6,
                    shadowRadius: 1.5,
                    padding: 2,
                  }}
                >
                  {item.hostUid === auth.uid && (
                    <Badge
                      value={
                        <View style={{ flexDirection: "row" }}>
                          <Icon
                            name="shield-account"
                            type="material"
                            size={15}
                            color="white"
                          />
                        </View>
                      }
                      badgeStyle={{
                        backgroundColor: "lightgrey",
                      }}
                      badgeStyle={{
                        height: 25,
                        width: 25,
                        borderRadius: 50,
                        backgroundColor: "grey",
                      }}
                      containerStyle={{
                        position: "absolute",
                        top: 5,
                        right: -10,
                      }}
                    />
                  )}

                  <Badge
                    status={"primary"}
                    value={
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Icon
                          name="cards"
                          type="material"
                          size={25}
                          color="white"
                        />

                        <Text style={[h7Style, { color: "white" }]}>
                          {item.gameSettings?.stakes} {item.gameSettings?.game}
                        </Text>
                      </View>
                    }
                    textStyle={{
                      color: "white",
                      fontSize: 20,
                    }}
                    badgeStyle={{
                      width: 102,
                      backgroundColor: "crimson",
                      borderRadius: 0,
                      height: 30,
                    }}
                    containerStyle={{
                      position: "absolute",
                      bottom: -45,
                      left: -3,
                      width: 102,
                      borderRadius: 0,
                    }}
                  />

                  <Badge
                    status={"primary"}
                    value={item.groupName}
                    textStyle={{
                      color: "white",
                      fontSize: 14,
                    }}
                    badgeStyle={{
                      width: 103,
                      backgroundColor: "grey",
                      borderRadius: 0,
                      height: 20,
                    }}
                    containerStyle={{
                      position: "absolute",
                      top: -15,
                      left: -4,
                      width: 103,
                      borderRadius: 0,
                    }}
                  />

                  <Badge
                    status={"success"}
                    value={
                      <View style={{ flexDirection: "row" }}>
                        <Icon
                          name={
                            item.gameState.includes("RUNNING")
                              ? "cards"
                              : item.gameState.includes("REGISTRATION")
                              ? "clipboard-text"
                              : "lock"
                          }
                          type="material"
                          size={20}
                          color="white"
                        />
                      </View>
                    }
                    badgeStyle={{
                      height: 25,
                      width: 25,
                      borderRadius: 50,
                    }}
                    containerStyle={{
                      position: "absolute",
                      top: 5,
                      left: -10,
                    }}
                  />

                  {item.gameState.includes("HIDDEN") ||
                    (item.gameState.includes("PRIVATE") && (
                      <Badge
                        value={
                          <View style={{ flexDirection: "row" }}>
                            <Icon
                              name={
                                item.gameState.includes("HIDDEN")
                                  ? "eye-off"
                                  : item.gameState.includes("PRIVATE")
                                  ? "lock"
                                  : "eye-check"
                              }
                              type="material"
                              size={20}
                              color="white"
                            />
                          </View>
                        }
                        badgeStyle={{
                          height: 25,
                          width: 25,
                          borderRadius: 50,
                        }}
                        status={"warning"}
                        containerStyle={{
                          position: "absolute",
                          top: 5,
                          right: 10,
                        }}
                      />
                    ))}

                  <View style={vs30} />

                  <View style={{ flexDirection: "row" }}>
                    <Icon
                      name="shield-account"
                      type="material"
                      size={15}
                      color="grey"
                    />

                    <Text style={h6Style}>{item.hostedBy}</Text>
                  </View>

                  <View style={spacedRow}>
                    <View style={{ flexDirection: "row" }}>
                      <Icon
                        name="calendar-clock"
                        type="material"
                        size={15}
                        color="grey"
                      />

                      <Text style={h6Style}>
                        {format(
                          parse(
                            item.gameSettings.venueOpenTime,
                            "PPPPp",
                            new Date()
                          ),
                          "EEE/MMM/d"
                        )}
                      </Text>
                    </View>

                    <View style={{ flexDirection: "row" }}>
                      <Icon
                        name="clock-outline"
                        type="material"
                        size={15}
                        color={
                          item.gameState.includes("RUNNING") ? "orange" : "grey"
                        }
                      />

                      {item.gameState.includes("RUNNING") ? (
                        <Text style={[h6Style, { color: "orange" }]}>
                          {formatDistance(
                            new Date(Date.now()),
                            new Date(
                              parse(
                                item.gameSettings.venueOpenTime,
                                "PPPPp",
                                new Date()
                              )
                            ),
                            { includeSeconds: false }
                          )}
                        </Text>
                      ) : (
                        <Text style={h6Style}>
                          {format(
                            parse(
                              item.gameSettings.venueOpenTime,
                              "PPPPp",
                              new Date()
                            ),
                            "p"
                          )}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={{ flexDirection: "row" }}>
                    {item.gameState.includes("RUNNING") && (
                      <Icon
                        name="poker-chip"
                        type="material"
                        size={15}
                        color="green"
                      />
                    )}

                    {item.gameState.includes("RUNNING") ? (
                      <Text style={[h6Style, { color: "green" }]}>
                        {item.chipsInPlay}
                      </Text>
                    ) : (
                      <Text style={[h6Style]}>Join!</Text>
                    )}
                  </View>

                  <View>
                    {item.seating?.map((u, i) => {
                      return (
                        <Text
                          key={i}
                          style={[
                            h6Style,
                            { color: u.requested ? "red" : "grey" },
                          ]}
                        >
                          {i + 1}. {u.displayName} {u.requested ? "(R)" : ""}{" "}
                          {u.late ? `+${u.late}m` : ""}
                        </Text>
                      );
                    })}
                  </View>

                  <Text style={h6Style}>{`Wait list: ${
                    item?.waitList?.length || 0
                  }`}</Text>
                </Card>
              </TouchableOpacity>
            );
          })}
      </ScrollView>
    </ScrollView>
  );
};

export default FeedScreen;
