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