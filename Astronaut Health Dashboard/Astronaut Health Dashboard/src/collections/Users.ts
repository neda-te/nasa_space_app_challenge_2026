import type { Access, CollectionBeforeValidateHook, CollectionConfig } from 'payload'

const isAdmin = (user: { collection?: string } | null | undefined) => user?.collection === 'admins'
const isAppUser = (user: { collection?: string } | null | undefined) => user?.collection === 'users'

const ownProfile: Access = ({ req }) => {
  const user = req.user
  if (isAdmin(user)) return true
  if (!user || !isAppUser(user)) return false
  return { id: { equals: user.id } }
}

const normalizeProfile: CollectionBeforeValidateHook = ({ data }) => ({
  ...data,
  astronautCode: 'MC-01',
})

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  access: {
    create: () => true,
    delete: ownProfile,
    read: ownProfile,
    update: ownProfile,
  },
  admin: {
    hidden: true,
    useAsTitle: 'name',
  },
  hooks: {
    beforeValidate: [normalizeProfile],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 100,
    },
    {
      name: 'astronautCode',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
      },
    },
  ],
  versions: false,
}
