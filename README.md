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

## Using

import module in different app

```js
import { Map } from 'treetracker-web-map-core'
```


[npm-image]: https://img.shields.io/npm/v/treetracker-web-map-core.svg
[npm-url]: https://npmjs.org/package/treetracker-web-map-core


