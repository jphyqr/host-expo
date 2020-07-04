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
  Avatar,
} from "react-native-elements";
import { useDispatch } from "react-redux/lib/hooks/useDispatch";
import { createGame, deleteGroup } from "../actions/gameActions";
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
import { SET_GAME, DELETE_HOST_GROUP } from "../constants/reducerConstants";
const GroupAdminScreen = ({ navigation }) => {
  const xGroup = useSelector((state) => state.group || {});
  const [_group, setGroup] = useState({});
  const firestore = firebase.firestore();
  const auth = useSelector((state) => state.firebase.auth || {});
  const [_loading, loading] = useState(false);
  const [_deleting, deleting] = useState(false);
  const [_fU, fU] = useState(0);
  const dispatch = useDispatch();

  const handleDeleteGroup = async () => {
    Alert.alert(
      "Delete Group",
      "This will delete all games, and stats for goroup.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete Group",
          onPress: async () => {
            try {
              deleting(true);

              await dispatch(deleteGroup({ firestore }, _group.id));
              dispatch({
                type: DELETE_HOST_GROUP,
                payload: { id: `${_group.id}_${auth.uid}` },
              });
              console.log("should navigate to main");
              navigation.goBack();
              deleting(false);
            } catch (error) {
              console.log({ error });
              deleting(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleCreateGameClick = async () => {
    loading(true);

    try {
      let createdGame = await dispatch(
        createGame({ firestore }, _group, _group.id)
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
      where: ["groupId", "==", xGroup.id || ""],
      storeAs: "groupsGames",
    }),
    [xGroup]
  );

  useFirestoreConnect(groupsGamesQuery);

  const groupsGames = useSelector(
    (state) => state.firestore.ordered.groupsGames || []
  );

  useEffect(() => {
    setGroup(xGroup);
    fU(_fU + 1);
  }, [xGroup]);

  if (_.isEmpty(xGroup) || _.isEmpty(_group)) return <ActivityIndicator />;

  const AcceptButton = () => (
    <Icon reverse name="ios-american-football" type="ionicon" color="#517fa4" />
  );
  const pendingButtons = [{ element: AcceptButton }, { element: AcceptButton }];

  return (
    <ScrollView>
      <View style={spacedRow}>
        <Text style={h2Style}>{_group.name}</Text>

        <Avatar
          key={"groupAvatar"}
          rounded
          source={{ uri: _group.photoURL }}
          size="medium"
          onPress={() => {
            navigation.openDrawer();
          }}
        />
      </View>

      {!_.isEmpty(_group?.pending) && (
        <View>
          <View style={vs30} />
          <Text style={h5Style}>Pending</Text>
          <View>
            {Object.keys(_group?.pending).map((g, i) => {
              return (
                <ListItem
                  key={i}
                  title={_group?.pending[`${g}`].displayName}
                  subtitle={_group?.pending[`${g}`].message}
                  leftAvatar={{
                    source: { uri: _group?.pending[`${g}`].photoURL },
                  }}
                  onPress={() =>
                    navigation.navigate("GroupMemberScreen", {
                      user: _group?.pending[`${g}`],
                      id: g,
                      pending: true,
                    })
                  }
                  chevron
                />
              );
            })}
          </View>
        </View>
      )}

      {!_.isEmpty(_group?.members) && (
        <View>
          <View style={vs10} />
          {!_.isEmpty(_group?.members) && <Text syle={h4Style}>Members</Text>}
          {Object.keys(_group?.members)?.map((g, i) => {
            return (
              <ListItem
                key={i}
                title={_group?.members[`${g}`].displayName}
                chevron
                onPress={() =>
                  navigation.navigate("GroupMemberScreen", {
                    user: _group?.members[`${g}`],
                    id: g,
                    pending: false,
                  })
                }
              />
            );
          })}
        </View>
      )}

      <Button
        onPress={() =>
          navigation.navigate("AddMemberScreen", {
            groupId: _group.id,
            groupName: _group.name,
          })
        }
        type="outline"
        title="Add Member by Phone"
      />
      <Button
        onPress={() => navigation.navigate("InviteGroupMembersScreen")}
        type="outline"
        title="Invite Members in Area"
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
              <Text>{g.gameName}</Text>
              <Text>{g.gameState}</Text>
              {g.seating?.map((p, i) => {
                return (
                  <Text style={h7Style} key={i}>
                    Seat {i + 1} {p.displayName}
                  </Text>
                );
              })}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={vs30} />

      <View style={spacedRow}>
        <Button
          loading={_deleting}
          type="outline"
          onPress={handleDeleteGroup}
          title="Delete Group"
        />

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
    </ScrollView>
  );
};

export default GroupAdminScreen;
