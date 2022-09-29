/* The ButtonPanel component */
import './style.css'
import log from 'loglevel'
import leftArrowComponent from './images/left-arrow.svg'
import rightArrowComponent from './images/right-arrow.svg'

export default class ButtonPanel {
  leftButtonId = 'next-left-arrow'
  rightButtonId = 'next-right-arrow'

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
    this.leftArrow.getElementsByTagName('div')[0].style.display = 'flex'
  }

  showRightArrow() {
    this.rightArrow.getElementsByTagName('div')[0].style.display = 'flex'
  }

  hideLeftArrow() {
    this.leftArrow.getElementsByTagName('div')[0].style.display = 'none'
  }

  hideRightArrow() {
    this.rightArrow.getElementsByTagName('div')[0].style.display = 'none'
  }

  show() {
    log.debug('ButtonPanel.show()')
    this.buttonPanel.style.display = 'flex'
    this._isHidden = false
  }

  mount(element) {
    // create a div and mount to the element
    this.buttonPanel = document.createElement('div')
    this.leftArrow = document.createElement('div')
    this.rightArrow = document.createElement('div')

    this.leftArrow.className = 'next-button-container'
    this.rightArrow.className = 'next-button-container'

    this.leftArrow.setAttribute('id', this.leftButtonId)
    this.rightArrow.setAttribute('id', this.rightButtonId)

    const buttonLeft = document.createElement('div')
    const buttonRight = document.createElement('div')
    buttonLeft.className = 'next-button'
    buttonRight.className = 'next-button'

    buttonLeft.innerHTML = `<img src="${leftArrowComponent}" height="60px" />`
    buttonRight.innerHTML = `<img src="${rightArrowComponent}" height="60px" />`

    this.leftArrow.appendChild(buttonLeft)
    this.rightArrow.appendChild(buttonRight)

    this.buttonPanel.appendChild(this.leftArrow)
    this.buttonPanel.appendChild(this.rightArrow)

    this.buttonPanel.className = 'buttonPanel'
    element.appendChild(this.buttonPanel)

    this.buttonPanel.addEventListener('click', this.clickHandler.bind(this))

    //hide by default
    this.buttonPanel.style.display = 'none'
  }

  clickHandler(e) {
    const targetId = e.target.closest('.next-button-container').id

    if (targetId === this.rightButtonId) {
      console.log('next')
      this.onNext()
    } else if (targetId === this.leftButtonId) {
      console.log('prev')
      this.onPrev()
    }
  }
}
