// import response from '../../cypress/fixtures/tile/zoom_level=10&userid=1.json'
import Map from './Map'
import Requester from './Requester'
import { expect } from '@jest/globals'
jest.mock('./Requester')
let requester = Requester as jest.Mock
const response = {}

// jest.mock('./Requester')
// Use tsconfig.json type prop to add the jest package as a type

describe('Map', () => {
  beforeEach(() => {
    requester.mockClear()
  })

  // ES2015 added to lib prop within tsconfig.json to allow async/await
  it('loadInitialView', async () => {
    const request = jest.fn(() => response)
    // RMD => add all missing members
    requester.mockImplementation(() => ({
      request,
    }))
    const view: any = {}
    const map = new Map({
      userid: '1',
      width: 1440,
      height: 510,
      moreEffect: false,
      filters: {
        wallet: 'mayeda',
      },
      map: {
        // @ts-ignore
        setView: jest.fn((center, zoomLevel, animate) => {
          view.center = center
          view.zoomLevel = zoomLevel
          view.animate = animate
        }),
      },
    })
    expect(Requester).toHaveBeenCalledTimes(1)

    await map.loadInitialView()
    expect(request).toHaveBeenCalled()
    expect(view).toMatchObject({
      center: {
        lat: 18.788082619896404,
        lng: -61.031384143776386,
      },
      zoomLevel: 3,
    })
  })
})
