import { SET_DISPLAY_NAME, SET_PHOTO_URL } from "../constants/reducerConstants";

export const userReducer = (
  state = { photoURL: {}, displayName: "" },
  action
) => {
  switch (action.type) {
    case SET_DISPLAY_NAME:
      return Object.assign(state, { displayName: action.payload });
      break;
    case SET_PHOTO_URL:
      let updatedState = state;
      updatedState.photoURL = action.payload;
      console.log("update photo url", updatedState);
      return Object.assign({}, updatedState);
      break;
    default:
      return state;
  }
};
