# shared-utils-test-coverage — specifications by example
# Scenario tags @w<N> map items to delivery waves (see WAVES.md / BACKLOG.md).

Feature: shared-utils-test-coverage

  @w1
  Scenario: readJSON handles missing and invalid data
    Given localStorage has no value or invalid JSON for a key
    When readJSON is called
    Then it returns the fallback for missing or invalid data
    And it returns the parsed value for valid JSON

  @w1
  Scenario: chat history is capped and appended
    Given more than 50 chat messages exist
    When chat history is written or appended
    Then only the latest 50 messages are stored
    And appended messages include a timestamp

  @w1
  Scenario: guest profile and chat history can be cleared
    Given guest profile and chat history exist in localStorage
    When the clear helpers are called
    Then the corresponding keys are removed

  @w1
  Scenario: local storage keys filter system entries
    Given localStorage contains system, vite, and user keys
    When getLocalStorageKeys is called
    Then only non-system user keys are returned

  @w1
  Scenario: usage settings use defaults and updates
    Given usage settings are missing or partial
    When settings are read or updated
    Then defaults are applied and updates persist

  @w1
  Scenario: logEvent records logs and daily aggregates
    Given usage events are logged
    When logEvent is called
    Then the ring buffer respects logCap
    And daily aggregates count messages, actions, clicks, errors, and action names

  @w1
  Scenario: usage summary aggregates recent days
    Given daily usage aggregates exist across days
    When getUsageSummary is called for a window
    Then it returns series, totals, byAction, and lastActivity

  @w1
  Scenario: shared utils suite runs in CI
    Given the shared-utils Vitest suite
    When npm test runs locally and in CI
    Then the shared-utils scenarios pass before build is declared green