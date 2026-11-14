import type { Access, CollectionConfig, FieldAccess } from 'payload'

const isPayloadAdmin: Access = ({ req }) => req.user?.collection === 'admins'
const isPayloadAdminField: FieldAccess = ({ req }) => req.user?.collection === 'admins'

export const EmergencySnapshots: CollectionConfig = {
  slug: 'emergency-snapshots',
  access: {
    create: isPayloadAdmin,
    delete: isPayloadAdmin,
    read: () => true,
    update: isPayloadAdmin,
  },
  admin: {
    group: 'Mission Operations',
    useAsTitle: 'externalEventId',
    defaultColumns: ['externalEventId', 'astronautCode', 'eventType', 'status', 'recordedAt'],
    description:
      'Sanitized, simulated snapshots imported from the separate emergency handling system.',
  },
  fields: [
    {
      name: 'externalEventId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'External event ID',
    },
    {
      name: 'astronautCode',
      type: 'text',
      required: true,
      index: true,
      label: 'Astronaut code',
    },
    {
      name: 'recordedAt',
      type: 'date',
      required: true,
      index: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'eventType',
      type: 'select',
      required: true,
      options: [
        { label: 'Cardiovascular', value: 'cardiovascular' },
        { label: 'Neurological', value: 'neurological' },
        { label: 'Respiratory', value: 'respiratory' },
        { label: 'Musculoskeletal', value: 'musculoskeletal' },
        { label: 'Environmental exposure', value: 'environmental' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Resolved', value: 'resolved' },
        { label: 'Reviewed', value: 'reviewed' },
        { label: 'Monitoring', value: 'monitoring' },
      ],
    },
    {
      name: 'bodyRegion',
      type: 'select',
      required: true,
      options: [
        { label: 'Head', value: 'head' },
        { label: 'Chest', value: 'chest' },
        { label: 'Abdomen', value: 'abdomen' },
        { label: 'Left arm', value: 'left-arm' },
        { label: 'Right arm', value: 'right-arm' },
        { label: 'Left leg', value: 'left-leg' },
        { label: 'Right leg', value: 'right-leg' },
        { label: 'Whole body', value: 'whole-body' },
      ],
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      maxLength: 500,
    },
    {
      name: 'vitals',
      type: 'group',
      fields: [
        { name: 'heartRate', type: 'number', label: 'Heart rate (bpm)', min: 0, max: 250 },
        {
          name: 'oxygenSaturation',
          type: 'number',
          label: 'Oxygen saturation (%)',
          min: 0,
          max: 100,
        },
        {
          name: 'systolicPressure',
          type: 'number',
          label: 'Systolic pressure (mmHg)',
          min: 0,
          max: 300,
        },
        {
          name: 'diastolicPressure',
          type: 'number',
          label: 'Diastolic pressure (mmHg)',
          min: 0,
          max: 200,
        },
      ],
    },
    {
      name: 'sourceSystem',
      type: 'text',
      required: true,
      defaultValue: 'Emergency Handling System',
    },
    {
      name: 'simulated',
      type: 'checkbox',
      required: true,
      defaultValue: true,
      access: {
        create: isPayloadAdminField,
        update: isPayloadAdminField,
      },
      admin: {
        description: 'Only simulated records are exposed in the hackathon prototype.',
      },
    },
  ],
  timestamps: true,
  versions: false,
}
