import {
  getContinueOrderButton,
  getHeaderWelcomeSubText,
  getHeaderWelcomeText,
  getStartOrderButton,
  getUsernameInput,
} from '../support/app.po';

describe('fast-react-pizza-e2e', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getHeaderWelcomeText().contains('The best pizza.');
    getHeaderWelcomeSubText().contains('Straigth out of the oven, straigth to you.');
  });

  it('should only display order button once user type their name in', () => {
    getStartOrderButton().should('not.exist');
    getUsernameInput().type('Nam Nguyen');
    getStartOrderButton().should('be.visible');
  });

  it('should go to menu page when create order button is clicked', () => {
    getUsernameInput().type('Nam Nguyen');
    getStartOrderButton().click();
    cy.location('pathname').should('eq', '/menu');
  });

  it('should go to menu page when the user typed in their name and click enter', () => {
    getUsernameInput().type('Nam Nguyen{enter}');
    cy.location('pathname').should('eq', '/menu');
  });

  it('should display continue to order button when the user have already provide their username and navigate back from menu page', () => {
    const username = 'Nam Nguyen';
    getUsernameInput().type(username);
    getStartOrderButton().click();
    cy.location('pathname').should('eq', '/menu');
    cy.go('back');
    cy.location('pathname').should('eq', '/');
    getContinueOrderButton().should('be.visible');
    getContinueOrderButton()
      .should('have.text', `Continue ordering, ${username}`)
      .should('have.css', 'text-transform', 'uppercase');
  });
});
