import type { Access, CollectionBeforeValidateHook, CollectionConfig } from 'payload'

const ownedRecords: Access = ({ req }) => {
  if (req.user?.collection === 'admins') return true
  if (req.user?.collection !== 'users') return false
  return { owner: { equals: req.user.id } }
}

const setServerFields: CollectionBeforeValidateHook = async ({ data, operation, req }) => {
  if (req.user?.collection !== 'users') return data

  if (operation === 'create' && data?.reminderKey) {
    const existing = await req.payload.find({
      collection: 'reminder-completions',
      overrideAccess: false,
      user: req.user,
      limit: 1,
      where: {
        and: [{ owner: { equals: req.user.id } }, { reminderKey: { equals: data.reminderKey } }],
      },
    })
    if (existing.docs.length > 0) {
      throw new Error('A completion record already exists for this reminder.')
    }
  }

  return {
    ...data,
    owner: req.user.id,
    completedAt: data?.completed ? new Date().toISOString() : null,
  }
}

export const ReminderCompletions: CollectionConfig = {
  slug: 'reminder-completions',
  access: {
    create: ({ req }) => req.user?.collection === 'users',
    delete: ownedRecords,
    read: ownedRecords,
    update: ownedRecords,
  },
  admin: {
    group: 'Crew Health',
    useAsTitle: 'reminderKey',
    defaultColumns: ['reminderKey', 'completed', 'completedAt'],
    description: 'Owner-scoped completion state for fixed mission health reminders.',
  },
  hooks: {
    beforeValidate: [setServerFields],
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
      name: 'reminderKey',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Daily health assessment', value: 'daily-health' },
        { label: 'Blood test', value: 'blood-test' },
        { label: 'Urine test', value: 'urine-test' },
        { label: 'Ultrasound assessment', value: 'ultrasound' },
      ],
    },
    {
      name: 'completed',
      type: 'checkbox',
      required: true,
      defaultValue: false,
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
  ],
  timestamps: true,
  versions: false,
}
