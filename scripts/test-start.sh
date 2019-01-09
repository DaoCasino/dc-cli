

node ./bin/CLI stop || true
yarn mocha:run

rm -rf ./src/__tests__/testData/recursiveCopyDirectory/recursiveTarget
rm -rf ./src/__tests__/testData/testDapps/*

