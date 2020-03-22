const rcsId = 'matraf'

describe('The Home Page', function () {
  it('successfully loads', function () {
    cy.visit('/', {
      onBeforeLoad (win) {
        cy.stub(win, 'prompt').returns(rcsId)
      }
    })
  })
})
