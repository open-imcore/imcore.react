import React, { useState } from "react";
import { apiClient, reconnect } from "../../../app/connection";
import { useBusyController } from "../../../hooks/useBusyController";
import { usePersistent } from "../../../util/use-persistent";
import DebugDetails from "../presentation/DebugDetails";

export default function Security() {
    const [ securityToken, setSecurityToken ] = usePersistent<string | null>("imcore-token", null);

    const [ currentPSK, setCurrentPSK ] = useState("");
    const [ newPSK, setNewPSK ] = useState("");

    const [ loginPSK, setLoginPSK ] = useState("");

    const reset = async (token: string | null) => {
        setSecurityToken(token);

        setLoginPSK("");
        setNewPSK("");
        setCurrentPSK("");

        await reconnect();
    };

    const [ cannotClearPSK, clearPSK ] = useBusyController(() => reset(null));

    const [ cannotLogIn, login ] = useBusyController(async () => {
        const token = await apiClient.security.token(loginPSK, true);

        await reset(token);
    });

    const [ cannotChangePSK, changePSK ] = useBusyController(async () => {
        const token = await apiClient.security.changePSK({
            oldPSK: currentPSK,
            newPSK
        }, true);

        await reset(token);
    });

    return (
        <>
            <details>
                <summary>PSK</summary>

                <DebugDetails details={[
                    ["Token", !securityToken ? "None" : "Set"]
                ]} />

                <button className="detail-row detail-btn" disabled={cannotClearPSK} onClick={clearPSK}>Clear PSK</button>

                <details>
                    <summary>Login</summary>

                    <label className="detail-row detail-input">
                        <span className="detail-label">PSK</span>
                        <input type="password" disabled={cannotLogIn} value={loginPSK} onChange={event => setLoginPSK(event.target.value)} />

                        <button className="detail-row detail-btn" disabled={cannotLogIn} onClick={login}>Login</button>
                    </label>
                </details>
                <details>
                    <summary>Change PSK</summary>

                    <label className="detail-row detail-input">
                        <span className="detail-label">Current PSK</span>
                        <input type="password" disabled={cannotChangePSK} value={currentPSK} onChange={({ target: { value } }) => setCurrentPSK(value)} />
                    </label>

                    <label className="detail-row detail-input">
                        <span className="detail-label">New PSK</span>
                        <input type="password" disabled={cannotChangePSK} value={newPSK} onChange={({ target: { value } }) => setNewPSK(value)} />
                    </label>

                    <button className="detail-row detail-btn" disabled={cannotChangePSK} onClick={changePSK}>Change Password</button>
                </details>

            </details>
        </>
    );
}