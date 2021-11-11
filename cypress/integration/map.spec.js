
describe("Map", () => {

  it("map", () => {
    cy.visit("http://localhost:5000");
    cy.contains("Welcome");
    cy.wait(1000);
    cy.get('input[name=userid]').type(940);
    cy.get('input[name=submit]')
      .click();
  });
  
  it.skip("map userid case", () => {
    cy.visit("http://localhost:5000?userid=940");
    cy.contains("Welcome");
  });


});
