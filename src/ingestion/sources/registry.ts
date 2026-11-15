/**
 * Registry of all data sources known to HEALium.
 *
 * This list is the place to look for "which sources exist and which are connected".
 * To add a source: create an adapter file in this folder and add it here.
 *
 * | Source                 | Status         | File                              |
 * | ---------------------- | -------------- | --------------------------------- |
 * | Simulated demo data    | connected      | simulated-source.ts               |
 * | Wearable biosensors    | not connected  | wearable-biosensor-source.ts      |
 * | On-board lab analysers | not connected  | lab-analyzer-source.ts            |
 * | Radiation dosimeters   | not connected  | radiation-dosimeter-source.ts     |
 * | Habitat environment    | not connected  | habitat-environment-source.ts     |
 * | Crew self-reports      | not connected  | crew-self-report-source.ts        |
 * | Ground medical uplink  | not connected  | ground-medical-uplink-source.ts   |
 * | File import (CSV/JSON) | not connected* | file-import-source.ts             |
 *
 * * parser implemented; connected as soon as a file is passed to `createFileImportSource`.
 */

import type { DataSourceAdapter } from '../core/types'
import { crewSelfReportSource } from './crew-self-report-source'
import { createFileImportSource } from './file-import-source'
import { groundMedicalUplinkSource } from './ground-medical-uplink-source'
import { habitatEnvironmentSource } from './habitat-environment-source'
import { labAnalyzerSource } from './lab-analyzer-source'
import { radiationDosimeterSource } from './radiation-dosimeter-source'
import { createSimulatedSource } from './simulated-source'
import { wearableBiosensorSource } from './wearable-biosensor-source'

/** Creates one adapter instance per known source. */
export function createDefaultSources(now?: () => Date): DataSourceAdapter[] {
  return [
    createSimulatedSource(now),
    wearableBiosensorSource,
    labAnalyzerSource,
    radiationDosimeterSource,
    habitatEnvironmentSource,
    crewSelfReportSource,
    groundMedicalUplinkSource,
    createFileImportSource(),
  ]
}
