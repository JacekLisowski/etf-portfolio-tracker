# ADR 002: ISIN-First Data Model for ETF

**Status:** Accepted
**Date:** 2026-02-01
**Deciders:** Development Team
**Technical Story:** ETF Data Model Refactoring

## Context and Problem Statement

The initial data model treated ETF listings as primary entities, with ISIN as just another field. This approach had several issues:

1. **No canonical name per ISIN** - the same ETF (ISIN) could have different names in different listings
2. **No source tracking** - couldn't distinguish between regulatory data (FIRDS) and commercial data (APIs)
3. **Difficult to upgrade** - adding FIRDS/SIX data would require schema changes
4. **Not aligned with regulatory standards** - ISIN should be the primary identifier for financial instruments

## Decision Drivers

1. **Regulatory compliance** - ISIN is the standard identifier (ISO 6166)
2. **Data quality** - need to prioritize official sources (ESMA FIRDS, FCA, SIX)
3. **Scalability** - prepare for multiple data sources with different priorities
4. **User experience** - users should see consistent ETF names regardless of exchange
5. **Future-proofing** - enable easy integration of regulatory data sources

## Considered Options

### Option 1: Keep Flat Model (Status Quo)
- Single `Etf` table with ISIN as field
- Name duplicated per listing
- Simple but not scalable

### Option 2: ISIN-First with Instrument + Listing (CHOSEN)
- Separate `Instrument` table (ISIN level)
- `Listing` table (ISIN + MIC level)
- Source hierarchy tracking
- Aligned with regulatory approach

### Option 3: Denormalized with Source Tracking
- Keep flat model but add source fields
- Easier migration but still duplicates names
- Doesn't solve canonical name problem

## Decision Outcome

**Chosen option:** Option 2 - ISIN-First with Instrument + Listing

### Data Model

```prisma
// Instrument = ETF at ISIN level (one canonical name)
model Instrument {
  isin            String @id
  name            String
  nameSource      NameSource  // ESMA_FIRDS | FCA_FIRDS | SIX | FALLBACK
  classification  String?
  nameConflict    Boolean
  firstSeenAt     DateTime
  lastSeenAt      DateTime

  listings        Etf[]  // One instrument, many listings
}

// Etf (Listing) = Trading venue
model Etf {
  isin            String
  exchangeId      String
  ticker          String?
  tradingCurrency String
  status          ListingStatus
  sourceSystem    String

  instrument      Instrument @relation(...)
  exchange        Exchange @relation(...)

  @@unique([isin, exchangeId])
}
```

### Source Hierarchy

1. **ESMA FIRDS** (EEA) - Priority 1
2. **FCA FIRDS** (UK) - Priority 1
3. **SIX Reference Data** (CH) - Priority 2
4. **FALLBACK** (Twelve Data, etc.) - Priority 3

Names are only updated when a higher-priority source provides data.

## Consequences

### Positive

- ✅ **Canonical names** - one name per ISIN, consistent across listings
- ✅ **Source tracking** - know where data comes from, can upgrade to better sources
- ✅ **Regulatory alignment** - follows FIRDS/ISO 6166 standards
- ✅ **Conflict detection** - flag when sources disagree on names
- ✅ **Future-proof** - easy to add ESMA/FCA/SIX integrations

### Negative

- ⚠️ **Migration complexity** - need to migrate existing data to new structure
- ⚠️ **Additional join** - queries need to join Instrument + Listing (minimal performance impact)
- ⚠️ **Code updates** - services and types need updating

### Neutral

- 📝 **Documentation** - need to document source hierarchy for team
- 📝 **Testing** - need new tests for source priority logic

## Implementation Plan

### Phase 1: Schema Update ✅
- Add Instrument model
- Add NameSource and ListingStatus enums
- Update Etf model with new fields
- Create migration

### Phase 2: Service Updates (Current)
- Update ETF services to use Instrument + Listing
- Implement source hierarchy logic
- Add name conflict detection

### Phase 3: Data Migration
- Migrate existing ETF data to new structure
- Create Instrument records from existing Etf records
- Mark all as nameSource = FALLBACK

### Phase 4: Twelve Data Integration
- Sync ETFs from Twelve Data API
- Populate with FALLBACK source
- ~8,600 ETFs from major exchanges

### Phase 5: Regulatory Sources (Future)
- ESMA FIRDS integration
- FCA FIRDS integration
- SIX Reference Data integration
- Upgrade names from FALLBACK to regulatory sources

## Validation

Success criteria:
- [ ] Migration completes without data loss
- [ ] All existing transactions still link correctly
- [ ] Source hierarchy logic works correctly
- [ ] Name conflicts are detected and flagged
- [ ] API responses include canonical names from Instrument
- [ ] Performance impact < 10ms per query

## References

- [ISO 6166 - ISIN Standard](https://www.iso.org/standard/78502.html)
- [ESMA FIRDS](https://www.esma.europa.eu/policy-activities/mifid-ii-and-mifir/reference-data)
- [FCA FIRDS](https://www.fca.org.uk/markets/mifid-ii/uk-mifid-transaction-reporting-system)
- User specification: `~/jak_zbudowac_baze.txt`

## Notes

- The name "Etf" is kept for backward compatibility, but conceptually it represents a "Listing"
- Future refactoring could rename Etf → Listing for clarity
- Source hierarchy is strict - never downgrade from higher to lower priority source
