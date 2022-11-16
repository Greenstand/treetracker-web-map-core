/*
 * A model for monitoring the loading of tiles.
 */
import { TileErrorEvent, TileEvent, TileLayer } from 'leaflet'
import log from 'loglevel'
import { TileLoadingMonitorOptions } from './types'

class TileLoadingMonitor {
  tileLayer: TileLayer
  showLoadingTimer: ReturnType<typeof setTimeout> | undefined
  slowTimer: ReturnType<typeof setTimeout> | undefined
  options: TileLoadingMonitorOptions

  constructor(tileLayer: TileLayer, options: TileLoadingMonitorOptions) {
    // the monitor should know about the tile layer
    // and how to manipulate and listen to it
    this.tileLayer = tileLayer
    this.options = {
      ...{
        //default options
      },
      ...options,
    }

    this.tileLayer.on('loading', this._handleLoading)
    this.tileLayer.on('load', this._handleLoad)
    this.tileLayer.on('tileerror', this._handleTileError)

    this.showLoadingTimer = undefined
    this.slowTimer = undefined
  }

  _handleLoading = (_event?: TileEvent) => {
    log.warn('start loading tile...')
    log.warn(
      'wait for show loading for %d sed',
      this.options.showLoadingThreshold,
    )
    this.showLoadingTimer = setTimeout(() => {
      log.warn('show loading...')
      this.options.onShowLoading()
    }, this.options.showLoadingThreshold)
    this.slowTimer = setTimeout(() => {
      log.warn('show slow...')
      this.options.onSlowAlert()
    }, this.options.slowThreshold)
  }

  _handleLoad = (_event?: TileEvent) => {
    log.warn('stop loading tile...')
    clearTimeout(this.showLoadingTimer)
    delete this.showLoadingTimer
    clearTimeout(this.slowTimer)
    delete this.slowTimer
    log.warn('cleaned:', this.showLoadingTimer, this.slowTimer)
    this.options.onLoad()
  }

  _handleTileError = (_event?: TileErrorEvent) => {
    log.warn('error loading tile...')
    // TODO handle error
    this.options.onLoad()
  }

  destroy() {
    clearTimeout(this.showLoadingTimer)
    clearTimeout(this.slowTimer)
    this.options.onDestroy()
    this.tileLayer.off('loading', this._handleLoading)
    this.tileLayer.off('load', this._handleLoad)
    this.tileLayer.off('tileerror', this._handleTileError)
  }
}

export default TileLoadingMonitor
