import { SET_DM } from "../constants/reducerConstants";

export const dMReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_DM:
      return action.payload;
    default:
      return state;
  }
};
