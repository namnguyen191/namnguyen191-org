export const getGreeting = () => cy.get('h1').should('have.length', 1);
export const getSecretModal = () => cy.get('dialog');
export const getSearchBox = () => cy.get('.search');
export const getMoviesList = () => cy.get('ul.list');
