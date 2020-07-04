import { SET_AVATARS } from "../constants/reducerConstants";

export const avatarsReducer = (state = [], action) => {
  switch (action.type) {
    case SET_AVATARS:
      return action.payload;
    default:
      return state;
  }
};
