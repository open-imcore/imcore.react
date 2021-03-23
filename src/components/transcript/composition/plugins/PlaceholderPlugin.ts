import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { Node as ProsemirrorNode } from "prosemirror-model";

/**
 * Presents a placeholder in ProseMirror when it is empty
 * @param service service string to display. currently unused
 * @returns ProseMirror plugin
 */
export function makePlaceholderPlugin(service: string): Plugin {
    return new Plugin({
        props: {
            decorations: state => {
                const decorations: Decoration[] = []

                const decorate = (node: ProsemirrorNode, pos: number) => {
                    if (node.type.isBlock && node.childCount === 0) {
                        decorations.push(
                            Decoration.node(pos, pos + node.nodeSize, {
                                class: 'empty-node',
                                service: "iMessage"
                            })
                        )
                    }
                }

                state.doc.descendants(decorate)

                return DecorationSet.create(state.doc, decorations)
            },
        },
    })
}