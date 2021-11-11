
describe("Map", () => {

  it("map", () => {
    cy.visit("http://localhost:5000");
    cy.contains("Welcome");
    cy.wait(1000);
    cy.get('input[name=userid]').type(940);
    cy.get('input[name=controlSubmit]')
      .click();
  });
  
  it.skip("map userid case", () => {
    cy.visit("http://localhost:5000?userid=940");
    cy.contains("Welcome");
  });

  it("to check if we can update the bounds correctly", () => {
    cy.visit("http://localhost:5000");
    cy.contains("Welcome");
    cy.wait(1000);
    cy.get('input[name=userid]').type(940);
    cy.get('input[name=flytoSubmit]')
      .click();
  });


});
