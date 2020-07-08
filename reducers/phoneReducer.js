import { SET_PHONE, ADD_USER_PHOTO } from "../constants/reducerConstants";

export const phoneReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_PHONE:
      return action.payload;
      break;
    case ADD_USER_PHOTO:
      return [...state, Object.assign({}, action.payload)];
      break;
    default:
      return state;
  }
};
