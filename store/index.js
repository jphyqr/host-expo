import { createStore, compose, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { persistStore } from "redux-persist";
import thunk from "redux-thunk";
import reducers from "../reducers";
import thunkMiddleware from "redux-thunk";

export default function configureStore() {
  const middlewares = [thunkMiddleware];
  const composedEnhancer = composeWithDevTools(applyMiddleware(...middlewares));
  const store = createStore(reducers, {}, composedEnhancer);
  const persistor = persistStore(store);

  return { store, persistor };
}
