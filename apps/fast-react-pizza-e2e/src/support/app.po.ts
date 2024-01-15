export const getHeaderWelcomeText = (): Cypress.Chainable<JQuery<HTMLSpanElement>> =>
  cy.get('[data-cy=header-welcome-text]');
export const getHeaderWelcomeSubText = (): Cypress.Chainable<JQuery<HTMLSpanElement>> =>
  cy.get('[data-cy=header-welcome-sub-text]');
export const getUsernameInput = (): Cypress.Chainable<JQuery<HTMLInputElement>> =>
  cy.get('[data-cy=username-input]');
export const getStartOrderButton = (): Cypress.Chainable<JQuery<HTMLButtonElement>> =>
  cy.get('[data-cy=start-order-button]');
export const getContinueOrderButton = (): Cypress.Chainable<JQuery<HTMLButtonElement>> =>
  cy.get('[data-cy=continue-order-button]');
