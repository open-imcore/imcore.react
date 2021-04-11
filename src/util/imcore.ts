import { AnyChatItemModel, ChatItemAcknowledgableRepresentation, ChatItemType } from "imcore-ajax-core";

export function splitPartIDIntoParts(id: string): [string, string] {
    const [ part, messageID ] = id.split(id.includes("/") ? "/" : ":");

    return [ part, messageID ];
}

export function itemIsAcknowledgable(type: AnyChatItemModel["type"], item: AnyChatItemModel["payload"]): item is ChatItemAcknowledgableRepresentation {
    switch (type) {
        case ChatItemType.text:
        case ChatItemType.plugin:
        case ChatItemType.attachment:
            return true;
        default:
            return false;
    }
}

export function chatItemIsAcknowledgable(item: AnyChatItemModel | null | undefined): boolean {
    if (!item) return false;
    else return itemIsAcknowledgable(item.type, item.payload);
}