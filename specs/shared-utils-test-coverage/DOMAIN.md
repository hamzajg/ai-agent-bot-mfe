# Domain model: shared-utils-test-coverage

> The domain contract for this feature (D019): ubiquitous language,
> bounded contexts, aggregates and invariants. Fill every section. `simple`
> tier means the feature introduces no NEW domain concepts — say so
> explicitly and name the owning context; it is not a blank file. Deeper
> tiers are checked semantically by the spec audit and wave reviewer.

**Tier:** simple

## Ubiquitous language

<!-- One entry per term this feature introduces or relies on. Use the SAME
     words in scenarios, stories, code and UI copy. -->

- Chat history: ordered localStorage message list (`ai_agent_chat_history`) capped to latest 50 entries.
- Guest profile: localStorage profile (`ai_agent_guest_profile`) describing role/mission/routes/actions.
- Usage event: recorded event with id, timestamp, type, and metadata in `ai_usage_log_v1`.
- Daily aggregate: per-day usage counters/actions in `ai_usage_daily_v1`.
- Usage settings: localStorage settings (`ai_usage_settings_v1`) controlling logging behavior.

## Bounded contexts

<!-- Which context owns each concept; where translation is needed. -->

- Owning context: `shared/utils` client-side persistence helpers used by widget, auth, and dashboard modules.
- Context map: modules call helper functions; helpers own localStorage key format and fallback behavior. No cross-context translation layer added.
- New concepts introduced: none — all terms borrowed from existing storage/usage helper behavior.

## Domain model

<!-- Only what this feature needs. Invariants are enforced at the boundary. -->

- Aggregates and their invariants: none new; usage daily aggregates maintain counters per day and `actionsByName` map.
- Entities / value objects this feature adds or changes: none; tests cover existing helper behavior.
- Transaction boundary: each helper call writes its own localStorage key(s); no multi-aggregate transaction.

## Integration style

<!-- How this feature's context talks to the rest of the system. -->

- Synchronous in-process function calls to browser localStorage.
- Strong consistency within a single helper call; no eventual consistency.

## External translations

<!-- External systems/models entering this context and how they are
     translated — or an explicit "none". -->

- none — browser localStorage is the only external boundary, accessed directly by existing helpers.