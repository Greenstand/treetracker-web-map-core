# treetracker-web-map-core

This is the core module for Greenstand web map application.

## Dev Server

```sh
npm run dev
```

## Testing

### Integration Tests With Cypress

```sh
npm run cy
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
