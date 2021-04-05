import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import "./App.scss";
import { apiClient, socketClient } from "./app/connection";
import { selectBootstrapState } from "./app/reducers/connection";
import { selectIsPrivacyMode, selectShowingDevtools } from "./app/reducers/debug";
import ChatBar from "./components/bar/ChatBar";
import TranscriptBar from "./components/bar/TranscriptBar";
import ChatSidebar from "./components/ChatSidebar";
import DevtoolsRoot from "./components/devtools/DevtoolsRoot";
import ChatTranscript from "./components/transcript/ChatTranscript";
import { CurrentMessagesProvider, useCurrentChatID } from "./components/transcript/ChatTranscriptFoundation";
import { ChatSearchProvider } from "./contexts/ChatSearchContext";

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
  const currentChatID = useCurrentChatID();

  useMemo(() => {
    socketClient.connect(currentChatID ? { preload: currentChatID } : undefined);
  }, []);

  const didBootstrap = useSelector(selectBootstrapState);

  return (
      <div className="app-root" attr-showing-devtools={showingDevtools.toString()} attr-privacy-mode={isPrivacyMode.toString()}>
          <ChatSearchProvider>
            <div className="app-bar">
              <ChatBar />
              <TranscriptBar />
            </div>
            <ChatSidebar />
            {
              didBootstrap ? (
                <CurrentMessagesProvider>
                  <ChatTranscript />
                </CurrentMessagesProvider>
              ) : (
                <ChatTranscript />
              )
            }
            {
              showingDevtools ? (
                <DevtoolsRoot />
              ) : null
            }
          </ChatSearchProvider>
      </div>
  );
}

export default App;
