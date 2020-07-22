import {
  SET_GAME,
  SET_GAME_S,
  UPDATE_GAME_S,
  CREATE_GAME,
  DELETE_GAME,
  SET_GAME_TRANSACTIONS,
  CREATE_GAME_TRANSACTION,
} from "../constants/reducerConstants";

export const gameReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_GAME:
      return action.payload;
    default:
      return state;
  }
};

export const gameTransactionsReducer = (state = [], action) => {
  switch (action.type) {
    case SET_GAME_TRANSACTIONS:
      return action.payload;

    case CREATE_GAME_TRANSACTION: {
      return [...state, Object.assign({}, action.payload)];
    }
    default:
      return state;
  }
};

export const gamesReducer = (state = [], action) => {
  switch (action.type) {
    case SET_GAME_S:
      return action.payload;
      break;
    case UPDATE_GAME_S:
      {
        return [
          ...state.filter((game) => game.id !== action.payload.id),
          Object.assign({}, action.payload),
        ];
        // }
      }

      break;
    case CREATE_GAME:
      {
        return [...state, Object.assign({}, action.payload)];
      }
      break;
    case DELETE_GAME: {
      return [...state.filter((game) => game.id !== action.payload.id)];
    }
    default:
      return state;
  }
};
