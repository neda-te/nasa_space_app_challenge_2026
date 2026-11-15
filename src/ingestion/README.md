# Data ingestion gateway

Connection points for external data sources (wearables, lab analysers, dosimeters,
habitat sensors, self-reports, ground uplink, file import).

**Status:** the pipeline is implemented and unit-tested and runs end to end with the
simulated source. No real source is connected, and the dashboard does not read from
the gateway yet.

- Which sources exist and whether they are connected: [`sources/registry.ts`](sources/registry.ts)
- How to connect one: the header comment of its file in [`sources/`](sources/)
- Design, formats and remaining steps: [`docs/data-ingestion.md`](../../docs/data-ingestion.md)
- Guarantees, as executable examples: [`ingestion.test.ts`](ingestion.test.ts) (`npm test`)
