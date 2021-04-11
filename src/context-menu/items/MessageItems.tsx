import React, { useContext } from "react";
import { Item } from "react-contexify";
import { TapbackContext } from "../../contexts/TapbackContext";
import { ContextDonor } from "../types";
import { IMEntityType } from "../uri";

export default [
    {
        types: [IMEntityType.item],
        render: function TapbackItem({ uri }) {
            const { setTapbackItemID } = useContext(TapbackContext);

            return (
                <Item onClick={() => {
                    setTapbackItemID(uri.id);
                }}>
                    Tapback
                </Item>
            );
        }
    }
] as ContextDonor[];