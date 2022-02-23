/*
 * The main model for the treetracker model
 */
import regeneratorRuntime from 'regenerator-runtime'
import axios from 'axios'
import expect from 'expect-runtime'
import log from 'loglevel'
import _ from 'lodash'
import 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-utfgrid/L.UTFGrid'
import 'leaflet.gridlayer.googlemutant'

import mapConfig from './mapConfig'
import { getInitialBounds } from './mapTools'
import Requester from './Requester'

import EventEmitter from 'events'

import Spin from './Spin'
import Alert from './Alert'
import TileLoadingMonitor from './TileLoadingMonitor'
import ButtonPanel from './ButtonPanel'

class MapError extends Error {}

console.log('Greenstand web map core, version:')

export default class Map {
  // events
  static REGISTERED_EVENTS = {
    TREE_SELECTED: 'tree-selected',
    TREE_UNSELECTED: 'tree-unselected',
    MOVE_END: 'move-end',
  }

  constructor(options) {
    // default
    const mapOptions = {
      ...{
        L: window.L,
        minZoom: 2,
        maxZoom: 20,
        initialCenter: [20, 0],
        tileServerUrl: 'https://{s}.treetracker.org/tiles/',
        tileServerSubdomains: ['dev-k8s'],
        apiServerUrl: 'https://dev-k8s.treetracker.org/webmap/',
        width: window.innerWidth,
        height: window.innerHeight,
        debug: false,
        moreEffect: true,
        filters: {},
      },
      ...options,
    }

    Object.keys(mapOptions).forEach((key) => {
      this[key] = mapOptions[key]
    })

    // requester
    this.requester = new Requester()

    // events
    this.events = new EventEmitter()
  }

