const TileLoadingMonitor = require('./TileLoadingMonitor')
// import node.js event emitter
const EventEmitter = require('events')

const log = require('loglevel')

// jest use fake timers
jest.useFakeTimers('modern')

describe('TileLoadingMonitor', () => {
  let emitter, tileLayer, showLoading, slowAlert, load, monitor

  beforeEach(() => {
    // create event emitter
    emitter = new EventEmitter()

    tileLayer = {
      on: (e, h) => {
        log.warn('on:', e, h)
        emitter.on(e, h)
      },
    }

    showLoading = jest.fn(() => {
      log.warn('fake showLoading')
    })
    slowAlert = jest.fn(() => {
      log.warn('fake slowAlert')
    })
    load = jest.fn(() => {
      log.warn('fake load')
    })
    monitor = new TileLoadingMonitor(tileLayer, {
      showLoadingThreshold: 4000,
      slowThreshold: 8000,
      onShowLoading: showLoading,
      onSlowAlert: slowAlert,
      onLoad: load,
    })
  })

  it('a normal sequence of loading', async () => {
    // run tile
    //emitter.emit("loading");
    monitor._handleLoading()

    // timer will fire after 1000ms
    jest.advanceTimersByTime(1000)
    expect(showLoading).toHaveBeenCalledTimes(0)
    expect(slowAlert).toHaveBeenCalledTimes(0)
    jest.advanceTimersByTime(4000)
    expect(showLoading).toHaveBeenCalledTimes(1)
    expect(slowAlert).toHaveBeenCalledTimes(0)
    jest.advanceTimersByTime(8000)
    expect(showLoading).toHaveBeenCalledTimes(1)
    expect(slowAlert).toHaveBeenCalledTimes(1)

    // tile loaded
    monitor._handleLoad()
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('a normal repeat map moving cause repeat loading of tile', async () => {
    // run tile
    //emitter.emit("loading");
    monitor._handleLoading()

    // timer will fire after 1000ms
    jest.advanceTimersByTime(1000)
    expect(showLoading).toHaveBeenCalledTimes(0)
    expect(slowAlert).toHaveBeenCalledTimes(0)
    jest.advanceTimersByTime(4000)
    expect(showLoading).toHaveBeenCalledTimes(1)
    expect(slowAlert).toHaveBeenCalledTimes(0)
    jest.advanceTimersByTime(8000)
    expect(showLoading).toHaveBeenCalledTimes(1)
    expect(slowAlert).toHaveBeenCalledTimes(1)

    // tile loaded
    monitor._handleLoad()
    expect(load).toHaveBeenCalledTimes(1)
  })
})
