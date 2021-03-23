import { AttachmentRepresentation } from "imcore-ajax-core";
import { Schema, DOMOutputSpec } from "prosemirror-model";
import { Plugin } from "prosemirror-state";
import { v4 as makeUUID } from "uuid";
import { apiClient } from "../../../../app/connection";
import { getFileImage, replaceDOMIDPRNode } from "../MCUtils";

export const IMFileCache: Map<string, File> = new Map();
const IMImageBase64Cache: Map<string, string> = new Map();
const IMFileUploadCache: Map<string, AttachmentRepresentation> = new Map();

export async function uploadFileWithID(id: string): Promise<AttachmentRepresentation> {
    if (IMFileUploadCache.has(id)) return IMFileUploadCache.get(id)!
    else {
        const file = IMFileCache.get(id);
        if (!file) throw new Error("Attempt to upload an unregistered transfer");
        const attachment = await apiClient.attachments.create(file, {
            mime: file.type,
            filename: file.name
        });
        IMFileUploadCache.set(id, attachment);
        return attachment;
    }
}

export function elementForFileWithID(id: string): DOMOutputSpec {
    const file = IMFileCache.get(id);

    if (!file) return ["p"];

    const [ type ] = file.type.split("/");

    const isImage = type === "image";
    const isVideo = type === "video";

    const baseProps = {
        "attachment-id": id,
        id,
        class: "im-attachment",
        "attachment-type": type,
        "attachment-resolved": ((isImage || isVideo) ? IMImageBase64Cache.has(id) : true).toString(),
        name: file.name
    }

    switch (type) {
        case "image":
        case "video":
            if (IMImageBase64Cache.has(id)) {
                const src = IMImageBase64Cache.get(id)!;

                return ["picture", baseProps, ["img", { src }]]
            } else console.log("FUCKING")
    }

    return ["div", baseProps];
}

export function makeDragAndDropPlugin(schema: Schema) {
    return new Plugin({
        props: {
            handleDOMEvents: {
                drop(view, event) {
                    const files = event.dataTransfer?.files as unknown as File[] | null;
                    const selection = view.state.tr.selection;

                    console.log("im alive")

                    if (!files || files.length === 0) return false;

                    event.preventDefault();

                    for (const file of files) {
                        const id = makeUUID();
                        IMFileCache.set(id, file);

                        const node = view.state.tr.insert(selection.$from.pos, schema.nodes.attachment.create({
                            attachmentID: id
                        }));
                        
                        if (file.type.startsWith("image") || file.type.startsWith("video")) {
                            getFileImage(file).then((result: string | null) => {
                                IMImageBase64Cache.set(id, result as string);

                                replaceDOMIDPRNode(id, schema.nodes.attachment.create({
                                    attachmentID: id,
                                    resolved: true
                                }), view);
                            });
                        }

                        view.dispatch(node.scrollIntoView())
                    }

                    return false;
                }
            }
        }
    })
}