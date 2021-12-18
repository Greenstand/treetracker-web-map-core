/* The ButtonPanel component */
import './style.css';

export default class ButtonPanel {
  constructor() {}

  mount(element) {
    // create a div and mount to the element
    this.buttonPanel = document.createElement('div');
    this.buttonPanel.innerHTML = `
        <span id="left-arrow">&#9668;</span>
        <span id="right-arrow">&#9658;</span>
      `;
    this.buttonPanel.className = 'buttonPanel';
    element.appendChild(this.buttonPanel);
  }
}
