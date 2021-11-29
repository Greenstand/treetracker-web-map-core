/*
 * A model for monitoring the loading of tiles.
  */
const log = require("loglevel");

class TileLoadingMonitor {
  constructor(tileLayer, options) {
    // the monitor should know about the tile layer
    // and how to manipulate and listen to it
    this.tileLayer = tileLayer;
    this.options = {
      ...{
        //default options
      },
      ...options,
    }

    this.tileLayer.on("loading", this.handleLoading);

    this.showLoadingTimer = undefined;
    this.slowTimer = undefined;
  }

  handleLoading = (event) => {
    log.warn("start loading tile...");
    log.warn("wait for show loading for %d sed", this.options.showLoadingThreshold);
    this.showLoadingTimer = setTimeout(() => {
      log.warn("show loading...");
      this.options.onShowLoading();
    }, this.options.showLoadingThreshold);
    this.slowTimer = setTimeout(() => {
      log.warn("show slow...");
      this.options.onSlowAlert();
    }, this.options.slowThreshold);
    
  }

}

module.exports = TileLoadingMonitor;