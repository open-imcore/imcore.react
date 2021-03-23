import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ContactRepresentation, HandleRepresentation } from "imcore-ajax-core";
import { RootState } from "../store";

interface ContactsState {
    byID: Record<string, ContactRepresentation>;
    strangers: Record<string, HandleRepresentation>;
}

const initialState: ContactsState = {
    byID: {},
    strangers: {}
}

export const contactsSlice = createSlice({
    name: 'contacts',
    initialState,
    reducers: {
        contactsChanged: (contacts, { payload: newContacts }: PayloadAction<ContactRepresentation[]>) => {
            Object.assign(contacts.byID, newContacts.reduce((acc, contact) => Object.assign(acc, {
                [contact.id]: contact
            }), {}))
        },
        contactChanged: (contacts, { payload: contact }: PayloadAction<ContactRepresentation>) => {
            contacts.byID[contact.id] = contact
        },
        contactDeleted: (contacts, { payload: contactID }: PayloadAction<string>) => {
            delete contacts.byID[contactID]
        },
        strangersReceived: (contacts, { payload: strangers }: PayloadAction<HandleRepresentation[]>) => {
            Object.assign(contacts.strangers, strangers.reduce((acc, stranger) => Object.assign(acc, {
                [stranger.id]: stranger
            }, {})))
        }
    }
})

export const { contactsChanged, contactChanged, contactDeleted, strangersReceived } = contactsSlice.actions;

export const selectContacts = (state: RootState) => state.contacts.byID
export const selectStrangers = (state: RootState) => state.contacts.strangers

export const selectHandleIDToContact = createSelector(
    [selectContacts],
    (contacts) => {
        return Object.values(contacts).reduce((acc, contact) => {
            for (const handle of contact.handles) {
                acc[handle.id] = contact;
            }

            return acc
        }, {} as Record<string, ContactRepresentation>)
    }
)

export default contactsSlice.reducer