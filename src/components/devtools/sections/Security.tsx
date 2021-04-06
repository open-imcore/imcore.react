import React, {useRef, useState} from "react";
import {getPersistentValue} from "../../../util/use-persistent";
import DebugDetails from "../presentation/DebugDetails";
import { updatePassword } from "../../../app/connection";

export default function Security() {
    const getSecurityToken = () => getPersistentValue("imcore-token", undefined).value;

    const currentPSK = useRef<HTMLInputElement>(null);
    const newPSK = useRef<HTMLInputElement>(null);

    const [hasToken, setHasToken] = useState(getSecurityToken() === "");

    return (
        <React.Fragment>
            <details>
                <summary>Security</summary>

                <DebugDetails details={[
                    ["Token", hasToken ? "None" : getSecurityToken()]
                ]} />

                <label className="detail-row detail-input">
                    <span className="detail-label">Current Password</span>
                    <input type="password" disabled={hasToken} placeholder=""  ref={currentPSK} />
                </label>

                <label className="detail-row detail-input">
                    <span className="detail-label">New Password</span>
                    <input type="password" placeholder="" ref={newPSK} />
                </label>

                <button className="detail-row detail-btn" onClick={() => {
                    updatePassword(currentPSK.current!.value, newPSK.current!.value).then(() => {
                        currentPSK.current!.value = "";
                        newPSK.current!.value = "";

                        setHasToken(true);
                    }).catch((err) => {
                        // Do error handling display
                    });
                }}>Change Password</button>
            </details>
        </React.Fragment>
    );
}