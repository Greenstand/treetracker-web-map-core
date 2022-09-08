# treetracker-web-map-core

This is the core module for Greenstand web map application.

[![NPM Version][npm-image]][npm-url]

## Dev Server

```sh
npm run dev
```

## Testing

### Integration Tests With Cypress

```sh
npm run cy
```

## Debuging

To open detailed log (default is WARN), set the loglevel as below:

![image](https://user-images.githubusercontent.com/5744708/153115923-297b0f2f-c74b-4867-b9a0-7346a20f2ff1.png)

## Linting and Formatting

**_Note: All of these actions will be automatically run when appropriate with lint-staged during the git pre-commit stage._**

check for lint errors

```sh
npm run lint
```

check for lint errors with auto fix

```sh
npm run lint:fix
```

format with prettier

```sh
npm run format
```

sort package.json

```sh
npx sort-package-json
```

## Publishing

build project as production module

```sh
npm run pre-publish
```

execute the github action to release the tag.

check issue 41 [here](https://github.com/Greenstand/treetracker-web-map-core/issues/41)

## Usage

import module in different app

```js
import { Map } from 'treetracker-web-map-core'
```

### API

- construction:

```
map = new Map({
    onLoad: () => console.log("onload"),
    onClickTree: () => console.log("onClickTree"),
    onFindNearestAt: () => console.log("onFindNearstAt"),
    onError: () => console.log("onError"),
});
```

- listen to map events:

```
  map.on("moveEnd", handleMoveEnd);
```

- set the filter for the map:

```
map.setFilters({
  userid: 940,
})
```

- manipulate the map:

  - gotoView(lat, lon, zoomLevel)
  - gotoBounds(bounds)
  - getInitialViewer() // get an appropriate view for the current map with filters
  - selectTree(treeObject)

_check `dist/index.html` for a demo_

[npm-image]: https://img.shields.io/npm/v/treetracker-web-map-core.svg
[npm-url]: https://npmjs.org/package/treetracker-web-map-core
