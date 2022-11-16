import TileLoadingMonitor from './TileLoadingMonitor'

export type DirectionType = 'north' | 'south' | 'east' | 'west'

export type CoordinatesType = {
  lat: number
  lng: number
}

export type ButtonPanelMethods = {
  hide: () => void
  showLeftArrow: () => void
  showRightArrow: () => void
  hideLeftArrow: () => void
  hideRightArrow: () => void
  show: () => void
  mount: (e: Element) => void
  clickHandler: (e: MouseEvent) => void
}

export type TileLoadingMonitorType = InstanceType<typeof TileLoadingMonitor>

export type TileLoadingMonitorOptions = {
  showLoadingThreshold: number
  slowThreshold: number
  onShowLoading: () => void
  onSlowAlert: () => void
  onLoad: () => void
  onDestroy?: () => void
 }