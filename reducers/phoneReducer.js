import { SET_PHONE } from "../constants/reducerConstants";

export const phoneReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_PHONE:
      return action.payload;
    default:
      return state;
  }
};
