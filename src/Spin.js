/* The Spin component */
import "./style.css";

export default class Spin{
  constructor(){
  }

  mount(element){
    // create a div and mount to the element
    this.spin = document.createElement("div");
    this.spin.innerHTML = `
      <span class="spin-container">
        <span class="sub1"></span>
        <span class="sub2"></span>
      </span>
      `;
    this.spin.className = "spin";
    this.spin.style.display = "none";
    element.appendChild(this.spin);
  }

  show(){
    this.spin.style.display = "block";
  }

  hide(){
    this.spin.style.display = "none";
  }
}
