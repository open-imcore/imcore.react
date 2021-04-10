import React, { useContext, useEffect } from "react";
import { Item, Menu } from "react-contexify";
import { copyTextToClipboard } from "../util/clipboard";
import { CTX_ID } from "./const";
import { ContextMenuContext } from "./context";
import { IMEntityType, IMURI } from "./uri";

interface ContextRenderer {
    (props: { uri: IMURI }): JSX.Element;
}

interface ContextDonor {
    types: IMEntityType[];
    render: ContextRenderer;
}

const donors: ContextDonor[] = [
    {
        types: [IMEntityType.message, IMEntityType.item, IMEntityType.chat, IMEntityType.contact],
        render: ({ uri }) => (
            <Item onClick={() => {
                copyTextToClipboard(uri.id);
            }}>
                Copy ID
            </Item>
        )
    }
];

function componentsForURI(uri: IMURI): ContextRenderer[] {
    return donors.filter(donor => donor.types.includes(uri.type)).map(donor => donor.render);
}

export function ContextHost() {
    const { uri, close } = useContext(ContextMenuContext);

    const components = uri ? componentsForURI(uri) : [];

    useEffect(() => {
        if (uri && !components.length) {
            close();
        }
    }, [uri, close, components]);

    return (
        <Menu id={CTX_ID} animation={false}>
            {components.map((Component, index) => (
                <Component key={`${uri!.toString()}-${index}`} uri={uri!} />
            ))}
        </Menu>
    );
}