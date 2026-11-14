import type { Access, CollectionBeforeValidateHook, CollectionConfig } from 'payload'

const ownedRecords: Access = ({ req }) => {
  if (req.user?.collection === 'admins') return true
  if (req.user?.collection !== 'users') return false
  return { owner: { equals: req.user.id } }
}

const setOwner: CollectionBeforeValidateHook = ({ data, req }) => {
  if (req.user?.collection !== 'users') return data
  return {
    ...data,
    owner: req.user.id,
  }
}

export const Journals: CollectionConfig = {
  slug: 'journals',
  access: {
    create: ({ req }) => req.user?.collection === 'users',
    delete: ownedRecords,
    read: ownedRecords,
    update: ownedRecords,
  },
  admin: {
    group: 'Crew Health',
    useAsTitle: 'title',
    defaultColumns: ['title', 'entryDate', 'mood', 'sharedWithMedical'],
    description: 'Private astronaut journal entries. Access is owner-scoped.',
  },
  hooks: {
    beforeValidate: [setOwner],
  },
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 140,
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      maxLength: 10000,
    },
    {
      name: 'entryDate',
      type: 'date',
      required: true,
      index: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'mood',
      type: 'select',
      options: [
        { label: 'Calm', value: 'calm' },
        { label: 'Focused', value: 'focused' },
        { label: 'Tired', value: 'tired' },
        { label: 'Stressed', value: 'stressed' },
        { label: 'Positive', value: 'positive' },
      ],
    },
    {
      name: 'sharedWithMedical',
      type: 'checkbox',
      defaultValue: false,
      label: 'Explicitly shared with crew medical',
    },
  ],
  timestamps: true,
  versions: false,
}
