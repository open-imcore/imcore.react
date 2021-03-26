import React from "react";
import { useSelector } from "react-redux";
import { selectIsPrivacyMode, setPrivacyMode } from "../../../app/reducers/debug";
import { store } from "../../../app/store";
import DebugBoolean from "../presentation/DebugBoolean";

export default function DebugSettings() {
    const isPrivacy = useSelector(selectIsPrivacyMode);

    return (
        <React.Fragment>
            <details>
                <summary>Debug Settings</summary>

                <DebugBoolean name="Privacy Mode" value={isPrivacy} onInput={newIsPrivacy => store.dispatch(setPrivacyMode(newIsPrivacy))} />
            </details>
        </React.Fragment>
    )
}