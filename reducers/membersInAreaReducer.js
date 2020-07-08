import {
  SET_MEMBERS_IN_AREA,
  FOLLOW_MEMBER,
  UNFOLLOW_MEMBER,
  ADD_MEMBER_TO_AREA,
} from "../constants/reducerConstants";

export const membersInAreaReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_MEMBERS_IN_AREA:
      return action.payload;
      break;
    case FOLLOW_MEMBER: {
      let uFollowing = [...state.following, Object.assign({}, action.payload)];
      let uMembers = state.members || [];

      return {
        following: uFollowing,
        members: uMembers,
      };
      break;
    }
    case UNFOLLOW_MEMBER:
      return {
        following: [
          ...state.following.filter(
            (following) => following.id !== action.payload.id
          ),
        ],
        members: [...state.members],
      };
      break;

    case ADD_MEMBER_TO_AREA:
      let uMembers = [...state.members, Object.assign({}, action.payload)];
      let uFollowing = state.following || [];

      return {
        following: uFollowing,
        members: uMembers,
      };

    default:
      return state;
  }
};
