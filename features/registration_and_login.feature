@parabank
Feature: ParaBank User Registration and Login

  As a new visitor to ParaBank
  I want to register a new account
  And then sign in with that account
  So that I can access my account details and view my balance

  Background:
    Given I navigate to the ParaBank home page

  @registration @smoke
  Scenario: Successful user registration with dynamically generated data
    When I click on the "Register" link
    And I fill in the registration form with valid random user data
    And I submit the registration form
    Then I should see a successful registration confirmation message
    And the new user should be registered with the generated credentials

  @login @smoke
  Scenario: Successful login with the registered user account
    When I log in with the registered user credentials
    Then I should be logged in successfully
    And I should see the account overview page
    And I should log the account balance displayed on the page
