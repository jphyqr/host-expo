import {
  SET_TOUCH,
  ADD_USER_PHOTO,
  SET_DRAG_POSITION,
  REGISTER_OPEN_SEAT,
  CLEAR_TOUCH,
  MOVE_MEMBER,
  RETURN_MEMBER,
  DROP_MEMBER,
  REGISTER_WAIT_DROP_ZONE,
} from "../constants/reducerConstants";

const initialState = {
  touched: false,
  dropped: false,
  x: 0,
  y: 0,
  displacement: 0,
  openSeatLocations: {},
  waitDropZones: {},
  member: {},
  index: -1,
  returnMember: false,
  showWaitDrop: false,
};

/*
All state changes for touch drag and drop
handled by panresponder 
--
touched: direct specific UI elements to show/appear/change
when any drag is happening (ie Snapchat trash can)
dropped: direct parent (poker table) that drop  of child
has happened
returnMember: direct child that drop did not hit a landmark
index: index of child being dragged
member: data of child be dragged
*/
export const touchReducer = (state = initialState, action) => {
  switch (action.type) {
    case RETURN_MEMBER:
      return Object.assign(state, { returnMember: action.payload });
    case DROP_MEMBER:
      return Object.assign(state, { dropped: true, showWaitDrop: false });

    case REGISTER_OPEN_SEAT:
      let uOpens = { ...state.openSeatLocations };

      uOpens[`${action.payload.seatIndex}`] = {
        seatIndex: action.payload.seatIndex,
        ...action.payload.seatDimensions,
      };

      return Object.assign(state, { openSeatLocations: uOpens });
      break;

    case REGISTER_WAIT_DROP_ZONE:
      let uDropZones = { ...state.waitDropZones };

      uDropZones[`${action.payload.waitIndex}`] = {
        waitIndex: action.payload.waitIndex,
        ...action.payload.boundaries,
      };

      return Object.assign(state, { waitDropZones: uDropZones });
      break;

    case SET_TOUCH:
      return Object.assign(state, {
        touched: true,
        index: action.payload.index,
        member: action.payload.member,
        dropped: false,
        returnMember: false,
        showWaitDrop: action.payload.showWaitDrop || false,
      });
    case CLEAR_TOUCH:
      return initialState;
      break;
    case SET_DRAG_POSITION:
      return Object.assign(state, {
        x: action.payload.x,
        y: action.payload.y,
        displacement: action.payload.displacement,
        touched: false,
      });
    default:
      return state;
  }
};
