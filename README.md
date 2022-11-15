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

this function will trigger rerendering of the map.

- manipulate the map:

  - gotoView(lat, lon, zoomLevel)
  - gotoBounds(bounds)
  - getInitialViewer() // get an appropriate view for the current map with filters
  - selectTree(treeObject)

_check `dist/index.html` for a demo_

[npm-image]: https://img.shields.io/npm/v/treetracker-web-map-core.svg
[npm-url]: https://npmjs.org/package/treetracker-web-map-core

# how to debug the core on the client side

The senerio: sometime we need to find a easy way to debug the core in the client side, for example, the web map client repo, it's installing the core by npm, so it's hard to change code in core on the client side, we can install the core by `folder` locally, and get the change on the client side immediately, to do so:

1. Download the web map core repository, `git clonet [path to repo]`
1. Change to code you want in core
1. Change the version number in `package.json` (this is neccessary, if don't do it, it's posssible the client will ignore/skip the installment)
1. Generate the bundle: `npm run pre-publish` (this is nessessary, the npm will fetch the bundle file rather than the src files)
1. Install the core in web map client: `npm install --save [relative path to the core folder]`
1. Restart the web map client