  /** *************************** static *************************** */
  static formatClusterText(count) {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${Math.floor(count / 1000)}K`
    }
    return count
  }

  static getClusterRadius(zoom) {
    switch (zoom) {
      case 1:
        return 10
      case 2:
        return 8
      case 3:
        return 6
      case 4:
        return 4
      case 5:
        return 0.8
      case 6:
        return 0.75
      case 7:
        return 0.3
      case 8:
        return 0.099
      case 9:
        return 0.095
      case 10:
        return 0.05
      case 11:
        return 0.03
      case 12:
        return 0.02
      case 13:
        return 0.008
      case 14:
        return 0.005
      case 15:
        return 0.004
      case 16:
        return 0.003
      case 17:
      case 18:
      case 19:
        return 0.0
      default:
        return 0
    }
  }

  static parseUtfData(utfData) {
    const [lon, lat] = JSON.parse(utfData.latlon).coordinates
    return {
      ...utfData,
      lat,
      lon,
    }
  }

  /** *************************** methods ************************** */
  on(eventName, handler) {
    //TODO check event name enum
    if (handler) {
      log.info('register event:', eventName)
      this.events.on(eventName, handler)
    }
  }

  //TODO remove listner

  async mount(domElement) {
    const mapOptions = {
      minZoom: this.minZoom,
      center: this.initialCenter,
      zoomControl: false,
    }

    const divContainer = document.createElement('div')
    divContainer.style.width = '100%'
    divContainer.style.height = '100%'
    divContainer.style.position = 'relative'
    divContainer.innerHTML = `
      <div id="greenstand-leaflet" style="position: relative;width: 100%;height: 100%;"></div>
      <div id="greenstand-map-spin" style="z-index: 999; position: absolute; width: 100%; top: 0px; left: 0px" ></div>
      <div id="greenstand-map-alert" style="z-index: 999; position: absolute; width: 100%; top: 0px; left: 0px" ></div>
      <div id="greenstand-map-buttonPanel" style="z-index: 999; position: absolute; top: 0px; left:50%; transform: translateX(-50%)" ></div>
    `
    domElement.appendChild(divContainer)
    const mountTarget = document.getElementById('greenstand-leaflet')
    const mountSpinTarget = document.getElementById('greenstand-map-spin')
    const mountAlertTarget = document.getElementById('greenstand-map-alert')
    this.spin = new Spin()
    this.spin.mount(mountSpinTarget)
    this.alert = new Alert()
    this.alert.mount(mountAlertTarget)

    this.map = this.L.map(mountTarget, mapOptions)
    this.map.setView(this.initialCenter, this.minZoom)
    this.map.attributionControl.setPrefix('')

    // button prev next
    {
      // next tree buttons
      const mountButtonPanelTarget = document.getElementById(
        'greenstand-map-buttonPanel',
      )
      this.buttonPanel = new ButtonPanel(
        () => this.goNextPoint(),
        () => this.goPrevPoint(),
      )
      this.buttonPanel.mount(mountButtonPanelTarget)
      this.on(Map.REGISTERED_EVENTS.TREE_SELECTED, () =>
        this.buttonPanel.show(),
      )
    }

    // load google map
    await this.loadGoogleSatellite()

    /*
     * The logic is:
     * If there is a filter, then try to zoom in and set the zoom is
     * appropriate for the filter, then load the tile.
     * But if there is a bounds ( maybe the browser was refreshed or jump
     * to the map by a shared link), then jump the bounds directly,
     * regardless of the initial view for filter.
     */
    try {
      if (this.filters.bounds) {
        await this.gotoBounds(this.filters.bounds)
      } else {
        await this.loadInitialView()
      }

      // fire load event
      if (this.onLoad) {
        this.onLoad()
      }

      // load tile
      if (this.filters.treeid) {
        log.info('treeid mode do not need tile server')
      } else if (this.filters.tree_name) {
        log.info('tree name mode do not need tile server')
      } else {
        await this.loadTileServer()
      }

      // mount event
      this.map.on('moveend', (e) => {
        log.warn('move end', e)
        this.events.emit(Map.REGISTERED_EVENTS.MOVE_END)
      })

      if (this.filters.treeid) {
        log.info('load tree by id')
        await this.loadTree(this.filters.treeid)
      }

      if (this.filters.tree_name) {
        log.info('load tree by name')
        await this.loadTree(undefined, this.filters.tree_name)
      }

      // load freetown special map
      await this.loadFreetownLayer()

      if (this.debug) {
        await this.loadDebugLayer()
      }
    } catch (e) {
      log.error('get error when load:', e)
      if (e instanceof MapError) {
        log.error('map error:', e)
        if (this.onError) {
          this.onError(e)
        }
      }
    }
  }

  async loadGoogleSatellite() {
    const GoogleLayer = window.L.TileLayer.extend({
      createTile(coords, done) {
        const tile = document.createElement('img')

        window.L.DomEvent.on(
          tile,
          'load',
          window.L.Util.bind(this._tileOnLoad, this, done, tile),
        )
        window.L.DomEvent.on(
          tile,
          'error',
          window.L.Util.bind(this._tileOnError, this, done, tile),
        )

        if (this.options.crossOrigin || this.options.crossOrigin === '') {
          tile.crossOrigin =
            this.options.crossOrigin === true ? '' : this.options.crossOrigin
        }

        /*
          Alt tag is set to empty string to keep screen readers from reading URL and for compliance reasons
          http://www.w3.org/TR/WCAG20-TECHS/H67
        */
        tile.alt = ''

        /*
          Set role="presentation" to force screen readers to ignore this
          https://www.w3.org/TR/wai-aria/roles#textalternativecomputation
        */
        tile.setAttribute('role', 'presentation')

        // filter out blank pic for freetown
        if (
          (coords.z === 12 &&
            coords.x <= 1895 &&
            coords.x >= 1889 &&
            coords.y >= 1944 &&
            coords.y <= 1956) ||
          (coords.z === 13 &&
            coords.x <= 3791 &&
            coords.x >= 3779 &&
            coords.y >= 3894 &&
            coords.y <= 3909) ||
          (coords.z === 14 &&
            coords.x <= 7583 &&
            coords.x >= 7563 &&
            coords.y >= 7800 &&
            coords.y <= 7817) ||
          (coords.z === 15 &&
            coords.x <= 15167 &&
            coords.x >= 14967 &&
            coords.y >= 15600 &&
            coords.y <= 15620)
        ) {
          tile.src =
            'https://khms0.googleapis.com/kh?v=903&hl=en&x=3792&y=3905&z=13'
        } else {
          tile.src = this.getTileUrl(coords)
        }

        return tile
      },
    })

    log.warn('load google satellite map')
    this.layerGoogle = new GoogleLayer(
      'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
      {
        maxZoom: this.maxZoom,
        attribution:
          '<a href="HTTP://map.google.com" target=”_blank”>Map data &nbsp; © Google</a> ' +
          '&nbsp<a href="HTTP://greenstand.org" target=”_blank”>© Greenstand.</a>',
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        zIndex: 0,
      },
    )
    this.layerGoogle.addTo(this.map)
    await new Promise((res) => {
      this.layerGoogle.once('load', async () => {
        log.warn('google layer loaded')
        res()
      })
    })
  }

  async gotoBounds(bounds) {
    const [southWestLng, southWestLat, northEastLng, northEastLat] =
      bounds.split(',')
    log.warn('go to bounds:', bounds)
    if (this.moreEffect) {
      this.map.flyToBounds([
        [southWestLat, southWestLng],
        [northEastLat, northEastLng],
      ])
      log.warn('waiting bound load...')
      await new Promise((res) => {
        const boundFinished = () => {
          log.warn('fire bound finished')
          this.map.off('moveend')
          res()
        }
        this.map.on('moveend', boundFinished)
      })
    } else {
      this.map.fitBounds(
        [
          [southWestLat, southWestLng],
          [northEastLat, northEastLng],
        ],
        { animate: false },
      )
      // no effect, return directly
    }
  }

  async loadTileServer() {
    const { iconSuiteQueryString } = this.getIconSuiteParameters(this.iconSuite)
    // tile
    const filterParameters = this.getFilterParameters()
    const filterParametersString = filterParameters
      ? `&${filterParameters}`
      : ''
    this.layerTile = new this.L.tileLayer(
      `${this.tileServerUrl}{z}/{x}/{y}.png?icon=${iconSuiteQueryString}${filterParametersString}`,
      {
        minZoom: this.minZoom,
        maxZoom: this.maxZoom,
        // close to avoid too many requests
        updateWhenZooming: false,
        // updateWhenIdle: true,
        zIndex: 99999,
        subdomains: this.tileServerSubdomains,
        //errorTileUrl: 'http://localhost:5000/nodata.png',
        errorTileUrl:
          'data:image/png;base64,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',
      },
    )
    // spin monitor
    this.tileLoadingMonitor = new TileLoadingMonitor(this.layerTile, {
      showLoadingThreshold: 4000,
      slowThreshold: 8000,
      onShowLoading: () => {
        log.warn('show loading')
        this.spin.show()
      },
      onSlowAlert: () => {
        log.warn('slow alert')
        this.alert.show('Trees grow slower than this map loads, be patient...')
      },
      onLoad: () => {
        log.warn('load finished')
        this.spin.hide()
        this.alert.hide()
      },
    })
    this.layerTile.addTo(this.map)

    this.layerUtfGrid = new this.L.utfGrid(
      `${this.tileServerUrl}{z}/{x}/{y}.grid.json?icon=${iconSuiteQueryString}${filterParametersString}`,
      {
        minZoom: this.minZoom,
        maxZoom: this.maxZoom,
        // close to avoid too many requests
        updateWhenZooming: false,
        // updateWhenIdle: false,
        zIndex: 9,
        subdomains: this.tileServerSubdomains,
      },
    )
    this.layerUtfGrid.on('click', (e) => {
      log.warn('click:', e)
      if (e.data) {
        this.clickMarker(Map.parseUtfData(e.data))
      }
    })

    this.layerUtfGrid.on('mouseover', (e) => {
      log.debug('mouseover:', e)
      this.highlightMarker(Map.parseUtfData(e.data))
    })

    this.layerUtfGrid.on('mouseout', (e) => {
      log.debug('e:', e)
      this.unHighlightMarker()
    })

    this.layerUtfGrid.on('load', () => {
      log.info('all grid loaded!')
      this.checkArrow()
    })

    this.layerUtfGrid.on('tileunload', (e) => {
      log.warn('tile unload:', e)
      e.tile.cancelRequest()
    })

    this.layerUtfGrid.on('tileloadstart', () => {
      // log.warn("tile tileloadstart:", e);
    })

    this.layerUtfGrid.on('tileload', () => {
      log.warn('tile load!')
    })

    this.layerUtfGrid.on('tileerror', () => {
      log.error('tile error!')
    })

    this.layerUtfGrid.on('loading', () => {
      log.warn('tile load begin...')
    })

    this.layerUtfGrid.addTo(this.map)

    // bind the finding marker function
    this.layerUtfGrid.hasMarkerInCurrentView = () => {
      // waiting layer is ready
      const isLoading = this.layerUtfGrid.isLoading()
      log.warn('utf layer is loading:', isLoading)
      if (isLoading) {
        log.error('can not handle the grid utf check when loading, cancel!')
        return false
      }
      const begin = Date.now()
      let found = false
      let count = 0
      let countNoChar = 0
      const { x, y } = this.map.getSize()
      // eslint-disable-next-line no-restricted-syntax
      me: for (let y1 = 0; y1 < y; y1 += 10) {
        for (let x1 = 0; x1 < x; x1 += 10) {
          count += 1
          const tileChar = this.layerUtfGrid._objectForEvent({
            latlng: this.map.containerPointToLatLng([x1, y1]),
          })._tileCharCode
          if (!tileChar) {
            countNoChar += 1
            // log.warn("can not fond char on!:", x1, y1);
            continue
          }
          const m = tileChar.match(/\d+:\d+:\d+:(\d+)/)
          if (!m) throw new Error(`Wrong char: ${tileChar}`)
          if (m[1] !== '32') {
            log.log('find:', tileChar, 'at:', x1, y1)
            found = true
            break me
          }
        }
      }
      log.warn(
        'Take time:%d, count:%d,%d,found:%s',
        Date.now() - begin,
        count,
        countNoChar,
        found,
      )
      return found
    }
  }

  async unloadTileServer() {
    if (this.map.hasLayer(this.layerTile)) {
      this.map.removeLayer(this.layerTile)
    } else {
      log.warn('try to remove nonexisting tile layer')
    }
    if (this.map.hasLayer(this.layerUtfGrid)) {
      this.map.removeLayer(this.layerUtfGrid)
    } else {
      log.warn('try to remove nonexisting grid layer')
    }
  }

  async loadDebugLayer() {
    // debug
    this.L.GridLayer.GridDebug = this.L.GridLayer.extend({
      createTile(coords) {
        const tile = document.createElement('div')
        tile.style.outline = '1px solid green'
        tile.style.fontWeight = 'bold'
        tile.style.fontSize = '14pt'
        tile.style.color = 'white'
        tile.innerHTML = [coords.z, coords.x, coords.y].join('/')
        return tile
      },
    })
    this.L.gridLayer.gridDebug = (opts) => new this.L.GridLayer.GridDebug(opts)
    this.map.addLayer(this.L.gridLayer.gridDebug())

    // debug marker
    const locations = [
      [0, 0],
      //      [66.51326044401628,90.0000000003387],
      //      [85.05112874755162,179.9999996159564],
      //      [47.98992166812654,54.84375000033869],
      //      [85.05112874735956,179.9999996159564],
      //      [-54.84375000033869,85.05112874735956,-179.9999996159564,47.98992166812654],
      //      [-90,85.0511287798066,-180,66.51326044311185],
      // tile 2,2,1
      [0, 0],
      [66.51326044311185, 90],
      [-33.13755119215213, -35.15624999906868],
      [77.15716252285503, 125.1562500009313],
      // tile 2,1,0
      [47.98992166905786, -125.1562500009314],
      [85.05112874829089, 35.15624999906871],
      // test
      [77.157162522661, -125.15625],
      [80.87282721505686, 35.15625],
    ]
    const debugIcon = this.L.divIcon({ className: 'debug-icon' })
    locations.forEach((l) => {
      this.L.marker(l, {
        icon: debugIcon,
      })
        .bindTooltip(l.join(','))
        .addTo(this.map)
    })
  }

  async loadTree(treeid, treeName) {
    let res
    if (treeid) {
      res = await this.requester.request({
        url: `${this.apiServerUrl}tree?tree_id=${treeid}`,
      })
    } else if (treeName) {
      res = await this.requester.request({
        url: `${this.apiServerUrl}tree?tree_name=${treeName}`,
      })
    } else {
      log.error('do not support')
    }
    const { lat, lon, id } = res
    const data = {
      id,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
    }
    this.selectMarker(data)
    if (this.onClickTree) {
      this.onClickTree(data)
    }
  }

  highlightMarker(data) {
    const { iconSuiteClass } = this.getIconSuiteParameters(this.iconSuite)
    if (data.type === 'point') {
      this.layerHighlight = new this.L.marker([data.lat, data.lon], {
        icon: new this.L.DivIcon({
          className: 'greenstand-point-highlight',
          html: `
                <div class="greenstand-point-highlight-box ${iconSuiteClass}"  >
                <div></div>
                </div>
              `,
          iconSize: iconSuiteClass ? [64, 64] : [32, 32],
        }),
      })
    } else if (data.type === 'cluster') {
      this.layerHighlight = new this.L.marker([data.lat, data.lon], {
        icon: new this.L.DivIcon({
          className: 'greenstand-cluster-highlight',
          html: `
                <div class="greenstand-cluster-highlight-box ${iconSuiteClass} ${
            data.count > 1000 && !iconSuiteClass ? '' : 'small'
          }">
                <div>${Map.formatClusterText(data.count)}</div>
                </div>
              `,
        }),
      })
    } else {
      throw new Error('wrong type:', data)
    }
    this.layerHighlight.addTo(this.map)
  }

  unHighlightMarker() {
    if (this.map.hasLayer(this.layerHighlight)) {
      this.map.removeLayer(this.layerHighlight)
    } else {
      log.warn('try to remove nonexisting layer')
    }
  }

  clickMarker(data) {
    this.unHighlightMarker()
    if (data.type === 'point') {
      this.selectMarker(data)
      if (this.onClickTree) {
        this.onClickTree(data)
      }
    } else if (data.type === 'cluster') {
      if (data.zoom_to) {
        log.info('found zoom to:', data.zoom_to)
        const [lon, lat] = JSON.parse(data.zoom_to).coordinates
        // NOTE do cluster click
        if (this.moreEffect) {
          this.map.flyTo([lat, lon], this.map.getZoom() + 2)
        } else {
          this.map.setView([lat, lon], this.map.getZoom() + 2, {
            animate: false,
          })
        }
      } else if (this.moreEffect) {
        this.map.flyTo([data.lat, data.lon], this.map.getZoom() + 2)
      } else {
        this.map.setView([data.lat, data.lon], this.map.getZoom() + 2, {
          animate: false,
        })
      }
    } else {
      throw new Error('do not support type:', data.type)
    }
  }

  selectMarker(data) {
    const { iconSuiteClass } = this.getIconSuiteParameters(this.iconSuite)
    log.info('change tree mark selected with data:', data)
    // before set the selected tree icon, remote if any
    this.unselectMarker()

    // set the selected marker
    this.layerSelected = new this.L.marker([data.lat, data.lon], {
      icon: new window.L.DivIcon({
        className: 'greenstand-point-selected',
        html: `
            <div class="greenstand-point-selected-box ${iconSuiteClass}"  >
            <div></div>
            </div>
          `,
        iconSize: iconSuiteClass ? [64, 64] : [32, 32],
      }),
    })
    this.layerSelected.payload = data
    this.layerSelected.addTo(this.map)

    this.events.emit(Map.REGISTERED_EVENTS.TREE_SELECTED, data)
  }

  unselectMarker() {
    this.events.emit(
      Map.REGISTERED_EVENTS.TREE_UNSELECTED,
      this.layerSelected?.payload,
    )

    if (this.map.hasLayer(this.layerSelected)) {
      this.map.removeLayer(this.layerSelected)
    } else {
      log.warn('try to remove nonexisting layer selected')
    }
  }

  async loadInitialView() {
    let view
    const calculateInitialView = async () => {
      const url = `${
        this.apiServerUrl
      }trees?clusterRadius=${Map.getClusterRadius(
        10,
      )}&zoom_level=10&${this.getFilterParameters()}`
      log.info('calculate initial view with url:', url)
      const response = await this.requester.request({
        url,
      })
      const items = response.data.map((i) => {
        if (i.type === 'cluster') {
          const c = JSON.parse(i.centroid)
          return {
            lat: c.coordinates[1],
            lng: c.coordinates[0],
          }
        }
        if (i.type === 'point') {
          return {
            lat: i.lat,
            lng: i.lon,
          }
        }
        return null
      })
      if (items.length === 0) {
        log.info('Can not find data')
        throw new MapError('Can not find any data')
      }
      return getInitialBounds(items, this.width, this.height)
    }
    if (this.filters.userid || this.filters.wallet) {
      log.warn('try to get initial bounds')
      view = await calculateInitialView()
    } else if (this.filters.treeid || this.filters.tree_name) {
      const { treeid, tree_name } = this.filters
      const url = `${this.apiServerUrl}tree?${
        treeid ? `tree_id=${treeid}` : `tree_name=${tree_name}`
      }`
      log.info('url to load tree:', url)
      const res = await this.requester.request({
        url,
      })
      log.warn('res:', res)
      if (!res) {
        throw new MapError('Can not find any data')
      }
      const { lat, lon } = res
      view = {
        center: {
          lat,
          lon,
        },
        zoomLevel: 16,
      }
    } else if (this.filters.map_name) {
      log.info('to init org map')
      if (mapConfig[this.filters.map_name]) {
        const { zoom, center } = mapConfig[this.filters.map_name]
        log.info('there is setting for map init view:', zoom, center)
        view = {
          center: {
            lat: center.lat,
            lon: center.lng,
          },
          zoomLevel: zoom,
        }
      } else {
        view = await calculateInitialView()
      }
    }

    // jump to initial view
    if (view) {
      if (this.moreEffect) {
        this.map.flyTo(view.center, view.zoomLevel)
        log.warn('waiting initial view load...')
        await new Promise((res) => {
          const finished = () => {
            log.warn('fire initial view finished')
            this.map.off('moveend')
            res()
          }
          this.map.on('moveend', finished)
        })
      } else {
        this.map.setView(view.center, view.zoomLevel, { animate: false })
      }
    }
  }

  getIconSuiteParameters(iconSuite) {
    switch (iconSuite) {
      case 'ptk-s':
        return { iconSuiteClass: 'green-s', iconSuiteQueryString: 'ptk-s' }
      case 'ptk-b':
        return { iconSuiteClass: 'green-b', iconSuiteQueryString: 'ptk-b' }
      default:
        return { iconSuiteClass: '', iconSuiteQueryString: 'o' }
    }
  }

  getFilters() {
    const filters = {}
    if (this.filters.userid) {
      filters.userid = this.filters.userid
    }
    if (this.filters.wallet) {
      filters.wallet = this.filters.wallet
    }
    if (this.filters.treeid) {
      filters.treeid = this.filters.treeid
    }
    if (this.filters.timeline) {
      filters.timeline = this.filters.timeline
    }
    if (this.filters.map_name) {
      filters.map_name = this.filters.map_name
    }
    return filters
  }

  getFilterParameters() {
    const filter = this.getFilters()
    const queryUrl = Object.keys(filter).reduce(
      (a, c) => `${c}=${filter[c]}${(a && `&${a}`) || ''}`,
      '',
    )
    return queryUrl
  }

  //  getClusterRadius(zoomLevel){
  //    //old code
  //    //var clusterRadius = getQueryStringValue("clusterRadius") || getClusterRadius(queryZoomLevel);
  //    return Map.getClusterRadius(zoomLevel);
  //  }

  getCurrentBounds() {
    return this.map.getBounds().toBBoxString()
  }

  getLeafletMap() {
    return this.map
  }

  goNextPoint() {
    log.info('go next tree')
    const currentPoint = this.layerSelected.payload
    expect(currentPoint).match({
      lat: expect.any(Number),
    })
    const points = this.getPoints()
    const index = points.reduce((a, c, i) => {
      if (c.id === currentPoint.id) {
        return i
      }
      return a
    }, -1)
    if (index !== -1) {
      if (index === points.length - 1) {
        log.info('no more next')
        return false
      }
      const nextPoint = points[index + 1]
      this.clickMarker(nextPoint)
    } else {
      log.error('can not find the point:', currentPoint, points)
      throw new Error('can not find the point')
    }
    return null
  }

  goPrevPoint() {
    log.info('go previous tree')
    const currentPoint = this.layerSelected.payload
    expect(currentPoint).match({
      lat: expect.any(Number),
    })
    const points = this.getPoints()
    const index = points.reduce((a, c, i) => {
      if (c.id === currentPoint.id) {
        return i
      }
      return a
    }, -1)
    if (index !== -1) {
      if (index === 0) {
        log.info('no more previous')
        return false
      }
      const prevPoint = points[index - 1]
      this.clickMarker(prevPoint)
    } else {
      log.error('can not find the point:', currentPoint, points)
      throw new Error('can not find the point')
    }
    return null
  }

  /*
   * To get all the points on the map, (tree markers), now, the way to
   * achieve this is that go through the utf grid and get all data.
   */
  getPoints() {
    // fetch all the point data in the cache
    const itemList = Object.values(this.layerUtfGrid._cache)
      .map((e) => e.data)
      .filter((e) => Object.keys(e).length > 0)
      .reduce((a, c) => a.concat(Object.values(c)), [])
      .map((data) => Map.parseUtfData(data))
      .filter((data) => data.type === 'point')
    log.info('loaded data in utf cache:', itemList.length)

    // filter the duplicate points
    const itemMap = {}
    itemList.forEach((e) => {
      itemMap[e.id] = e
    })

    // update the global points
    const points = Object.values(itemMap)
    log.warn('find points:', points.length)
    log.warn('find points:', points)
    return points
  }

  async rerender() {
    log.info('rerender')
    log.info('reload tile')
    this.unloadTileServer()
    this.loadTileServer()
  }

  /*
   * reset the config of map instance
   */
  setFilters(filters) {
    this.filters = filters
  }

  async loadFreetownLayer() {
    log.info('load freetown layer')
    this.L.TileLayer.FreeTown = this.L.TileLayer.extend({
      getTileUrl(coords) {
        const y = 2 ** coords.z - coords.y - 1
        const url = `https://treetracker-map-tiles.nyc3.cdn.digitaloceanspaces.com/freetown/${coords.z}/${coords.x}/${y}.png`
        if (coords.z === 10 && coords.x === 474 && y < 537 && y > 534) {
          return url
        }
        if (
          coords.z === 11 &&
          coords.x > 947 &&
          coords.x < 950 &&
          y > 1070 &&
          y < 1073
        ) {
          return url
        }
        if (
          coords.z === 12 &&
          coords.x > 1895 &&
          coords.x < 1899 &&
          y > 2142 &&
          y < 2146
        ) {
          return url
        }
        if (
          coords.z === 13 &&
          coords.x > 3792 &&
          coords.x < 3798 &&
          y > 4286 &&
          y < 4291
        ) {
          return url
        }
        if (
          coords.z === 14 &&
          coords.x > 7585 &&
          coords.x < 7595 &&
          y > 8574 &&
          y < 8581
        ) {
          return url
        }
        if (
          coords.z === 15 &&
          coords.x > 15172 &&
          coords.x < 15190 &&
          y > 17149 &&
          y < 17161
        ) {
          return url
        }
        if (
          coords.z === 16 &&
          coords.x > 30345 &&
          coords.x < 30379 &&
          y > 34300 &&
          y < 34322
        ) {
          return url
        }
        if (
          coords.z === 17 &&
          coords.x > 60692 &&
          coords.x < 60758 &&
          y > 68602 &&
          y < 68643
        ) {
          return url
        }
        if (
          coords.z === 18 &&
          coords.x > 121385 &&
          coords.x < 121516 &&
          y > 137206 &&
          y < 137286
        ) {
          return url
        }
        return '/'
      },
    })

    this.L.tileLayer.freeTown = () => new this.L.TileLayer.FreeTown()

    this.L.tileLayer
      .freeTown('', {
        maxZoom: this.maxZoom,
        tileSize: this.L.point(256, 256),
        zIndex: 4,
      })
      .addTo(this.map)

    const data = await new Promise((res, rej) => {
      axios
        .get(
          'https://treetracker-map-features.fra1.digitaloceanspaces.com/freetown_catchments.geojson',
        )
        .then((response) => {
          log.info('Begin load freetown geojson')
          expect(response)
            .property('data')
            .property('features')
            .a(expect.any(Array))
          res(response.data.features)
        })
        .catch((e) => {
          log.error('get error when load geojson', e)
          rej(e)
        })
    })

    const style = {
      color: 'green',
      weight: 1,
      opacity: 1,
      fillOpacity: 0,
    }

    this.layerFreetownGeoJson = this.L.geoJSON(data, {
      style,
    })

    this.map.on('zoomend', () => {
      log.debug('zoomend for geojson')
      // check freetown geo json
      if (!this.layerFreetownGeoJson) {
        log.debug('geo json not load')
      } else {
        const zoomLevel = this.map.getZoom()
        if (zoomLevel > 12) {
          log.debug('should show geo json')
          if (!this.map.hasLayer(this.layerFreetownGeoJson)) {
            this.map.addLayer(this.layerFreetownGeoJson)
          }
        } else {
          log.debug('should hide geo json')
          if (this.map.hasLayer(this.layerFreetownGeoJson)) {
            this.map.removeLayer(this.layerFreetownGeoJson)
          }
        }
      }
    })
  }

  async checkArrow() {
    log.info('check arrow...')
    if (this.layerUtfGrid.hasMarkerInCurrentView()) {
      log.info('found marker')
    } else {
      log.info('no marker')
      const nearest = await this.getNearest()
      if (nearest) {
        const placement = this.calculatePlacement(nearest)
        if (this.onFindNearestAt) {
          this.onFindNearestAt(placement)
        }
      } else {
        log.warn("Can't get the nearest:", nearest)
      }
    }
  }

  async getNearest() {
    const center = this.map.getCenter()
    log.log('current center:', center)
    const zoom_level = this.map.getZoom()
    const res = await this.requester.request({
      url: `${this.apiServerUrl}nearest?zoom_level=${zoom_level}&lat=${center.lat}&lng=${center.lng}`,
    })
    if (!res) {
      log.warn('Return undefined trying to get nearest, the api return null')
      return null
    }
    let { nearest } = res
    nearest = nearest
      ? {
          lat: nearest.coordinates[1],
          lng: nearest.coordinates[0],
        }
      : undefined
    log.log('get nearest:', nearest)
    return nearest
  }

  /*
   * Given a point, calculate the where is it relative to the map view
   * return:
   *  west | east | north | south | in (the point is in the map view)
   */
  calculatePlacement(location) {
    const center = this.map.getCenter()
    log.info('calculate location', location, ' to center:', center)
    // find it
    // get nearest markers
    expect(location.lat).number()
    expect(location.lng).number()
    let result
    if (
      !this.map.getBounds().contains({
        lat: location.lat,
        lng: location.lng,
      })
    ) {
      log.log('out of bounds, display arrow')
      const dist = {
        lat: location.lat,
        lng: location.lng,
      }
      const distanceLat = window.L.CRS.EPSG3857.distance(
        center,
        window.L.latLng(dist.lat, center.lng),
      )
      log.log('distanceLat:', distanceLat)
      expect(distanceLat).number()
      const distanceLng = window.L.CRS.EPSG3857.distance(
        center,
        window.L.latLng(center.lat, dist.lng),
      )
      log.log('distanceLng:', distanceLng)
      expect(distanceLng).number()
      log.log('dist:', dist)
      log.log('center:', center, center.lat)
      if (dist.lat > center.lat) {
        log.log('On the north')
        if (distanceLat > distanceLng) {
          log.log('On the north')
          result = 'north'
        } else if (dist.lng > center.lng) {
          log.log('On the east')
          result = 'east'
        } else {
          log.log('On the west')
          result = 'west'
        }
      } else {
        log.log('On the south')
        if (distanceLat > distanceLng) {
          log.log('On the south')
          result = 'south'
        } else if (dist.lng > center.lng) {
          log.log('On the east')
          result = 'east'
        } else {
          log.log('On the west')
          result = 'west'
        }
      }
    } else {
      result = 'in'
    }
    log.info('placement:', result)
    expect(result).oneOf(['north', 'south', 'west', 'east', 'in'])
    return result
  }

  goto(location) {
    log.info('goto:', location)
    this.map.panTo(location)
  }

  flyTo(lat, lon, zoomLevel) {
    log.info('fly to:', lat, lon, zoomLevel)
    this.map.flyTo([lat, lon], zoomLevel)
  }
}
