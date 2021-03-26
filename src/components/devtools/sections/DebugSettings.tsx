import React from "react";
import { useSelector } from "react-redux";
import { selectIsPrivacyMode, setPrivacyMode } from "../../../app/reducers/debug";
import { store } from "../../../app/store";

export default function DebugSettings() {
    const isPrivacy = useSelector(selectIsPrivacyMode);

    return (
        <React.Fragment>
            <details>
                <summary>Debug Settings</summary>

                <label className="detail-row detail-checkbox">
                    <span className="detail-label">Privacy Mode</span>
                    <input type="checkbox" className="detail-info" checked={isPrivacy} onInput={e => store.dispatch(setPrivacyMode(!isPrivacy))} />
                </label>
            </details>
        </React.Fragment>
    )
}