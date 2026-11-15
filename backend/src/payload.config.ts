/**
 * Payload CMS configuration: the data model of the HEALium backend.
 *
 * Registers all collections (see `collections/`) and the admin panel. Database, file storage
 * and authentication secrets are provided by `buildFigmaConfig`, i.e. by the managed
 * Figma Make runtime the backend was provisioned on. To self-host, replace it with Payload's
 * `buildConfig` plus a database adapter (see backend/README.md).
 */

import path from 'path'
import { buildFigmaConfig } from '@payloadcms/figma'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { en as adminLanguage } from '@payloadcms/translations/languages/en'
import { fileURLToPath } from 'url'
import { Admins } from './collections/Admins'
import { Media } from './collections/Media'
import { Folders } from './collections/Folders'
import { Tags } from './collections/Tags'
import { EmergencySnapshots } from './collections/EmergencySnapshots'
import { DailyHealthCheckins } from './collections/DailyHealthCheckins'
import { Journals } from './collections/Journals'
import { ReminderCompletions } from './collections/ReminderCompletions'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildFigmaConfig({
  admin: {
    user: Admins.slug,
    constrainWidth: true,
    dashboard: {
      widgets: [],
      defaultLayout: [
        { widgetSlug: 'activity', width: 'full' },
        { widgetSlug: 'collections', width: 'full' },
      ],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    fallbackLanguage: 'en',
    supportedLanguages: { en: adminLanguage },
  },
  collections: [
    Admins,
    Media,
    Folders,
    Tags,
    EmergencySnapshots,
    Users,
    DailyHealthCheckins,
    Journals,
    ReminderCompletions,
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  localization: {
    locales: [{ code: 'en', label: 'English' }],
    fallback: true,
    defaultLocale: 'en',
  },
  plugins: [mcpPlugin({})],
  figma: {},
})
