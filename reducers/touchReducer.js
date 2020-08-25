import { SET_TOUCH, ADD_USER_PHOTO } from "../constants/reducerConstants";

export const touchReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_TOUCH:
      return action.payload;
      break;

    default:
      return state;
  }
};
