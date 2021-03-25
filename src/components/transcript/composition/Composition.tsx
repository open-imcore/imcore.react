import "../../../styles/transcript/Composition.scss";
import "prosemirror-view/style/prosemirror.css";

import React, { useContext, useLayoutEffect, useRef } from "react";

import { useProseMirror, ProseMirror, Handle } from "use-prosemirror";
import { EditorState, Plugin } from "prosemirror-state";
import { keymap } from "prosemirror-keymap";
import { splitBlock, baseKeymap } from "prosemirror-commands";
import { apiClient } from "../../../app/connection";
import { ChatContext } from "../ChatTranscriptFoundation";
import { ChatRepresentation, MessagePartOptions } from "imcore-ajax-core";

import { makePlaceholderPlugin } from "./plugins/PlaceholderPlugin";
import { makeDragAndDropPlugin, uploadFileWithID } from "./plugins/DragAndDrop";

import { nodeOnlyContainsText, setEditorView } from "./MCUtils";

import { IMProseSchema } from "./schema";

import sendMessage, { documentIsEmpty } from "./send-message";
import { useSelector } from "react-redux";
import { selectVisibilityState } from "../../../app/reducers/presence";

let currentChat: ChatRepresentation | null = null;

const IMTypingLedger: Map<string, boolean> = new Map();

/**
 * Main composition view for chat views
 */
export default function Composition() {
    currentChat = useContext(ChatContext).chat;

    const placeholderPlugin = makePlaceholderPlugin("iMessage");
    const dragAndDropPlugin = makeDragAndDropPlugin(IMProseSchema);
    const editorView = useRef(null as Handle | null);
    const isVisible = useSelector(selectVisibilityState);

    useLayoutEffect(() => {
        // synchronize with MCUtils
        setEditorView(editorView.current);
    }, [editorView]);

    const [state, setState] = useProseMirror({
        schema: IMProseSchema,
        plugins: [
            placeholderPlugin,
            dragAndDropPlugin,
            new Plugin({
                state: {
                    apply(_, __, ___, newState) {
                        if (!isVisible) return
                        if (!currentChat) return

                        const chatID = currentChat.id;

                        if (documentIsEmpty(newState.doc)) {
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

                        return undefined
                    },
                    init: () => undefined
                }
            }),
            keymap({
                "Shift-Enter": splitBlock,
                "Backspace": baseKeymap["Backspace"],
                "Enter": (state: EditorState, dispatch) => {
                    (async () => {
                        if (!currentChat) return;

                        const chat = currentChat;
                        
                        await sendMessage(state.doc, chat);

                        IMTypingLedger.set(chat.id, false);

                        if (dispatch) {
                            dispatch(state.tr.delete(0, state.doc.content.size));
                        }
                    })();
            
                    return false;
                }
            })
        ]
    });

    return (
        <div className="composition">
            <ProseMirror className="composition-editor" state={state} onChange={setState} ref={editorView} />
        </div>
    )
}