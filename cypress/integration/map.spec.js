
describe("Map", () => {

  it("map", () => {
    cy.visit("http://localhost:5000");
    cy.contains("Welcome");
    cy.contains("Hello");
  });

});
