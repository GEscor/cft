import { combineReducers } from "redux";
import { formReducers } from "./formReducers";

export const rootReducer = combineReducers({
  form: formReducers
});
