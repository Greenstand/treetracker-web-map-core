import TileLoadingMonitor from './TileLoadingMonitor'

export type DirectionType = 'north' | 'south' | 'east' | 'west'

export type CoordinatesType = {
  lat: number
  lng: number
}

export type TileLoadingMonitorType = InstanceType<typeof TileLoadingMonitor>
