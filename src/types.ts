import TileLoadingMonitor from './TileLoadingMonitor'

export type DirectionType = 'north' | 'south' | 'east' | 'west'

export type CoordinatesType = {
  lat: number
  lng: number
}

export type TileLoadingMonitorOptions = {
  showLoadingThreshold: number
  slowThreshold: number
  onShowLoading: () => void
  onSlowAlert: () => void
  onLoad: () => void
  onDestroy?: () => void
}
