import { AttachmentRepresentation } from "imcore-ajax-core";
import { DOMOutputSpec, Schema } from "prosemirror-model";
import { Plugin } from "prosemirror-state";
import { v4 as makeUUID } from "uuid";
import { apiClient } from "../../../../app/connection";
import { getFileImage, replaceDOMIDPRNode } from "../MCUtils";

export const IMFileCache: Map<string, File> = new Map();
const IMImageBase64Cache: Map<string, string> = new Map();
const IMFileUploadCache: Map<string, AttachmentRepresentation> = new Map();

/**
 * Uploads a file ID, returning an existing attachment if it was already uploaded
 * @param id ID to process
 * @returns promise of an AttachmentRepresentation
 */
export async function uploadFileWithID(id: string): Promise<AttachmentRepresentation> {
    if (IMFileUploadCache.has(id)) return IMFileUploadCache.get(id)!;
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

/**
 * Assembles a ProseMirror node for a File associated with the ID
 * @param id UUID of the file transfer
 * @returns ProseMirror node
 */
export function elementForFileWithID(id: string): DOMOutputSpec {
    const file = IMFileCache.get(id);

    // No file. Abort!
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
    };

    switch (type) {
        case "image":
        case "video":
            if (IMImageBase64Cache.has(id)) {
                // Thumbnail! Yay!
                const src = IMImageBase64Cache.get(id)!;

                return ["picture", baseProps, ["img", { src }]];
            } // otherwise, still processing.
    }

    return ["div", baseProps];
}

export function makeDragAndDropPlugin(schema: Schema): Plugin {
    return new Plugin({
        props: {
            handleDOMEvents: {
                drop(view, event) {
                    const files = event.dataTransfer?.files as unknown as File[] | null;
                    const selection = view.state.tr.selection;

                    // no files >:( we've been swindled
                    if (!files || files.length === 0) return false;

                    event.preventDefault();

                    for (const file of files) {
                        const id = makeUUID();

                        // store file so it can be uploaded if the message is sent
                        IMFileCache.set(id, file);

                        // insert node into prosemirror
                        const node = view.state.tr.insert(selection.$from.pos, schema.nodes.attachment.create({
                            attachmentID: id
                        }));
                        
                        if (file.type.startsWith("image") || file.type.startsWith("video")) {
                            // process thumbnail

                            getFileImage(file).then((result: string | null) => {
                                IMImageBase64Cache.set(id, result as string);

                                // replace the inserted prose node with the processed thumbnail
                                replaceDOMIDPRNode(id, schema.nodes.attachment.create({
                                    attachmentID: id,
                                    resolved: true
                                }), view);
                            });
                        }

                        view.dispatch(node.scrollIntoView());
                    }

                    return false;
                }
            }
        }
    });
}