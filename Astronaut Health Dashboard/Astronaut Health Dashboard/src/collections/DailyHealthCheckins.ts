import type { CollectionBeforeValidateHook, CollectionConfig, FieldAccess } from 'payload'

const isPayloadAdmin = ({ req }: { req: { user?: { collection?: string } | null } }) =>
  req.user?.collection === 'admins'

const adminFieldAccess: FieldAccess = ({ req }) => req.user?.collection === 'admins'

const readOwnCheckins = ({
  req,
}: {
  req: { user?: { collection?: string; id?: unknown } | null }
}) => {
  if (req.user?.collection === 'admins') return true
  if (req.user?.collection !== 'users') return false
  return { owner: { equals: req.user.id } }
}

const setServerOwnedFields: CollectionBeforeValidateHook = ({ data, req }) => {
  const sessionType = data?.sessionType === 'evening' ? 'evening' : 'morning'
  return {
    ...data,
    owner: req.user?.collection === 'users' ? req.user.id : data?.owner,
    astronautCode: 'MC-01',
    measuredSleepMinutes: sessionType === 'morning' ? 342 : null,
    researchBasis: 'Research-inspired prototype; not an official NASA questionnaire',
  }
}

export const DailyHealthCheckins: CollectionConfig = {
  slug: 'daily-health-checkins',
  access: {
    create: ({ req }) => req.user?.collection === 'users',
    delete: isPayloadAdmin,
    read: readOwnCheckins,
    update: isPayloadAdmin,
  },
  admin: {
    group: 'Crew Health',
    useAsTitle: 'astronautCode',
    defaultColumns: ['astronautCode', 'sessionType', 'privacyLevel', 'createdAt'],
    description:
      'Private self-reported check-ins inspired by spaceflight behavioral research. Not an official NASA questionnaire.',
  },
  hooks: {
    beforeValidate: [setServerOwnedFields],
  },
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'astronautCode',
      type: 'text',
      required: true,
      access: {
        create: adminFieldAccess,
        update: adminFieldAccess,
      },
    },
    {
      name: 'sessionType',
      type: 'select',
      required: true,
      options: [
        { label: 'Morning', value: 'morning' },
        { label: 'Evening', value: 'evening' },
      ],
    },
    {
      name: 'privacyLevel',
      type: 'select',
      required: true,
      defaultValue: 'private',
      options: [
        { label: 'Private health record', value: 'private' },
        { label: 'Share summary with crew medical', value: 'crew-medical' },
      ],
    },
    {
      name: 'measuredSleepMinutes',
      type: 'number',
      access: {
        create: adminFieldAccess,
        update: adminFieldAccess,
      },
      admin: {
        description: 'Server-owned measured sleep duration associated with the morning check-in.',
      },
    },
    {
      name: 'responses',
      type: 'group',
      fields: [
        { name: 'sleepQuality', type: 'number', min: 1, max: 5 },
        { name: 'physicalRestfulness', type: 'number', min: 1, max: 5 },
        { name: 'mentalAlertness', type: 'number', min: 1, max: 5 },
        { name: 'physicalDiscomfort', type: 'number', min: 1, max: 5 },
        { name: 'hasPhysicalDiscomfort', type: 'checkbox' },
        { name: 'physicalDiscomfortDescription', type: 'textarea', maxLength: 500 },
        { name: 'mentalExhaustion', type: 'number', min: 1, max: 5 },
        { name: 'physicalFatigue', type: 'number', min: 1, max: 5 },
        { name: 'stressLevel', type: 'number', min: 1, max: 5 },
        { name: 'workloadManageability', type: 'number', min: 1, max: 5 },
        { name: 'crewConnection', type: 'number', min: 1, max: 5 },
      ],
    },
    {
      name: 'researchBasis',
      type: 'text',
      required: true,
      access: {
        create: adminFieldAccess,
        update: adminFieldAccess,
      },
      admin: {
        readOnly: true,
      },
    },
  ],
  timestamps: true,
  versions: false,
}
