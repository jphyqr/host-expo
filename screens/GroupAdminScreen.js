import React, { useEffect, useState, useMemo } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { useSelector } from "react-redux";
import firebase from "../firebase";
import _ from "lodash";
import {
  ListItem,
  ButtonGroup,
  Button,
  Icon,
  Card,
} from "react-native-elements";
import { useDispatch } from "react-redux/lib/hooks/useDispatch";
import { createGame } from "../actions/gameActions";
import { useFirestoreConnect } from "react-redux-firebase";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import {
  h2Style,
  h7Style,
  vs30,
  h3Style,
  vs10,
  h4Style,
  h5Style,
  spacedRow,
} from "../styles/styles";
import { SET_GAME } from "../constants/reducerConstants";
const GroupAdminScreen = ({ navigation }) => {
  const groupId = useSelector((state) => state.group || {});
  const [_group, setGroup] = useState({});
  const firestore = firebase.firestore();
  const auth = useSelector((state) => state.firebase.auth || {});
  const [_loading, loading] = useState(false);
  const dispatch = useDispatch();
  const handleCreateGameClick = async () => {
    loading(true);

    try {
      let createdGame = await dispatch(
        createGame({ firestore }, _group, groupId)
      );
      console.log({ createdGame });
      navigation.navigate("CreateGameScreen");
      loading(false);
    } catch (error) {
      console.log({ error });
      // Alert.alert("Error Creating Game", error);
      loading(false);
    }
  };

  const groupsGamesQuery = useMemo(
    () => ({
      collection: "games",
      where: ["groupId", "==", groupId],
      storeAs: "groupsGames",
    }),
    [groupId]
  );

  useFirestoreConnect(groupsGamesQuery);

  const groupsGames = useSelector(
    (state) => state.firestore.ordered.groupsGames || []
  );

  useEffect(() => {
    const getGroupModel = async () => {
      //clear notification badge
      await firestore
        .collection("group_member")
        .doc(`${groupId}_${auth.uid}`)
        .update({
          notificationBadge: false,
        });

      let groupDoc = await firestore.collection("groups").doc(groupId).get();

      setGroup({ id: groupDoc.id, ...groupDoc.data() });
    };

    auth.isLoaded && !auth.isEmpty && getGroupModel();
  }, [groupId, auth]);

  if (_.isEmpty(_group)) return <ActivityIndicator />;

  const AcceptButton = () => (
    <Icon reverse name="ios-american-football" type="ionicon" color="#517fa4" />
  );
  const pendingButtons = [{ element: AcceptButton }, { element: AcceptButton }];

  return (
    <ScrollView>
      <View style={spacedRow}>
        <Text style={h2Style}>{_group.name}</Text>
        <Button
          loading={_loading}
          type="solid"
          onPress={handleCreateGameClick}
          title="CreateGame"
          icon={{
            name: "add",
            size: 15,
            color: "white",
          }}
        />
      </View>

      <View style={vs30} />
      {!_.isEmpty(_group.pending) && <Text style={h5Style}>Pending</Text>}

      {Object.keys(_group?.pending).map((g, i) => {
        return (
          <ListItem
            key={i}
            title={_group.pending[`${g}`].displayName}
            subtitle={_group.pending[`${g}`].message}
            leftAvatar={{ source: { uri: _group.pending[`${g}`].photoURL } }}
            onPress={() =>
              navigation.navigate("GroupMemberScreen", {
                user: _group.pending[`${g}`],
                id: g,
                pending: true,
              })
            }
            chevron
          />
        );
      })}
      <View style={vs10} />
      {!_.isEmpty(_group.members) && <Text syle={h4Style}>Members</Text>}
      {Object.keys(_group?.members).map((g, i) => {
        return (
          <ListItem
            key={i}
            title={_group.members[`${g}`].displayName}
            chevron
            onPress={() =>
              navigation.navigate("GroupMemberScreen", {
                user: _group.members[`${g}`],
                id: g,
                pending: false,
              })
            }
          />
        );
      })}
      <Button
        onPress={() => navigation.navigate("AddMemberScreen")}
        type="outline"
        title="Add Member by Phone"
      />
      <View style={vs30} />
      <Text style={h3Style}>Groups Games</Text>

      <ScrollView horizontal>
        {groupsGames?.map((g, i) => {
          return (
            <TouchableOpacity
              key={i}
              onPress={() => {
                dispatch({
                  type: SET_GAME,
                  payload: g,
                });
                navigation.navigate("CreateGameScreen", {
                  id: g.id,
                });
              }}
            >
              <Card key={i} title={g.gameName}>
                <Text>{g.gameState}</Text>
                {g.seating?.map((p, i) => {
                  return (
                    <Text style={h7Style} key={i}>
                      Seat {i + 1} {p.displayName}
                    </Text>
                  );
                })}
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={vs30} />
      <Button
        loading={_loading}
        type="solid"
        onPress={handleCreateGameClick}
        title="CreateGame"
        icon={{
          name: "add",
          size: 15,
          color: "white",
        }}
      />
      <View style={vs30} />
    </ScrollView>
  );
};

export default GroupAdminScreen;
