import {
  SET_DM,
  SET_UNREAD_MESSAGE,
  CLEAR_UNREAD_MESSAGE,
  INCREMENT_URM,
  DECREMENT_URM,
  ADD_URM,
  REMOVE_URM,
} from "../constants/reducerConstants";

const initialState = {};

export const badgeReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_URM:
      {
        let uState = state;
        uState[`${action.payload.id}`] = action.payload;
        return { ...uState };
      }
      break;
    case REMOVE_URM:
      {
        let uState = state;
        delete uState[`${action.payload.id}`];
        return { ...uState };
      }
      break;
    default:
      return state;
  }
};
