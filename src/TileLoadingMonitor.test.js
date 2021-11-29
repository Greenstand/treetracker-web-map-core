const TileLoadingMonitor = require('./TileLoadingMonitor');
// import node.js event emitter
const EventEmitter = require('events');

const log = require('loglevel');

// jest use fake timers
jest.useFakeTimers("modern");

describe("TileLoadingMonitor", () => {

  it("be able to fire 'showLoading' event", async () => {
    // create event emitter
    const emitter = new EventEmitter();

    const tileLayer = {
      on: (e, h) => {log.warn("on:", e, h); emitter.on(e, h)},
    };

    const showLoading = jest.fn(() => {
      log.warn("fake showLoading");
    });
    const slowAlert = jest.fn(() => {
      log.warn("fake slowAlert");
    });
    const monitor = new TileLoadingMonitor(tileLayer, {
      showLoadingThreshold: 4000,
      slowThreshold: 8000,
      onShowLoading: showLoading,
      onSlowAlert: slowAlert,
    });

    // run tile
    //emitter.emit("loading");
    monitor.handleLoading();

    // timer will fire after 1000ms
    jest.advanceTimersByTime(1000);
    expect(showLoading).toHaveBeenCalledTimes(0);
    expect(slowAlert).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(4000);
    expect(showLoading).toHaveBeenCalledTimes(1);
    expect(slowAlert).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(8000);
    expect(showLoading).toHaveBeenCalledTimes(1);
    expect(slowAlert).toHaveBeenCalledTimes(1);

  })

})