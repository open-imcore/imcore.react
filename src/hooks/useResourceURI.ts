import { makeVersionedValue, VersionedValueWithStateAdapter } from "react-use-persistent";
import { apiClient } from "../app/connection";

export interface AttachmentResolverFn {
    (id: string): Promise<Blob>;
}

export const IMAttachmentResolver: AttachmentResolverFn = (id: string) => apiClient.attachments.load(id);
export const CNPictureResolver: AttachmentResolverFn = (id: string) => apiClient.fetchContactPhoto(id);

const VersionedValues: Record<string, VersionedValueWithStateAdapter<string | null>> = {};
const noopVersionedValue = makeVersionedValue(null);

export function useResourceURI(id: string | null, resovler: (id: string) => Promise<Blob | null>): string | null {
    if (!id) return noopVersionedValue.useAsState()[0];

    if (VersionedValues[id]) return VersionedValues[id].useAsState()[0];
    else {
        const versionedValue = VersionedValues[id] = makeVersionedValue<string | null>(null);

        resovler(id).then(blob => versionedValue.value = blob ? URL.createObjectURL(blob) : null);

        return versionedValue.useAsState()[0];
    }
}