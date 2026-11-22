# verified-tool-actions — specifications by example
# Scenario tags @w<N> map items to delivery waves (see WAVES.md / BACKLOG.md).

Feature: verified-tool-actions

  @w1 @happy-path
  Scenario: parse the first JSON action from a reply
    Given a model reply that contains prose followed by a JSON action object
    When the tool pipeline parses the reply
    Then the first balanced action object is returned with its name and params

  @w1 @edge
  Scenario: ignore JSON without an explicit action request
    Given a model reply that mentions a JSON object but never asks to run a tool
    When the tool pipeline applies the explicit-request guard
    Then the reply is treated as conversation and no action is executed

  @w1 @happy-path
  Scenario: find a tool case-insensitively
    Given an action name that differs in case from the configured tool name
    When the tool pipeline looks up the action
    Then the configured tool is found

  @w1 @edge
  Scenario: miss an unknown tool safely
    Given an action name that matches no configured tool
    When the tool pipeline looks up the action
    Then it reports a clear miss and raises no exception

  @w1 @happy-path
  Scenario: execute an HTTP tool with query params
    Given a configured HTTP action with a text param and a stubbed fetch
    When the tool pipeline executes the action with a search term
    Then fetch is called with the declared URL and encoded query string
    And the response body is returned as the action result

  @w1 @happy-path
  Scenario: execute a localStorage tool
    Given a configured localStorage action and a stubbed store containing a value
    When the tool pipeline executes the action with a key
    Then the stored value is returned as the action result

  @w1 @happy-path
  Scenario: format an array preview
    Given an action result that is an array of product records
    When the tool pipeline formats the result
    Then the display text contains a short bullet preview of the records

  @w1 @happy-path
  Scenario: format key-value results
    Given an action result that is a flat object
    When the tool pipeline formats the result
    Then the display text shows the keys and values as key-value lines

  @w1 @happy-path
  Scenario: format raw text
    Given an action result that is a plain string
    When the tool pipeline formats the result
    Then the display text is the string unchanged

  @w1 @happy-path
  Scenario: map a tool spec for provider-native calling
    Given a configured action with a name, description and params
    When the tool pipeline builds a provider tool spec
    Then the spec exposes the name, description and parameter schema

  @w1 @verification
  Scenario: run the tool-path suite in CI
    Given the tool-path scenarios are written as automated checks
    When `npm test` runs locally and in the CI workflow
    Then every tool-path check passes before the bundles are declared green
