import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { visibilityChanged } from "./app/reducers/presence";
import { store } from "./app/store";
import { CurrentChatProvider } from "./components/transcript/ChatTranscriptFoundation";
import "./index.css";

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <CurrentChatProvider>
        <App />
      </CurrentChatProvider>
    </Router>
  </Provider>,
  document.getElementById("root")
);

document.addEventListener("visibilitychange", () => store.dispatch(visibilityChanged()));