import {
  Marker,
  TileLayer,
  TileEvent,
  Map as LeafletMap,
  LatLngLiteral,
} from 'leaflet'
import Alert from './Alert'
import Spin from './Spin'
import TileLoadingMonitor from './TileLoadingMonitor'

export type DirectionType = 'north' | 'south' | 'east' | 'west'

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

export type MapOptions = {
  L: any
  map?: LeafletMap
  minZoom: number
  maxZoom: number
  initialCenter: LatLngLiteral
  tileServerUrl: string
  tileServerSubdomains: string[]
  apiServerUrl: string
  width: number
  height: number
  debug: boolean
  moreEffect: boolean
  filters: ValueMissing | FiltersType
  defaultZoomLevelForTreePoint: number
  onLoad: ValueMissing | EventHandlerFn
  onClickTree: ValueMissing | EventHandlerFn
  onFindNearestAt: ValueMissing | EventHandlerFn
  onError: () => ValueMissing | EventHandlerFn
}

export type ValueMissing = null | undefined

export type EventHandlerFn = (data?: any) => void

export type SpinType = InstanceType<typeof Spin>
export type AlertType = InstanceType<typeof Alert>
export type FiltersType = {
  userid?: number
  wallet?: string
  treeid?: number
  timeline?: string
  map_name?: string
  tree_name?: string
}

export type DirectionPlacement = DirectionType | 'in'

export type TreeInfoType = {
  id: number
  lat: number
  lon: number
}

export class TreeLayer extends Marker {
  payload?: TreeType | TreeInfoType
}

export class GoogleLayer extends TileLayer {}

export type UTFGridEventData = {
  count: number
  id: number
  latlon: string
  type: string
  zoom_to?: string
}

export type CustomUTFData = UTFGridEventData & { lat: number; lon: number }

export interface UTFGridEvent extends TileEvent {
  data: UTFGridEventData | ValueMissing
  _tile: ValueMissing | string
  _tileCharCode: ValueMissing | string
}

export interface UTFGridUnloadEvent extends TileEvent {
  tile: HTMLImageElement & { cancelRequest: () => void }
}

export type Point = {
  count: number
  id: number
  lat: number
  latlon: string
  type: string
  lon: number
}

export type TreeType = TreeInfoType & {
  time_created?: string
  time_updated?: string
  missing?: boolean
  priority?: boolean
  cause_of_death_id?: ValueMissing | number
  planter_id?: number
  primary_location_id?: ValueMissing | number
  settings_id?: ValueMissing | number
  override_settings_id?: ValueMissing | number
  dead?: number
  photo_id?: ValueMissing | number
  image_url?: string
  certificate_id?: ValueMissing | number
  estimated_geometric_location?: string
  gps_accuracy?: number
  active?: boolean
  planter_photo_url?: string
  planter_identifier?: string
  device_id?: ValueMissing | number
  sequence?: string
  note?: string
  verified?: false
  uuid?: string
  approved?: boolean
  status?: string
  cluster_regions_assigned?: boolean
  species_id?: ValueMissing | number
  planting_organization_id?: ValueMissing | number
  payment_id?: ValueMissing | number
  contract_id?: ValueMissing | number
  token_issued?: boolean
  morphology?: string
  age?: string
  species?: ValueMissing | string
  capture_approval_tag?: ValueMissing | string
  rejection_reason?: ValueMissing | string
  matching_hash?: ValueMissing | string
  device_identifier?: string
  images?: any
  domain_specific_data?: any
  image_url_backup?: ValueMissing | string
  token_id?: ValueMissing | number
  name?: ValueMissing | string
  earnings_id?: ValueMissing | number
  session_id?: string
}

export type IconSuiteParameters = {
  iconSuiteClass: string
  iconSuiteQueryString: string
}

export type View = {
  center: LatLngLiteral
  zoomLevel: number
}
