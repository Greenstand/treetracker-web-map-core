/* The ButtonPanel component */
import './style.css'
import log from 'loglevel'
import leftArrowComponent from './images/left-arrow.svg'
import rightArrowComponent from './images/right-arrow.svg'

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

    this.leftArrow.innerHTML = `<img src="${leftArrowComponent}" height="60px" width="60px" />`
    this.rightArrow.innerHTML = `<img src="${rightArrowComponent}" height="60px" width="60px" />`

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
