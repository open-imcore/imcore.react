import { ChatRepresentation } from "imcore-ajax-core";
import { baseKeymap, splitBlock } from "prosemirror-commands";
import { keymap } from "prosemirror-keymap";
import { EditorState, Plugin, Transaction } from "prosemirror-state";
import "prosemirror-view/style/prosemirror.css";
import React, { useLayoutEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Handle, ProseMirror, useProseMirror } from "use-prosemirror";
import { apiClient } from "../../../app/connection";
import { selectShowingDevtools, setShowDevtools } from "../../../app/reducers/debug";
import { selectVisibilityState } from "../../../app/reducers/presence";
import { store } from "../../../app/store";
import "../../../styles/transcript/Composition.scss";
import { useCurrentChat } from "../ChatTranscriptFoundation";
import { setEditorView } from "./MCUtils";
import { makeDragAndDropPlugin } from "./plugins/DragAndDrop";
import { makePlaceholderPlugin } from "./plugins/PlaceholderPlugin";
import { IMProseSchema } from "./schema";
import sendMessage, { documentIsEmpty } from "./send-message";

let currentChat: ChatRepresentation | null = null;

const IMTypingLedger: Map<string, boolean> = new Map();

async function fireSendMessage(state: EditorState, dispatch?: ((tr: Transaction<any>) => void) | undefined): Promise<EditorState> {
    if (!currentChat) return state;

    const chat = currentChat;
    
    await sendMessage(state.doc, chat);

    IMTypingLedger.set(chat.id, false);

    const transaction = state.tr.delete(0, state.doc.content.size);

    if (dispatch) dispatch(transaction);
    else state = state.apply(transaction);

    return state;
}

/**
 * Main composition view for chat views
 */
export default function Composition() {
    currentChat = useCurrentChat();

    const placeholderPlugin = makePlaceholderPlugin("iMessage");
    const dragAndDropPlugin = makeDragAndDropPlugin(IMProseSchema);
    const editorView = useRef(null as Handle | null);
    const isVisible = useSelector(selectVisibilityState);

    const showingDevtools = useSelector(selectShowingDevtools);

    useLayoutEffect(() => {
        // synchronize with MCUtils
        setEditorView(editorView.current);
    }, [editorView]);

    const [canSend, setCanSend] = useState(false);

    const [state, setState] = useProseMirror({
        schema: IMProseSchema,
        plugins: [
            placeholderPlugin,
            dragAndDropPlugin,
            new Plugin({
                state: {
                    apply(_, __, ___, newState) {
                        const isEmpty = documentIsEmpty(newState.doc);

                        setCanSend(!isEmpty);

                        if (!isVisible) return;
                        if (!currentChat) return;

                        const chatID = currentChat.id;

                        if (isEmpty) {
                            if (IMTypingLedger.get(chatID)) {
                                apiClient.chats.setTyping(chatID, false).catch(() => {
                                    IMTypingLedger.set(chatID, true);
                                });

                                IMTypingLedger.set(chatID, false);
                            }

                            return;
                        }

                        if (IMTypingLedger.get(chatID)) return;

                        apiClient.chats.setTyping(chatID, true).catch(() => {
                            IMTypingLedger.set(chatID, false);
                        });
                        
                        IMTypingLedger.set(chatID, true);

                        return undefined;
                    },
                    init: () => undefined
                }
            }),
            keymap({
                "Shift-Enter": splitBlock,
                "Backspace": baseKeymap["Backspace"],
                "Enter": (state: EditorState, dispatch) => {
                    fireSendMessage(state, dispatch);
            
                    return false;
                }
            })
        ]
    });

    return (
        <div className="composition">
            <div className="devtools-trigger" onClick={() => store.dispatch(setShowDevtools(!showingDevtools))} />
            <ProseMirror className="composition-editor" state={state} onChange={setState} ref={editorView} />
            <div attr-can-send={canSend.toString()} className="send-composition" onClick={() => fireSendMessage(state).then(state => setState(state))} />
        </div>
    );
}