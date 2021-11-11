
describe("Map", () => {

  it("map", () => {
    cy.visit("http://localhost:5000");
    cy.contains("Welcome");
    cy.wait(1000);
    cy.get('input[name=userid]').type(940);
    cy.get('input[name=controlSubmit]')
      .click();
  });
  
  it("map userid case", () => {
    cy.visit("http://localhost:5000?userid=940");
    cy.contains("Welcome");
  });

  it.only("to check if we can update the bounds correctly", () => {
    cy.visit("http://localhost:5000");
    cy.contains("Welcome");
    cy.wait(1000);
    cy.get('input[name=lat]').type(0);
    cy.get('input[name=lon]').type(0);
    cy.get('input[name=zoom]').type(5);
    cy.get('input[name=flytoSubmit]')
      .click();
    cy.url().should('match',/bounds=/);
  });


});
