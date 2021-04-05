import React, {useRef} from "react";
import {getPersistentValue, usePersistent} from "../../../util/use-persistent";
import DebugDetails from "../presentation/DebugDetails";
import { updatePassword } from "../../../app/connection";

export default function Security() {
    const getSecurityToken = () => getPersistentValue("imcore-token", undefined).value;

    const currentPSK = useRef<HTMLInputElement>(null);
    const newPSK = useRef<HTMLInputElement>(null);

    return (
        <React.Fragment>
            <details>
                <summary>Security</summary>

                <DebugDetails details={[
                    ["Token", getSecurityToken() === "" ? "None" : getSecurityToken()]
                ]} />

                <label className="detail-row detail-input" hidden={getSecurityToken() === ""}>
                    <span className="detail-label">Current Password</span>
                    <input type="text" placeholder="" ref={currentPSK} />
                </label>

                <label className="detail-row detail-input">
                    <span className="detail-label">New Password</span>
                    <input type="text" placeholder="" ref={newPSK} />
                </label>

                <button className="detail-row detail-btn" onClick={() => {
                    if (currentPSK == null || newPSK == null){
                        return;
                    }
                    updatePassword(currentPSK.current!.value, newPSK.current!.value).then(() => {
                        currentPSK.current!.value = "";
                        newPSK.current!.value = "";
                    });
                }}>Change Password</button>
            </details>
        </React.Fragment>
    );
}