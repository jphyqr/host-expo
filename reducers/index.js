import { combineReducers } from "redux";
import { firestoreReducer } from "redux-firestore";
import { firebaseReducer } from "react-redux-firebase";
import { phoneReducer } from "../reducers/phoneReducer";
import {
  gameReducer,
  gamesReducer,
  groupReducer,
  groupsReducer,
} from "./gameReducer";
import { persistReducer } from "redux-persist";
import { AsyncStorage } from "react-native";
const rootReducer = combineReducers({
  firestore: firestoreReducer,
  firebase: firebaseReducer,
  phone: phoneReducer,
  game: gameReducer,
  game_s: gamesReducer,
  group: groupReducer,

  group_s: groupsReducer,
});

const config = {
  version: "0.0.1",
  key: "root",
  storage: AsyncStorage,
  debug: true,
};
export default persistReducer(config, rootReducer);
