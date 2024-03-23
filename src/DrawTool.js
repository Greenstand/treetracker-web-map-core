import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'

class DrawTool {
  constructor(map) {
    this.map = map
    this.isDrawingMode = false
    this._loadEditor()
    this.onSelecetMultTree = null
  }
  onSelecetMultiplePoints(funct) {
    this.onSelecetMultPoints = funct
  }
  async _loadEditor() {
    // FeatureGroup is to store editable layers
    var drawnItems = new window.L.FeatureGroup()
    this.map.addLayer(drawnItems)
    var drawControl = new window.L.Control.Draw({
      draw: {
        marker: false,
        polyline: false,
        circlemarker: false,
        circle: false,
        polygon: {
          allowIntersection: false,
        },
      },
      edit: {
        featureGroup: drawnItems,
        poly: {
          allowIntersection: false,
        },
      },
    })
    var editOnlyControl = new window.L.Control.Draw({
      draw: false,
      edit: {
        featureGroup: drawnItems,
        poly: {
          allowIntersection: false,
        },
      },
    })
    this.map.addControl(drawControl)

    this.map.on('draw:created', async (e) => {
      let layer = e.layer
      let points = layer._latlngs[0]
      drawnItems.addLayer(layer)
      //disable draw tool
      this.map.removeControl(drawControl)
      this.map.addControl(editOnlyControl)
      if (this.onSelecetMultPoints) {
        this.onSelecetMultPoints(points)
      }
    })
    this.map.on('draw:edited', async (e) => {
      let layers = e.layers._layers
      let polygon = Object.values(layers)[0]
      if (polygon) {
        if (this.onSelecetMultPoints) {
          this.onSelecetMultPoints(polygon._latlngs[0])
        }
      }
    })
    this.map.on('draw:deleted', async (e) => {
      //enable draw tool if all polygons deleted
      if (drawnItems.getLayers().length == 0) {
        this.map.removeControl(editOnlyControl)
        this.map.addControl(drawControl)
      }
    })
    //enable drawing mode which prevent user move when clicking on icon tree or group
    this.map.on('draw:drawstart	', (e) => {
      this.isDrawingMode = true
    })
    this.map.on('draw:drawstop	', (e) => {
      this.isDrawingMode = false
    })
    this.map.on('draw:editstart	', (e) => {
      this.isDrawingMode = true
    })
    this.map.on('draw:editstop	', (e) => {
      this.isDrawingMode = false
    })
  }
}
export default DrawTool
