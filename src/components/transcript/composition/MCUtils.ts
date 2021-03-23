import { EditorView } from "prosemirror-view";
import { Node as ProsemirrorNode } from "prosemirror-model";
import { Handle } from "use-prosemirror";
import { NodeSelection } from "prosemirror-state";

let editorViewHandle: Handle | null = null;

function editorView() {
    return editorViewHandle?.view?.dom;
}

export function setEditorView(newEditorView: Handle | null) {
    editorViewHandle = newEditorView;
}

export function updateEditorClass(className: string, enabled: boolean) {
    editorView()?.classList.toggle(className, enabled);
}

export function flatDescendants(node: ProsemirrorNode): ProsemirrorNode[] {
    const descendants: ProsemirrorNode[] = [];

    node.descendants(node => {
        descendants.push(node);
        return true;
    });

    return descendants;
}

export function everyDescendant(node: ProsemirrorNode, check: (node: ProsemirrorNode) => boolean): boolean {
    return flatDescendants(node).every(check);
}

export function nodeOnlyContainsText(node: ProsemirrorNode) {
    return everyDescendant(node, node => node.isText || node.isTextblock)
}

export function replaceDOMPRNode(domNode: Node, prNode: ProsemirrorNode, view: EditorView) {
    const prosePos = view.posAtDOM(domNode, 0);

    view.dispatch(
        view.state.tr.setSelection(NodeSelection.create(view.state.doc, prosePos))
                     .deleteSelection()
                     .insert(prosePos, prNode)
    );
}

export function replaceDOMIDPRNode(domID: string, prNode: ProsemirrorNode, view: EditorView) {
    replaceDOMPRNode(document.getElementById(domID)!, prNode, view);
}

export async function readFile(file: File): Promise<string | ArrayBuffer | null> {
    const reader = new FileReader();

    const pending = new Promise<string | ArrayBuffer | null>(resolve => reader.addEventListener("load", () => resolve(reader.result)));

    reader.readAsDataURL(file);

    return pending;
}

export async function getVideoCover(file: File): Promise<Blob | null> {
    return new Promise((resolve, reject) => {
        const player = document.createElement("video");
        player.setAttribute("src", URL.createObjectURL(file));
        player.load();
        player.addEventListener("error", ex => reject(ex.error));
        player.addEventListener("loadedmetadata", () => {
            setTimeout(() => {
                player.currentTime = 0.0;
            }, 50);
            player.addEventListener("seeked", () => {
                const canvas = document.createElement("canvas");
                canvas.width = player.videoWidth;
                canvas.height = player.videoHeight;

                const ctx = canvas.getContext("2d")!;
                ctx.drawImage(player, 0, 0, canvas.width, canvas.height);
                ctx.canvas.toBlob(blob => resolve(blob), "image/jpeg", 0.75);
            });
        });
    });
}

export async function getFileImage(file: File): Promise<string | null> {
    if (file.type.startsWith("image")) return Promise.resolve(URL.createObjectURL(file)) as Promise<string | null>;
    else if (file.type.startsWith("video")) return getVideoCover(file).then(cover => {
        if (cover) return URL.createObjectURL(cover);
        else return null;
    });
    else return Promise.resolve(null);
}