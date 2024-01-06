export const getGreeting = (): Cypress.Chainable<JQuery<HTMLHeadingElement>> =>
  cy.get('h1').should('have.length', 1);
export const getSecretModal = (): Cypress.Chainable<JQuery<HTMLDialogElement>> => cy.get('dialog');
export const getSearchBox = (): Cypress.Chainable<JQuery<HTMLElement>> => cy.get('.search');
export const getMoviesList = (): Cypress.Chainable<JQuery<HTMLElement>> => cy.get('ul.list');
