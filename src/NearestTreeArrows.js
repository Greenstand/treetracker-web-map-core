import './style.css'

export default class NearestTreeArrows {
  constructor(moveToNearest) {
    this.moveToNearest = moveToNearest
  }

  mount(element) {
    this.arrow = document.createElement('div')
    this.arrow.innerHTML = `
    <div class="round">
      <div id="cta">
        <span class="arrow primera next "></span>
        <span class="arrow segunda next "></span>
      </div>
    </div>
    `
    this.arrow.id = 'arrow'
    element.appendChild(this.arrow)

    this.arrow.addEventListener('click', this.arrowClickHandler.bind(this))

    this.arrow.style.display = 'none'
  }

  hideArrow() {
    this.arrow.className = ''
    this.arrow.style.display = 'none'
  }

  showArrow(direction) {
    this.arrow.className = ''
    this.arrow.style.display = 'block'
    this.arrow.className = `${direction}`
  }

  arrowClickHandler() {
    this.hideArrow()
    this.moveToNearest()
  }
}
