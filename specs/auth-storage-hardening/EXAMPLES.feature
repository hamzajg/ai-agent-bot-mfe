# auth-storage-hardening — specifications by example
# Scenario tags @w<N> map items to delivery waves (see WAVES.md / BACKLOG.md).

Feature: auth-storage-hardening

  @w1 @happy-path
  Scenario: register stores a hashed password
    Given a new shop owner registration with email and password
    When the registration completes
    Then the stored user record contains a password hash and salt
    And the stored user record does not contain the plaintext password

  @w1
  Scenario: login succeeds with a hashed password
    Given a stored user record with a salted password hash
    When the user logs in with the correct password
    Then login succeeds and the public user is returned

  @w1
  Scenario: login rejects an invalid password
    Given a stored user record with a salted password hash
    When the user logs in with an incorrect password
    Then login fails with an invalid credentials error

  @w1
  Scenario: legacy plaintext password is migrated on login
    Given a legacy stored user record containing a plaintext password
    When the user logs in with the correct password
    Then login succeeds
    And the stored record is upgraded to a salted password hash
    And the plaintext password is no longer stored

  @w1
  Scenario: auth storage suite runs in CI
    Given the auth storage tests
    When npm test runs locally and in CI
    Then the auth storage scenarios pass before build is declared green
