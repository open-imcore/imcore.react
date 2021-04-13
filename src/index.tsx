import React from "react";

if (process.env.REACT_APP_WDYR === "I_WANTED_TO") {
  const whyDidYouRender = require("@welldone-software/why-did-you-render");
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}

import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { visibilityChanged } from "./app/reducers/presence";
import { store } from "./app/store";
import { CurrentChatProvider } from "./components/transcript/ChatTranscriptFoundation";
import { ContextMenuContextProvider } from "./context-menu";
import { TapbackProvider } from "./contexts/TapbackContext";
import "./index.css";
import "./util/debug";

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <CurrentChatProvider>
        <ContextMenuContextProvider>
          <TapbackProvider>
            <App />
          </TapbackProvider>
        </ContextMenuContextProvider>
      </CurrentChatProvider>
    </Router>
  </Provider>,
  document.getElementById("root")
);

document.addEventListener("visibilitychange", () => store.dispatch(visibilityChanged()));