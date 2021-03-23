import "../../../styles/transcript/Composition.scss";
import "prosemirror-view/style/prosemirror.css";

import React, { useContext, useLayoutEffect, useRef } from "react";

import { useProseMirror, ProseMirror, Handle } from "use-prosemirror";
import { EditorState } from "prosemirror-state";
import { keymap } from "prosemirror-keymap";
import { splitBlock, baseKeymap } from "prosemirror-commands";
import { apiClient } from "../../../app/connection";
import { ChatContext } from "../ChatTranscriptFoundation";
import { ChatRepresentation, MessagePartOptions } from "imcore-ajax-core";

import { makePlaceholderPlugin } from "./plugins/PlaceholderPlugin";
import { makeDragAndDropPlugin, uploadFileWithID } from "./plugins/DragAndDrop";

import { nodeOnlyContainsText, setEditorView } from "./MCUtils";

import { IMProseSchema } from "./schema";

import sendMessage from "./send-message";

let currentChat: ChatRepresentation | null = null;

/**
 * Main composition view for chat views
 */
export default function Composition() {
    currentChat = useContext(ChatContext).chat;

    const placeholderPlugin = makePlaceholderPlugin("iMessage");
    const dragAndDropPlugin = makeDragAndDropPlugin(IMProseSchema);
    const editorView = useRef(null as Handle | null);

    useLayoutEffect(() => {
        // synchronize with MCUtils
        setEditorView(editorView.current);
    }, [editorView]);

    const [state, setState] = useProseMirror({
        schema: IMProseSchema,
        plugins: [
            placeholderPlugin,
            dragAndDropPlugin,
            keymap({
                "Shift-Enter": splitBlock,
                "Backspace": baseKeymap["Backspace"],
                "Enter": (state: EditorState, dispatch) => {
                    (async () => {
                        if (!currentChat) return;
                        
                        await sendMessage(state.doc, currentChat);

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