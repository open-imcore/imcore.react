import React from "react";
import { useSelector } from "react-redux";
import { selectUseInvertedScrolling, setInvertedScrolling } from "../../../app/reducers/debug";
import { store } from "../../../app/store";
import DebugBoolean from "../presentation/DebugBoolean";

export default function DebugSettings() {
    const isScrollingInverted = useSelector(selectUseInvertedScrolling);

    return (
        <React.Fragment>
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
                    <input type="text" placeholder="localhost:8090" />
                </label>
            </details>
        </React.Fragment>
    );
}