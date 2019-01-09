

node ./bin/CLI stop || true
yarn mocha:run || exit 1

rm -rf ./src/__tests__/testData/recursiveCopyDirectory/recursiveTarget
rm -rf ./src/__tests__/testData/testDapps/*

