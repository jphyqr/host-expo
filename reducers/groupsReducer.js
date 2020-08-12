import {
  SET_MEMBER_OF_GROUP,
  SET_GROUP,
  ADD_MEMBER_TO_GROUP,
  CREATE_HOST_GROUP,
  DELETE_HOST_GROUP,
  SET_HOST_GROUPS,
  CREATE_INVITE_GROUP,
  DELETE_INVITE_GROUP,
  SET_INVITE_GROUPS,
  CREATE_MEMBER_GROUP,
  DELETE_MEMBER_GROUP,
  SET_MEMBER_GROUPS,
  CREATE_AREA_GROUP,
  DELETE_AREA_GROUP,
  SET_AREA_GROUPS,
  REQUEST_TO_JOIN_GROUP,
  ACCEPT_MEMBER_IN_GROUP,
} from "../constants/reducerConstants";

export const memberOfGroupReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_MEMBER_OF_GROUP:
      return action.payload;
    default:
      return state;
  }
};

export const groupReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_GROUP:
      return action.payload;
      break;
    case ADD_MEMBER_TO_GROUP: {
      let uGroup = state;
      let uMembers = uGroup.members;
      uMembers[`${action.payload.id}`] = action.payload;
      uGroup.members = uMembers;

      return { ...uGroup };
      break;
    }

    case REQUEST_TO_JOIN_GROUP: {
      let uGroup = state;
      let uPending = uGroup.pending || {};
      uPending[`${action.payload.userUid}`] = action.payload;
      uGroup.pending = uPending;

      return { ...uGroup };
      break;
    }

    case ACCEPT_MEMBER_IN_GROUP: {
      let uGroup = state;
      let uPending = uGroup.pending || {};
      let uMember = uPending[`${action.payload.userUid}`];
      let uMembers = uGroup.members || {};
      uMembers[`${action.payload.userUid}`] = uMember;
      delete uPending[`${action.payload.userUid}`];

      uGroup.pending = uPending;
      uGroup.members = uMembers;

      return { ...uGroup };
      break;
    }

    default:
      return state;
  }
};

export const hostGroupsReducer = (state = [], action) => {
  switch (action.type) {
    case SET_HOST_GROUPS:
      return action.payload;
      break;
    case CREATE_HOST_GROUP:
      {
        console.log("CREATE MEMBER GROUP");
        return [...state, Object.assign({}, action.payload)];
      }
      break;
    case DELETE_HOST_GROUP: {
      console.log("DELETE GROUP", action.payload);
      return [...state.filter((group) => group.id !== action.payload.id)];
    }

    default:
      return state;
  }
};

export const areaGroupsReducer = (state = [], action) => {
  switch (action.type) {
    case SET_AREA_GROUPS:
      return action.payload;
      break;
    case CREATE_AREA_GROUP:
      {
        return [...state, Object.assign({}, action.payload)];
      }
      break;
    case DELETE_AREA_GROUP: {
      console.log("DELETE GROUP", action.payload);
      return [...state.filter((group) => group.id !== action.payload.id)];
    }

    default:
      return state;
  }
};

export const inviteGroupsReducer = (state = [], action) => {
  switch (action.type) {
    case SET_INVITE_GROUPS:
      return action.payload;
      break;
    case CREATE_INVITE_GROUP:
      {
        return [...state, Object.assign({}, action.payload)];
      }
      break;
    case DELETE_INVITE_GROUP: {
      console.log("DELETE GROUP", action.payload);
      return [...state.filter((group) => group.id !== action.payload.id)];
    }

    default:
      return state;
  }
};

export const memberGroupsReducer = (state = [], action) => {
  switch (action.type) {
    case SET_MEMBER_GROUPS:
      return action.payload;
      break;
    case CREATE_MEMBER_GROUP:
      {
        return [...state, Object.assign({}, action.payload)];
      }
      break;
    case DELETE_MEMBER_GROUP: {
      console.log("DELETE GROUP", action.payload);
      return [...state.filter((group) => group.id !== action.payload.id)];
    }

    default:
      return state;
  }
};
