import React from "react";
import { useSelector } from "react-redux";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "./App.scss";
import { apiClient } from "./app/connection";
import { selectIsPrivacyMode, selectShowingDevtools } from "./app/reducers/debug";
import ChatSidebar from "./components/ChatSidebar";
import DevtoolsRoot from "./components/devtools/DevtoolsRoot";
import ChatTranscript from "./components/transcript/ChatTranscript";

function insertStyles() {
  const elm = document.getElementById("generated-styles") || document.head.appendChild(document.createElement("style"));
  elm.id = "generated-resources";
  elm.textContent = `:root {
    ${[
      "bubble-tail", "bubble-notail", "bubble-stroke-tail", "bubble-stroke-notail", "send-button", "ack-bubble", "ack-double-bubble", "ack-middle", "ack-stack", "ack-heart", "ack-thumbs-up", "ack-thumbs-down", "ack-emphasize", "ack-question", "ack-haha-ar", "ack-haha-el", "ack-haha-en", "ack-haha-es", "ack-haha-he", "ack-haha-hi", "ack-haha-it", "ack-haha-ja", "ack-haha-ko", "ack-haha-th", "ack-haha-zh", "replay", "icloud", "video-play", "recorded-audio-template"
    ].map(id => `--${id}-url:url(${apiClient.resourceURL(id)});--${id}-flip-url:url(${apiClient.resourceURL(id)}?flip=1);`).join("\n")}
  }`;
}

insertStyles();

apiClient.getResourceMode().then(mode => document.body.classList.add(mode));

function App() {
  const showingDevtools = useSelector(selectShowingDevtools);
  const isPrivacyMode = useSelector(selectIsPrivacyMode);

  return (
    <Router>
      <div className="app-root" attr-showing-devtools={showingDevtools.toString()} attr-privacy-mode={isPrivacyMode.toString()}>
        <ChatSidebar />
        <Route path={"/chats/:chatID"}>
          <ChatTranscript />
          {
            showingDevtools ? (
              <DevtoolsRoot />
            ) : null
          }
        </Route>
      </div>
    </Router>
  );
}

export default App;
