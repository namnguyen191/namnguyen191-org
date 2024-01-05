import { getGreeting, getMoviesList, getSearchBox } from '../support/app.po';

describe('use-popcorn', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('usePopcorn');
  });

  it('should search for movie welcome message', () => {
    getSearchBox().type('hell');
    getMoviesList().find('li', { timeout: 10000 }).should('have.length', 10);
  });
});
