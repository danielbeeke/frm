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

describe('language picker', () => {
  
  it('selects the language German', () => {
    cy.get('.add-language-button button').click()
    cy.wait(400)
    cy.get('.bcp47-search').type('German', {
      delay: 100
    })
    cy.get('.bcp47-result.active').click()
    cy.get('.fixed-bcp47-picker > button').click()
    cy.wait(400)
    cy.scrollTo('top')
    cy.get('.language-tabs .nav-link.active').contains('German')
  })

  it('closes after opening', () => {
    cy.get('.add-language-button button').click()
    cy.get('.add-language-button button').click()
    cy.get('.fixed-bcp47-picker').should('not.exist')
  })
})