import React from "react";
import { Item } from "react-contexify";
import { copyTextToClipboard } from "../../util/clipboard";
import { ContextDonor } from "../types";
import { IMEntityType } from "../uri";

export default [
    {
        types: [IMEntityType.message, IMEntityType.item, IMEntityType.chat, IMEntityType.contact],
        render: ({ uri }) => (
            <>
                <Item onClick={() => {
                    switch (uri.type) {
                        case IMEntityType.item:
                            console.log(uri.item);
                            break;
                        case IMEntityType.message:
                            console.log(uri.message);
                            break;
                        case IMEntityType.chat:
                            console.log(uri.chat);
                            break;
                        case IMEntityType.contact:
                            console.log(uri.contact);
                            break;
                    }
                }}>
                    console.log
                </Item>
                <Item onClick={() => {
                    copyTextToClipboard(uri.id);
                }}>
                    Copy ID
                </Item>
                <Item disabled={true}>
                    Type: {uri.type}
                </Item>
            </>
        )
    }
] as ContextDonor[];