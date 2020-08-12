import { SET_OVERLAY } from "../constants/reducerConstants";
import { OVERLAYS } from "../constants/helperConstants";

export const overlayReducer = (state = OVERLAYS.CLEAR, action) => {
  switch (action.type) {
    case SET_OVERLAY:
      return action.payload;
    default:
      return state;
  }
};
