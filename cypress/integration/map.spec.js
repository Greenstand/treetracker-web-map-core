describe('Map', () => {
  it('map', () => {
    cy.visit('http://localhost:5000')
    cy.contains('Welcome')
    cy.wait(1000)
    cy.get('input[name=userid]').type(940)
    cy.get('input[name=controlSubmit]').click()
  })

  it('map userid case', () => {
    cy.visit('http://localhost:5000?userid=940')
    cy.contains('Welcome')
  })

  it('to check if we can update the bounds correctly', () => {
    cy.visit('http://localhost:5000')
    cy.contains('Welcome')
    cy.wait(1000)
    cy.get('input[name=lat]').type(0)
    cy.get('input[name=lon]').type(0)
    cy.get('input[name=zoom]').type(5)
    cy.get('input[name=flytoSubmit]').click()
    cy.url().should('match', /bounds=/)
  })

  it.skip('no data', () => {
    cy.visit('http://localhost:5000')
    cy.contains('Welcome')
    cy.wait(1000)
    cy.get('input[name=lat]').type(0)
    cy.get('input[name=lon]').type(0)
    cy.get('input[name=zoom]').type(5)
    cy.get('input[name=flytoSubmit]').click()
    cy.url().should('match', /bounds=/)
  })

  it('loading take too many time', () => {
    // use cypress to intercept the request, with a delay of 10 seconds
    cy.intercept('GET', /^.*tiles\/.*png$/, {
      statusCode: 504,
      // delay 10000ms
      delay: 10000,
    })
    cy.intercept('GET', /^.*tiles\/.*json$/, {
      statusCode: 503,
    })

    cy.visit('http://localhost:5000')
    cy.contains('Welcome')
  })
})
