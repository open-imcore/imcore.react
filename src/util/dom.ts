export function findAncestor(element: HTMLElement, cb: (parent: HTMLElement) => boolean): HTMLElement | null {
    if (cb(element)) return element;
    else if (element.parentElement) return findAncestor(element.parentElement, cb);
    else return null;
}