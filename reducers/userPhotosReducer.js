import { SET_USER_PHOTOS } from "../constants/reducerConstants";

export const userPhotosReducer = (state = [], action) => {
  switch (action.type) {
    case SET_USER_PHOTOS:
      return action.payload;
      break;

    default:
      return state;
  }
};
