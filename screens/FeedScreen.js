import React, { useEffect, useState, useMemo, useDebugValue } from "react";
import {
  View,
  Text,
  Button,
  SectionList,
  AsyncStorage,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import firebase from "../firebase";
import { useSelector } from "react-redux/lib/hooks/useSelector";
import {
  PRIVACY,
  GAME_STATES,
  OVERLAYS,
  CHAT_TYPE,
  CHANNEL_TYPE,
} from "../constants/helperConstants";
import { useFirestoreConnect } from "react-redux-firebase";
import {
  Avatar,
  Card,
  ListItem,
  Badge,
  Overlay,
  Image,
} from "react-native-elements";
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
  SET_OVERLAY,
  SET_DISPLAY_NAME,
  SET_PHOTO_URL,
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
  h3Style,
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
import ChangeDisplayPhoto from "../components/ChangeDisplayPhoto";
import RecordVideo from "../components/RecordVideo";
import GameCard from "../components/GameCard/GameCard";
import MemoAvatar from "../components/MemoAvatar";
import StoryAvatar from "../components/StoryAvatar";
const FeedScreen = ({ navigation }) => {
  const auth = useSelector((state) => state.firebase.auth || {});
  const ROOT_URL = "https://us-central1-poker-cf130.cloudfunctions.net";
  const [_loading, loading] = useState(false);
  const [_editProfile, setEditProfile] = useState(false);
  const [_recordVideo, setRecordVideo] = useState(false);
  const [_changeDisplayPhoto, setChangeDisplayPhoto] = useState(false);
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
  const xOverlay = useSelector((state) => state.overlay || "");
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
  // useFocusEffect(
  //   React.useCallback(() => {
  //     console.log("USE FOCUS EFFECT");

  //     return () => refreshFeed();
  //   }, [])
  // );

  useEffect(() => {
    if (xOverlay === OVERLAYS.EDIT_PROFILE) setEditProfile(true);
    else if (xOverlay === OVERLAYS.CHANGE_DISPLAY_NAME)
      setChangeDisplayPhoto(true);
    else if (xOverlay === OVERLAYS.RECORD) setRecordVideo(true);
    else {
      setEditProfile(false);
      setChangeDisplayPhoto(false);
      setRecordVideo(false);
    }
  }, [xOverlay]);

  // useEffect(() => {
  //   if (profile.isLoaded && !profile.isEmpty) {
  //     if (!profile.userHasSetEP) setNoPassword(true);
  //     else if (!profile.userHasSetDisplayName) {
  //       setNoDisplayName(true);
  //     }
  //     setProfile(profile);
  //     setNewFeed(profile.newFeed);
  //   }
  // }, [profile]);

  useEffect(() => {
    if (
      !_noDisplayName &&
      profile.isLoaded &&
      !profile.isEmpty &&
      !profile.userHasSetEP
    ) {
      setNoPassword(true);
    }
  }, [_noDisplayName]);

  useEffect(() => {
    setHostGroups(xHostGroups);
    setCount(count + 1);
  }, [xHostGroups]);

  useEffect(() => {
    setAreaGroups(xAreaGroups);
    setCount(count + 1);
  }, [xAreaGroups]);
  useEffect(() => {
    setInvitedGroups(xInviteGroups);
    setCount(count + 1);
  }, [xInviteGroups]);
  useEffect(() => {
    setMemberGroups(xMemberGroups);
    setCount(count + 1);
  }, [xMemberGroups]);

  const refreshFeed = async (data) => {
    //  await checkPermissions();

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

    dispatch({ type: SET_USER_PHOTOS, payload: user_photos });

    dispatch({
      type: SET_MEMBERS_IN_AREA,
      payload: { members: other_users_in_area, following: following },
    });
    dispatch({ type: SET_HOST_GROUPS, payload: hostGroups });
    dispatch({ type: SET_MEMBER_GROUPS, payload: justMember });

    dispatch({ type: SET_INVITE_GROUPS, payload: groupsInvited });

    let allGroups = [
      ...hostGroups,
      ...justMember,
      ...groupsInvited,
      ...other_groups_in_area,
    ];

    dispatch({
      type: SET_AREA_GROUPS,
      payload: allGroups.sort((a, b) => a.lastPostDate > b.lastPostDate),
    });

    setGroups(other_groups_in_area);
    setFeed(feed);

    setGamesLive(games);
    setCount(count + 1);

    dispatch({ type: SET_GAME_S, payload: games });
  };

  useEffect(() => {
    console.log("UE 1 CHANGED");
    let source = axios.CancelToken.source();
    let mounted = true;

    const getFeedItems = async () => {
      loading(true);
      if (auth.isLoaded && !auth.isEmpty) {
        try {
          let { data } = await axios.post(`${ROOT_URL}/getMobileHomeData`, {
            cancelToken: source.token,
            uid: auth.uid,
          });

          refreshFeed(data);
        } catch (error) {
          if (Axios.isCancel(error)) {
            console.log(`call for ${url} was cancelled`);
          } else {
            console.log("RefershFeed Error", error);
            throw error;
          }
        }
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

    const setUser = () => {
      dispatch({ type: SET_DISPLAY_NAME, payload: auth.displayName });

      dispatch({ type: SET_PHOTO_URL, payload: auth.photoURL });
    };
    auth.isLoaded && !auth.isEmpty && getFeedItems();

    auth.isLoaded && !auth.isEmpty && setUser();

    auth.isLoaded && !auth.isEmpty && saveTokenToStorage();

    if (auth.isLoaded && auth.isEmpty) {
      navigation.navigate("Welcome");
    }

    return () => {
      // Let's cancel the request on effect cleanup
      source.cancel();
    };
  }, []);

  useEffect(() => {
    setGamesLive(game_s);
    setCount(count + 1);
  }, [game_s]);

  const [refreshing, setRefreshing] = React.useState(false);

  const handleClickGame = async (game) => {
    let uGamesClicked = profile.gamesClicked || {};
    uGamesClicked[`${game.id}`] = Date.now();
    await firestore.collection("users").doc(auth.uid).update({
      watchedGamesSnapAt: uGamesClicked,
    });
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    console.log("trying to refresh from location 2", auth.uid);
    let { data } = await axios.post(`${ROOT_URL}/getMobileHomeData`, {
      uid: auth.uid,
    });

    refreshFeed(data);

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
      <View style={vs30} />
      <View style={vs30} />
      <View style={vs30} />
      {_noDisplayName && (
        <DisplayName
          onOkay={() => {
            setNoDisplayName(false);

            if (!profile.userHasSetEP) setNoPassword(true);
          }}
        />
      )}

      {/* {_recordVideo && <RecordVideo />} */}

      {_editProfile && (
        <EmailPassword
          onOkay={() =>
            dispatch({
              type: SET_OVERLAY,
              payload: OVERLAYS.CLEAR,
            })
          }
        />
      )}
      {_changeDisplayPhoto && (
        <ChangeDisplayPhoto
          onOkay={() => {
            dispatch({
              type: SET_OVERLAY,
              payload: OVERLAYS.CLEAR,
            });
          }}
        />
      )}

      <View style={{ display: "flex", flexDirection: "row" }}>
        <View style={{ marginRight: 20 }}></View>
        <View style={{ flexDirection: "column" }}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("CreateGroupFlow");
            }}
          >
            <Text style={h3Style}>+</Text>
          </TouchableOpacity>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {_groups_invited?.map((item, i) => {
              return (
                <View key={i} style={{ marginRight: 5 }}>
                  <StoryAvatar
                    label={item.groupName}
                    rounded
                    showAccessory
                    accessory={{
                      name: "mail",
                      type: "material",
                      color: "red",
                    }}
                    source={{ uri: item?.groupPhotoURL }}
                    updateOn={item?.groupPhotoURL}
                    size="large"
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
                  <StoryAvatar
                    label={item.groupName}
                    rounded
                    showAccessory
                    accessory={{
                      name: "security",
                      type: "material",
                      color: item.notificationBadge ? "red" : "black",
                    }}
                    source={{ uri: item?.groupPhotoURL }}
                    updateOn={item?.groupPhotoURL}
                    size="large"
                    overlayContainerStyle={{ backgroundColor: "blue" }}
                    onPress={() =>
                      navigation.navigate("ChatScreen", {
                        channelName: item.groupName,
                        channelPhotoURL: item.groupPhotoURL,
                        channelType: CHANNEL_TYPE.GROUP,
                        channelId: item.groupId,
                      })
                    }
                  />
                </View>
              );
            })}

            {_member_groups.map((item, i) => {
              return (
                <View key={i} style={{ marginRight: 5 }}>
                  <StoryAvatar
                    label={item.groupName}
                    rounded
                    source={{ uri: item?.groupPhotoURL }}
                    updateOn={item?.groupPhotoURL}
                    size="large"
                    overlayContainerStyle={{ backgroundColor: "blue" }}
                    showAccessory
                    accessory={{
                      name: "verified-user",
                      type: "material",
                      color: item.notificationBadge ? "red" : "grey",
                    }}
                    onPress={() =>
                      navigation.navigate("ChatScreen", {
                        groupId: item.groupId,
                        groupName: item.groupName,
                        groupPhotoURL: item.groupPhotoURL,
                        type: "GROUP",
                        channelId: item.groupId,
                      })
                    }
                    // onPress={async () => {

                    //   try {
                    //     loading(true);
                    //     let groupDoc = await firestore
                    //       .collection("groups")
                    //       .doc(item.groupId)
                    //       .get();

                    //     dispatch({
                    //       type: SET_GROUP,
                    //       payload: { id: groupDoc.id, ...groupDoc.data() },
                    //     });

                    //     dispatch({ type: SET_MEMBER_OF_GROUP, payload: item });
                    //     loading(false);
                    //     navigation.navigate("GroupScreen");
                    //   } catch (error) {
                    //     console.log("error moving", error);
                    //     loading(false);
                    //   }
                    // }}
                  />
                </View>
              );
            })}

            <View style={hs30}></View>
            <View style={hs30}></View>
          </ScrollView>
          {/* <Text style={h7Style}>Other groups In Area</Text>
          <ScrollView
            style={{ marginBottom: 20 }}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {_area_groups.map((item, i) => {
              return (
                <View key={i} style={{ marginRight: 5 }}>
                  <StoryAvatar
                    label={item.groupName}
                    rounded
                    source={{ uri: item?.groupPhotoURL }}
                    updateOn={item?.groupPhotoURL}
                    size="large"
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
          </ScrollView> */}
        </View>
      </View>

      <View style={vs30} />
      <ScrollView style={{ padding: 0, margin: 0 }} horizontal>
        {_gamesLive
          .sort(
            (a, b) =>
              parse(a.gameSettings.venueOpenTime, "PPPPp", new Date()) -
              parse(b.gameSettings.venueOpenTime, "PPPPp", new Date())
          )
          .map((item, i) => {
            return (
              <GameCard
                auth={auth}
                i={i}
                handleClickGame={handleClickGame}
                navigation={navigation}
                id={item.id}
                key={i}
              />
            );
          })}
      </ScrollView>
    </ScrollView>
  );
};

export default FeedScreen;
