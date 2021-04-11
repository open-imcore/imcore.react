import React, { useContext, useEffect } from "react";
import { Menu } from "react-contexify";
import { CTX_ID } from "./const";
import { ContextMenuContext } from "./context";
import CoreItems from "./items/CoreItems";
import MessageItems from "./items/MessageItems";
import { ContextDonor, ContextRenderer } from "./types";
import { IMURI } from "./uri";


const donors: ContextDonor[] = [
    ...MessageItems,
    ...CoreItems
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