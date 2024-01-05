import { getGreeting, getSecretModal } from '../support/app.po';

describe('secret modal', () => {
  beforeEach(() => cy.visit('/'));

  it('should be able to open and close secret modal', () => {
    getGreeting().contains('usePopcorn').click();
    getSecretModal().should('be.visible');
    getSecretModal().find('h4').contains("You've found the secret modal!");
    getSecretModal().click();
    getSecretModal().should('not.be.visible');
  });
});
