!#/bin/bash

node ./bin/CLI stop || true
yarn mocha:run || true

rm -rf ./src/__tests__/testData/recursiveCopyDirectory/recursiveTarget
rm -rf ./src/__tests__/testData/testDapps/*

