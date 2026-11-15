# Data ingestion gateway

This module preserves the coworker’s source adapters and validation pipeline without replacing the current HEALium interface.

The running dashboard and emergency mode use `shared/telemetry.js` and the same `data/demo-telemetry.json` five-minute feed. The optional simulated ingestion adapter reads that exact fixture too (60 samples, seven metrics, five-second spacing), labels every reading simulated, and preserves skin-temperature semantics. It imports the entire fixture for pipeline validation; it does not drive or advance the UI clock. No sensor, database service, file-upload UI, or flight-surgeon uplink is connected.

`createGateway({ sink })` supplies the registry; `gateway.ingest('simulated')` validates the fixture into an in-memory sink. Other adapters stay explicitly disconnected. To import a file programmatically, supply `createFileImportSource({ name, content })` to `IngestionGateway`.

CSV uses `csv-parse`, including quoted commas, escaped quotes, multiline values, BOM, and CRLF. Required headers: `metric,value,unit,recordedAt`. Optional: `subject,location,sensorId`. Duplicate/empty headers and malformed rows fail explicitly. Invalid measurements are reported by gateway validation rather than converted to zero.

Reading IDs encode source, metric, subject, location, sensor ID, and timestamp as a JSON tuple. Retrying the same reading is idempotent; simultaneous readings from distinct locations or sensors remain distinct. When a device supplies neither location nor sensor identity, readings still deduplicate by source, metric, subject and time; adapters should supply sensor identity where multiple sensors share a source.

Run `npm test` from the repository root for pipeline and regression tests. Browser playback and guide tests remain under `tests/` and run with `npm run test:e2e`.
