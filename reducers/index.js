import { combineReducers } from "redux";
import { firestoreReducer } from "redux-firestore";
import { firebaseReducer } from "react-redux-firebase";
import { phoneReducer } from "../reducers/phoneReducer";
import {
  gameReducer,
  gamesReducer,
  gameTransactionsReducer,
} from "./gameReducer";
import { persistReducer } from "redux-persist";
import { AsyncStorage } from "react-native";
import { avatarsReducer } from "./avatarsReducer";
import {
  hostGroupsReducer,
  areaGroupsReducer,
  inviteGroupsReducer,
  memberGroupsReducer,
  groupReducer,
  groupsReducer,
  memberOfGroupReducer,
} from "./groupsReducer";
import { membersInAreaReducer } from "./membersInAreaReducer";
import { userPhotosReducer } from "./userPhotosReducer";
import { overlayReducer } from "./overlayReducer";
import { userReducer } from "./userReducer";
import { touchReducer } from "./touchReducer";
const rootReducer = combineReducers({
  firestore: firestoreReducer,
  firebase: firebaseReducer,
  phone: phoneReducer,
  game: gameReducer,
  game_s: gamesReducer,
  avatars: avatarsReducer,
  group: groupReducer,
  memberOfGroup: memberOfGroupReducer,
  hostGroups: hostGroupsReducer,
  areaGroups: areaGroupsReducer,
  inviteGroups: inviteGroupsReducer,
  memberGroups: memberGroupsReducer,
  membersInArea: membersInAreaReducer,
  userPhotos: userPhotosReducer,
  gameTransactions: gameTransactionsReducer,
  overlay: overlayReducer,
  user: userReducer,
  touch: touchReducer,
});

const config = {
  version: "0.0.1",
  key: "root",
  storage: AsyncStorage,
  debug: true,
};
export default persistReducer(config, rootReducer);
