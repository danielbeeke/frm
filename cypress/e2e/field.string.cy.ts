beforeEach(() => {
  cy.visit('http://localhost:1234')
  cy.wrap(new Promise((resolve => {
    cy.get('frm-form').then($form => {
      $form[0].addEventListener('ready', resolve)
    })
  })), {
    timeout: 10000
  })
})

describe('field.string', () => {
  
  it('allows for text', () => {
    cy.get('[data-predicate="schema:givenName"] input[type="text"]')
      .type('John')
      .blur()

    cy.get('[data-predicate="schema:givenName"] .bi-plus')
    cy.get('[data-predicate="schema:givenName"] .remove-item-button')
    cy.get('[data-predicate="schema:givenName"] .bi-exclamation-triangle-fill').should('not.exist')
  })
})