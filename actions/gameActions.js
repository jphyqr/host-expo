import { PRIVACY, GAME_STATES } from "../constants/helperConstants";
import { format } from "date-fns";
import {
  CREATE_GAME,
  DELETE_GAME,
  SET_GAME,
  DELETE_GROUP,
  DELETE_HOST_GROUP,
} from "../constants/reducerConstants";

export const deleteGame = ({ firestore }, id) => {
  return async (dispatch) => {
    try {
      var batch = firestore.batch();

      var gameRef = firestore.collection("games").doc(id);
      var groupGameQuery = firestore
        .collection("groups_games")
        .where("gameId", "==", id);
      var inviteQuery = firestore
        .collection("game_invite")
        .where("gameId", "==", id);
      var inviteSnap = await inviteQuery.get();
      var groupGameSnap = await groupGameQuery.get();
      inviteSnap.forEach((doc) => {
        batch.delete(doc.ref);
      });

      groupGameSnap.forEach((doc) => {
        batch.delete(doc.ref);
      });
      batch.delete(gameRef);

      await batch.commit();
      dispatch({ type: DELETE_GAME, payload: { id: id } });
      dispatch({ type: SET_GAME, payload: {} });
      return;
    } catch (error) {
      console.log("Error deleting", error);
      return error;
    }
  };
};

export const createGame = ({ firestore }, navigation, group, groupId) => {
  return async (dispatch, getState) => {
    try {
      let newGame = {
        creationDate: Date.now(),
        groupId: groupId,
        gameSettings: {
          dealer: "None",
          title: `${group.name}'s Game`,
          drinksAvailable: [],
          drinksProvided: [],
          game: "NLH",
          smoking: "None",
          stakes: "1-2",
          straddles: [],
          venue: "House",
          venueOpenTime: format(Date.now(), "PPPPp"),
        },
        seating: [
          { taken: false, seatName: "Seat 1" },
          { taken: false, seatName: "Seat 2" },
          { taken: false, seatName: "Seat 3" },
          { taken: false, seatName: "Seat 4" },
          { taken: false, seatName: "Seat 5" },
          { taken: false, seatName: "Seat 6" },
          { taken: false, seatName: "Seat 7" },
          { taken: false, seatName: "Seat 8" },
          { taken: false, seatName: "Seat 9" },
        ],
        dispatched: false,
        game_set: false,
        gameState:
          group.privacy === PRIVACY.OPEN
            ? GAME_STATES.OPEN_REGISTRATION
            : GAME_STATES.PRIVATE_REGISTRATION,
        groupName: group.name,
        groupPhotoURL: group.photoURL,
        privacy: group.privacy,
        hostUid: group.hostUid,
        hostedBy: group.hostedBy,
        area: group.area,
        hostPhotoURL: group.hostPhotoURL || "/assets/user.png",
        members: {
          [group.hostUid]: {
            joinDate: Date.now(),
            photoURL: group.hostPhotoURL || "/assets/user.png",
            displayName: group.hostedBy,
            host: true,
          },
          ...group.members,
        },
      };
      let result = await firestore.collection("games").add(newGame);

      newGame.id = result.id;
      await firestore
        .collection("groups_games")
        .doc(`${group.id}_${newGame.id}`)
        .set({
          creationDate: Date.now(),
          gameId: newGame.id,
          groupId: group.id,
          dispatched: false,
          game_set: false,
          gameName: `${group.name}'s Game`,
          gameState:
            group.privacy === PRIVACY.OPEN
              ? GAME_STATES.OPEN_REGISTRATION
              : GAME_STATES.PRIVATE_REGISTRATION,
          privacy: group.privacy,
        });

      dispatch({ type: SET_GAME, payload: newGame });

      navigation.navigate("CreateGameFlow", {
        hostUid: group.hostUid,
        gameState: newGame.gameState,
        isPlaying: false,
      });

      dispatch({ type: CREATE_GAME, payload: { id: newGame.id, ...newGame } });

      return newGame;
    } catch (error) {
      console.log({ error });
    }
  };
};

export const deleteGroup = ({ firestore }) => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const userUid = state.firebase.auth.uid;
      const id = state.group.id;

      var batch = firestore.batch();

      //groups table
      var groupRef = firestore.collection("groups").doc(id);
      //all the group_games -->delete these and then for each game, delete invites

      var groupNotificationsQuery = firestore
        .collection("groups_notifications")
        .where("groupId", "==", id);

      var groupNotificationSnap = await groupNotificationsQuery.get();
      groupNotificationSnap.forEach((doc) => {
        batch.delete(doc.ref);
      });

      var groupMemberQuery = firestore
        .collection("group_member")
        .where("groupId", "==", id);

      var groupMemberSnap = await groupMemberQuery.get();
      groupMemberSnap.forEach((doc) => {
        batch.delete(doc.ref);
      });

      var groupGameQuery = firestore
        .collection("groups_games")
        .where("groupId", "==", id);

      var groupGameSnap = await groupGameQuery.get();

      groupGameSnap.forEach(async (doc) => {
        let inviteQuery = firestore
          .collection("game_invite")
          .where("gameId", "==", doc.data().gameId);
        let inviteSnap = await inviteQuery.get();

        inviteSnap.forEach((doc2) => {
          batch.delete(doc2.ref);
        });

        batch.delete(doc.ref);
      });
      batch.delete(groupRef);

      await batch.commit();

      dispatch({
        type: DELETE_HOST_GROUP,
        payload: { id: `${id}_${userUid}` },
      });

      return;
    } catch (error) {
      console.log("Error deleting", error);
      return error;
    }
  };
};
