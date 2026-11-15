/**
 * Operators of the Payload admin panel (`/admin`).
 *
 * Separate from the crew-member accounts in `Users`: an admin can manage records but is
 * never treated as a crew member by the dashboard. Admins cannot be created through the API.
 */

import type { Access, CollectionConfig } from 'payload'

const isPayloadAdmin: Access = ({ req }) => req.user?.collection === 'admins'

export const Admins: CollectionConfig = {
  slug: 'admins',
  access: {
    create: () => false,
    delete: isPayloadAdmin,
    read: isPayloadAdmin,
    update: isPayloadAdmin,
  },
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
  versions: false,
}
