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

  show() {
    log.debug('ButtonPanel.show()')
    this.buttonPanel.style.display = 'flex'
    this._isHidden = false
  }

  mount(element) {
    // create a div and mount to the element
    this.buttonPanel = document.createElement('div')
    this.buttonPanel.innerHTML = `
    <span id="next-left-arrow" class="next-button-arrow"><svg width="68" height="93" viewBox="0 0 68 93" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_bd_6133_21294)">
    <path d="M8 20C8 15.5817 11.5817 12 16 12H52V81H16C11.5817 81 8 77.4183 8 73V20Z" fill="#474B4F" fill-opacity="0.6" shape-rendering="crispEdges"/>
    <path d="M38.2987 31.6927C37.3636 30.7691 35.9026 30.7691 34.9675 31.6927L21.7013 44.8547C20.7662 45.7784 20.7662 47.2216 21.7013 48.1453L35.026 61.3073C35.4935 61.7691 36.0779 62 36.6623 62C37.2468 62 37.8312 61.7691 38.2987 61.3073C39.2338 60.3836 39.2338 58.9404 38.2987 58.0168L26.6688 46.4711L38.2987 34.9832C39.2338 34.0596 39.2338 32.6164 38.2987 31.6927Z" fill="white"/>
    </g>
    <defs>
    <filter id="filter0_bd_6133_21294" x="0" y="0" width="68" height="93" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
    <feGaussianBlur in="BackgroundImage" stdDeviation="2"/>
    <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_6133_21294"/>
    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
    <feOffset dx="4"/>
    <feGaussianBlur stdDeviation="6"/>
    <feComposite in2="hardAlpha" operator="out"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
    <feBlend mode="normal" in2="effect1_backgroundBlur_6133_21294" result="effect2_dropShadow_6133_21294"/>
    <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_6133_21294" result="shape"/>
    </filter>
    </defs>
    </svg>
    </span>
    <span id="next-right-arrow" class="next-button-arrow"><svg width="44" height="69" viewBox="0 0 44 69" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_b_6133_21295)">
    <path d="M44 61C44 65.4183 40.4183 69 36 69L0 69L6.03217e-06 -3.8466e-06L36 -6.99382e-07C40.4183 -3.13124e-07 44 3.58173 44 8L44 61Z" fill="#474B4F" fill-opacity="0.6"/>
    <path d="M13.7013 49.3073C14.6364 50.2309 16.0974 50.2309 17.0325 49.3073L30.2987 36.1453C31.2338 35.2216 31.2338 33.7784 30.2987 32.8547L16.974 19.6927C16.5065 19.2309 15.9221 19 15.3377 19C14.7532 19 14.1688 19.2309 13.7013 19.6927C12.7662 20.6164 12.7662 22.0596 13.7013 22.9832L25.3312 34.5289L13.7013 46.0168C12.7662 46.9404 12.7662 48.3836 13.7013 49.3073Z" fill="white"/>
    </g>
    <defs>
    <filter id="filter0_b_6133_21295" x="-4" y="-4" width="52" height="77" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
    <feGaussianBlur in="BackgroundImage" stdDeviation="2"/>
    <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_6133_21295"/>
    <feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur_6133_21295" result="shape"/>
    </filter>
    </defs>
    </svg>
    </span>
    `
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
