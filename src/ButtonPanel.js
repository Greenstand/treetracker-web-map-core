/* The ButtonPanel component */
import './style.css'
import log from 'loglevel'

export default class ButtonPanel {
  constructor(onNext, onPrev) {
    this.onNext = onNext
    this.onPrev = onPrev
  }

  isHidden() {
    return this._isHidden
  }

  hide() {
    this.buttonPanel.style.display = 'none'
    this._isHidden = true
  }

  showLeftArrow() {
    this.leftArrow.querySelector('svg').style.display = 'block'
  }

  showRightArrow() {
    this.rightArrow.querySelector('svg').style.display = 'block'
  }

  hideLeftArrow() {
    this.leftArrow.querySelector('svg').style.display = 'none'
  }

  hideRightArrow() {
    this.rightArrow.querySelector('svg').style.display = 'none'
  }

  show() {
    log.debug('ButtonPanel.show()')
    this.buttonPanel.style.display = 'flex'
    this._isHidden = false
  }

  mount(element) {
    // create a div and mount to the element
    this.buttonPanel = document.createElement('div')
    this.leftArrow = document.createElement('span')
    this.rightArrow = document.createElement('span')

    this.leftArrow.innerHTML = `
    <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        viewBox="0 -100 477.175 677.175" style="enable-background:new 0 -100 477.175 677.175;" xml:space="preserve">
    <g>
      <path d="M145.188,238.575l215.5-215.5c5.3-5.3,5.3-13.8,0-19.1s-13.8-5.3-19.1,0l-225.1,225.1c-5.3,5.3-5.3,13.8,0,19.1l225.1,225
        c2.6,2.6,6.1,4,9.5,4s6.9-1.3,9.5-4c5.3-5.3,5.3-13.8,0-19.1L145.188,238.575z" fill="#ffffff"/>
    </g>
    </svg>
    `

    this.rightArrow.innerHTML = `
    <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        viewBox="0 -100 477.175 677.175" style="enable-background:new 0 -100 477.175 677.175;" xml:space="preserve">
    <g>
      <path d="M360.731,229.075l-225.1-225.1c-5.3-5.3-13.8-5.3-19.1,0s-5.3,13.8,0,19.1l215.5,215.5l-215.5,215.5
        c-5.3,5.3-5.3,13.8,0,19.1c2.6,2.6,6.1,4,9.5,4c3.4,0,6.9-1.3,9.5-4l225.1-225.1C365.931,242.875,365.931,234.275,360.731,229.075z
        " fill="#ffffff"/>
    </g>
    </svg>
    `

    this.leftArrow.className = 'next-button-arrow'
    this.rightArrow.className = 'next-button-arrow'

    this.leftArrow.setAttribute('id', 'next-left-arrow')
    this.rightArrow.setAttribute('id', 'next-right-arrow')

    this.buttonPanel.appendChild(this.leftArrow)
    this.buttonPanel.appendChild(this.rightArrow)

    this.buttonPanel.className = 'buttonPanel'
    element.appendChild(this.buttonPanel)

    this.buttonPanel.addEventListener('click', this.clickHandler.bind(this))

    //hide by default
    this.buttonPanel.style.display = 'none'
  }

  clickHandler(e) {
    const clicked = e.target.closest('.next-button-arrow').id

    if (clicked === 'next-right-arrow') {
      console.log('next')
      this.onNext()
    } else if (clicked === 'next-left-arrow') {
      console.log('prev')
      this.onPrev()
    }
  }
}
