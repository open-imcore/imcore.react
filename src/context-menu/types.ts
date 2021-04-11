import { IMEntityType, IMURI } from "./uri";

export interface ContextRenderer {
    (props: { uri: IMURI }): JSX.Element;
}

export interface ContextDonor {
    types: IMEntityType[];
    render: ContextRenderer;
}