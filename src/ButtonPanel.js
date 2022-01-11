/* The ButtonPanel component */
import './style.css'
import log from 'loglevel'

export default class ButtonPanel {
  constructor(onNext, onPrev) {
    this.onNext = onNext
    this.onPrev = onPrev
  }
  mount(element) {
    // create a div and mount to the element
    this.buttonPanel = document.createElement('div')
    this.buttonPanel.innerHTML = `
    <span id="left-arrow">&#9668;</span>
    <span id="right-arrow">&#9658;</span>
    `
    this.buttonPanel.className = 'buttonPanel'
    element.appendChild(this.buttonPanel)

    this.buttonPanel.addEventListener('click', (e) => {
      if (e.target.id === 'right-arrow') {
        try {
          this.onNext()
        } catch (e) {
          log.warn('go next failed', e)
        }
      } else if (e.target.id === 'left-arrow') {
        try {
          this.onPrev()
        } catch (e) {
          log.warn('go prev failed', e)
        }
      }
    })
  }
}
