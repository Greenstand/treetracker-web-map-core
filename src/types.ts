export type DirectionType = 'north' | 'south' | 'east' | 'west'

export type CoordinatesType = {
  lat: number
  lng: number
}

export type ButtonPanelMethods = {
  _isHidden: () => void
  hide: () => void
  showLeftArrow: () => void
  showRightArrow: () => void
  hideLeftArrow: () => void
  hideRightArrow: () => void
  show: () => void
  mount: (e: Element) => void
  clickHandler: (e: Event) => void
}
