#!/usr/bin/env bash
URL="https://docs.docker.com/install"
URL_MAC="https://docs.docker.com/docker-for-mac/install/"
URL_LINUX="https://docs.docker.com/install/linux/docker-ce/ubuntu/"
URL_WIN="https://docs.docker.com/docker-for-windows/install/"
URL_NODE="https://nodejs.org/en/download/package-manager/"

if ! [ -x "$(command -v docker)" ]; then
  clear
  echo ""
  echo "   Warning: docker is not installed" >&2
  echo "   Read instructions: $URL"
  echo ""
  sleep 3
  exit 1
fi

if ! [ -x "$(command -v docker-compose)" ]; then
  clear
  echo ""
  echo "   Warning: docker-compose is not installed" >&2
  echo "   Read instructions: $URL"
  echo ""
  sleep 3
  exit 1
fi

# if ! [ -x "$(command -v truffle)" ]; then
#   echo ''
#   echo 'ERROR: truffle is not installed'>&2
#   echo '================================='
#   echo '|  please use npm i -g truffle  |'
#   echo '================================='
#   echo ''
#   exit 1
# fi