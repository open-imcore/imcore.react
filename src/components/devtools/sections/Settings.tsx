import React from "react";
import GitInfo from "react-git-info/macro";
import { useSelector } from "react-redux";
import { usePersistent } from "react-use-persistent";
import { reconnect } from "../../../app/connection";
import { selectUseInvertedScrolling, setInvertedScrolling } from "../../../app/reducers/debug";
import { store } from "../../../app/store";
import { useBusyController } from "../../../hooks/useBusyController";
import DebugBoolean from "../presentation/DebugBoolean";

const shortHash = GitInfo().commit.shortHash;

export default function DebugSettings() {
    const isScrollingInverted = useSelector(selectUseInvertedScrolling);
    const [imCoreHost, setIMCoreHost] = usePersistent("imcore-host", "localhost");

    const [ isReconnecting, doReconnect ] = useBusyController(reconnect);

    return (
        <>
            <details>
                <summary>Settings</summary>

                <DebugBoolean name="Scrolling Fix" value={isScrollingInverted} onInput={e => store.dispatch(setInvertedScrolling(e))} />

                <button className="detail-row detail-btn" onClick={() => {
                    const initial = isScrollingInverted;
                    store.dispatch(setInvertedScrolling(!initial));
                    setTimeout(() => store.dispatch(setInvertedScrolling(initial)), 25);
                }}>Reset Scrolling</button>

                <label className="detail-row detail-input">
                    <span className="detail-label">IMCore Host</span>
                    <input type="text" placeholder="localhost:8090" value={imCoreHost} onChange={event => setIMCoreHost(event.target.value)} />
                </label>

                <button className="detail-row detail-btn" disabled={isReconnecting} onClick={() => doReconnect()}>Reconnect</button>

                <label className="detail-row">
                    <span className="detail-label">IMCore.React {shortHash}</span>
                </label>
            </details>
       </>
    );
}