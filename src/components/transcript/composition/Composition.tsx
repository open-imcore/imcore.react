import "../../../styles/transcript/Composition.scss";
import "prosemirror-view/style/prosemirror.css";

import React, { useContext, useLayoutEffect, useRef } from "react";

import { schema } from "prosemirror-schema-basic";
import { useProseMirror, ProseMirror, Handle } from "use-prosemirror";
import { EditorState } from "prosemirror-state";
import { Schema, NodeSpec } from "prosemirror-model";
import { keymap } from "prosemirror-keymap";
import { splitBlock, baseKeymap } from "prosemirror-commands";
import { apiClient } from "../../../app/connection";
import { ChatContext } from "../ChatTranscriptFoundation";
import { ChatRepresentation, MessagePartOptions } from "imcore-ajax-core";

import { makePlaceholderPlugin } from "./plugins/PlaceholderPlugin";
import { elementForFileWithID, makeDragAndDropPlugin, uploadFileWithID } from "./plugins/DragAndDrop";

import { nodeOnlyContainsText, setEditorView } from "./MCUtils";

let currentChat: ChatRepresentation | null = null;

const _specNodes = schema.spec.nodes as import("orderedmap")<NodeSpec>;

const IMProseSchema = new Schema({
    nodes: {
        text: _specNodes.get("text")!,
        paragraph: _specNodes.get("paragraph")!,
        doc: _specNodes.get("doc")!,
        attachment: {
            inline: true,
            attrs: {
                attachmentID: {},
                resolved: { default: false }
            },
            group: "inline",
            draggable: true,
            parseDOM: [
                {
                    tag: 'div[attachment-id]',
                    getAttrs: ((node: Element) => {
                        return {
                            attachmentID: node.getAttribute("attachment-id")
                        }
                    }) as unknown as (node: Node | string) => false | {}
                }
            ],
            toDOM: (({ attrs: { attachmentID } }) => elementForFileWithID(attachmentID))
        }
    }
})

export default function Composition() {
    currentChat = useContext(ChatContext).chat;

    const placeholderPlugin = makePlaceholderPlugin("iMessage");
    const dragAndDropPlugin = makeDragAndDropPlugin(IMProseSchema);
    const editorView = useRef(null as Handle | null);

    useLayoutEffect(() => {
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

                        const rawParts: Array<{
                            pos: number;
                            part: MessagePartOptions
                        }> = [];

                        const partWithPos = (pos: number) => rawParts.find(part => part.pos === pos);
                        
                        const pending: Array<Promise<any>> = [];

                        const textChunks: Record<number, number> = {};

                        state.doc.descendants((node, pos, parent) => {
                            if (node.isText) {
                                rawParts.push({
                                    pos,
                                    part: {
                                        type: "text",
                                        details: node.textContent
                                    }
                                })
                                return false
                            }
                            else if (node.isTextblock) {
                                if (nodeOnlyContainsText(node)) {
                                    const { node: nextNode } = parent.childAfter(pos);
                                    const nextPos = pos + (nextNode?.nodeSize || 0);

                                    if (nextNode && nodeOnlyContainsText(nextNode)) {
                                        if (typeof textChunks[pos] === "number") {
                                            textChunks[nextPos] = textChunks[pos];
                                        } else {
                                            textChunks[nextPos] = pos;
                                        }
                                    }

                                    console.log({ textChunks, pos, nextPos })

                                    const partPos = typeof textChunks[pos] === "number" ? textChunks[pos] : pos;

                                    const associatedPart = partWithPos(partPos);

                                    if (associatedPart) associatedPart.part.details += `\n${node.textContent}`;
                                    else rawParts.push({
                                        pos,
                                        part: {
                                            type: "text",
                                            details: node.textContent
                                        }
                                    })

                                    return false
                                }
                            }
                            else if (node.type.name === "attachment") {
                                const attachmentID = node.attrs.attachmentID;
                                if (!attachmentID) return;
                                
                                pending.push((async () => {
                                    const { id } = await uploadFileWithID(attachmentID);
                                    rawParts.push({
                                        pos,
                                        part: {
                                            type: "attachment",
                                            details: id
                                        }
                                    })
                                })());

                                return false
                            }
                        });

                        await Promise.all(pending);

                        const compiled = rawParts.sort((p1, p2) => p1.pos - p2.pos).map(({ part }) => part);

                        await apiClient.chats.sendMessage(currentChat.id, {
                            parts: compiled
                        });

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