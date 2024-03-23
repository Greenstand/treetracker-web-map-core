/* The Alert component */
import './style.css'

export default class Alert {
  constructor() {
    this.id = 0
  }

  mount(element) {
    // create a div and mount to the element
    this.alert = document.createElement('div')
    this.alert.innerHTML = `
      <div class="alert-container" >
        <div class="alert" >
          <svg class="alert-svg" width="24" height="24" >
            <symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </symbol>
            <use xlink:href="#exclamation-triangle-fill"/>
          </svg>
          <div class="greenstand-alert-message-box" >
            An example warning alert with an icon
          </div>
        </div>
      </div>
      `
    this.alert.style.display = 'none'
    element.appendChild(this.alert)
  }

  show(message, time) {
    clearTimeout(this.id)
    document.getElementsByClassName(
      'greenstand-alert-message-box',
    )[0].innerHTML = message
    this.alert.style.display = 'block'
    if (time) {
      this.id = setTimeout(() => this.hide(), time)
    }
  }

  hide() {
    this.alert.style.display = 'none'
  }
}
