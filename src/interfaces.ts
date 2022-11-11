export interface MapConfig {
  [index: string]: {
    zoom: number
    center: {
      lat: number
      lng: number
    }
  }
}
