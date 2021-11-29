
describe("Components", () => {

  it("Spin", () => {
    cy.visit("http://localhost:5000/test_components.html");
    cy.wait(1000);
    cy.contains("mount spin")
      .click();

    // expect the spinner to be visible
    cy.get(".spin")
      .should("not.be.visible");  
    cy.contains("show spin")
      .click();
    cy.get(".spin")
      .should("be.visible");  
    cy.contains("hide spin")
      .click();
    cy.get(".spin")
      .should("not.be.visible");  

  })

  it("Alert", () => {
    cy.visit("http://localhost:5000/test_components.html");
    cy.contains("show alert")
      .click();
    // cy.get(".alert")
    //   .should("not.be.visible");  
    cy.contains("An alert message");

  })

})