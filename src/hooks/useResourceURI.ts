import { apiClient } from "../app/connection";
import { makeVanillaVersionedValue, VersionedValueWithStateAdapter } from "../util/use-persistent";

export interface AttachmentResolverFn {
    (id: string): Promise<Blob>;
}

export const IMAttachmentResolver: AttachmentResolverFn = (id: string) => apiClient.attachments.load(id);
export const CNPictureResolver: AttachmentResolverFn = (id: string) => apiClient.fetchContactPhoto(id);

const VersionedValues: Record<string, VersionedValueWithStateAdapter<string | null>> = {};
const noopVersionedValue = makeVanillaVersionedValue(null);

export function useResourceURI(id: string | null, resovler: (id: string) => Promise<Blob | null>): string | null {
    if (!id) return noopVersionedValue.useAsState();

    if (VersionedValues[id]) return VersionedValues[id].useAsState();
    else {
        const versionedValue = VersionedValues[id] = makeVanillaVersionedValue<string | null>(null);

        resovler(id).then(blob => versionedValue.value = blob ? URL.createObjectURL(blob) : null);

        return versionedValue.useAsState();
    }
}