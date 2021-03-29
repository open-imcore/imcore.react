import { NodeSpec, Schema } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { elementForFileWithID } from "./plugins/DragAndDrop";

const _specNodes = schema.spec.nodes as import("orderedmap")<NodeSpec>;

export const IMProseSchema = new Schema({
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
                    tag: "div[attachment-id]",
                    getAttrs: ((node: Element) => {
                        return {
                            attachmentID: node.getAttribute("attachment-id")
                        };
                    }) as unknown as (node: Node | string) => false | {}
                }
            ],
            toDOM: (({ attrs: { attachmentID } }) => elementForFileWithID(attachmentID))
        }
    }
});