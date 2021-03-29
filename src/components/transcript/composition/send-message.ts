import { ChatRepresentation, MessagePartOptions } from "imcore-ajax-core";
import { Node as ProsemirrorNode } from "prosemirror-model";
import { apiClient } from "../../../app/connection";
import { flatDescendants, nodeOnlyContainsText } from "./MCUtils";
import { uploadFileWithID } from "./plugins/DragAndDrop";

export function documentIsEmpty(doc: ProsemirrorNode): boolean {
    const descendants = flatDescendants(doc);

    for (const node of descendants) {
        if (node.isText && node.nodeSize > 0) return false;
        else if (node.isTextblock) {
            if (nodeOnlyContainsText(node) && node.textContent.length > 0) return false;
        }
        else if (node.type.name === "attachment") return false;
    }

    return true;
}

/**
 * Creates and sends a message using the contents of a ProsemirrorNode
 * @param doc node to transform
 * @param chat chat to send the message to
 */
export default async function sendMessage(doc: ProsemirrorNode, chat: ChatRepresentation): Promise<void> {
    if (documentIsEmpty(doc)) return;

    // Parts may resolve asynchronously, so they are stored with their pos so they can be sorted at the end
    const rawParts: Array<{
        pos: number;
        part: MessagePartOptions
    }> = [];

    // Helper to resolve a part
    const partWithPos = (pos: number) => rawParts.find(part => part.pos === pos);
    
    // Any asynchronous part resolutions
    const pending: Array<Promise<any>> = [];

    // Maps a node position to an associated chunk. If exists, the text will be appended to the associated chunk. (Think newlines)
    const textChunks: Record<number, number> = {};

    doc.descendants((node, pos, parent) => {
        if (node.isText) {
            rawParts.push({
                pos,
                part: {
                    type: "text",
                    details: node.textContent
                }
            });
            return false;
        }
        else if (node.isTextblock) {
            if (nodeOnlyContainsText(node)) {
                const { node: nextNode } = parent.childAfter(pos);
                const nextPos = pos + (nextNode?.nodeSize || 0);

                if (nextNode && nodeOnlyContainsText(nextNode)) {
                    if (typeof textChunks[pos] === "number") {
                        // map next node to the associated node
                        textChunks[nextPos] = textChunks[pos];
                    } else {
                        // map next node to self
                        textChunks[nextPos] = pos;
                    }
                }

                // partPos is either associated or self
                const partPos = typeof textChunks[pos] === "number" ? textChunks[pos] : pos;

                const associatedPart = partWithPos(partPos);

                if (associatedPart) associatedPart.part.details += `\n${node.textContent}`;
                else rawParts.push({
                    pos,
                    part: {
                        type: "text",
                        details: node.textContent
                    }
                });

                return false;
            }
        }
        else if (node.type.name === "attachment") {
            const attachmentID = node.attrs.attachmentID;
            if (!attachmentID) return;
            
            pending.push((async () => {
                // upload the attachment, then store the id
                const { id } = await uploadFileWithID(attachmentID);
                rawParts.push({
                    pos,
                    part: {
                        type: "attachment",
                        details: id
                    }
                });
            })());

            return false;
        }
    });

    await Promise.all(pending);

    // sort parts by their position, then flatten them to just part
    const compiled = rawParts.sort((p1, p2) => p1.pos - p2.pos).map(({ part }) => part);

    await apiClient.chats.sendMessage(chat.id, {
        parts: compiled
    });
}