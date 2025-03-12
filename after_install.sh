#!/bin/sh

npx typeorm migration:run -d /usr/src/app/build/src/data-source.js

node /usr/src/app/build/src/index.js