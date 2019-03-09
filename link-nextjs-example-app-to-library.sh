#!/bin/sh

set -e

export LIBRARY_DIR=${PWD}
export EXAMPLE_DIR=${PWD}/example
export RANDOM_ID=$(openssl rand -hex 12 | cut -c 1-7)
export BUILD_ID="$(date +%s)-${RANDOM_ID}"
export WORKSPACE_DIR=/tmp/${BUILD_ID}

if [ ! -f "${LIBRARY_DIR}/package.json" ]; then
  echo expected ./package.json to exist
  exit 1
fi
if [ ! -d "$EXAMPLE_DIR" ]; then
  echo expected ./example to exist
  exit 1
fi
if [ ! -f "$EXAMPLE_DIR/package.json" ]; then
  echo expected ./example/package.json to exist
  exit 1
fi

# echo most things to error so we can pipe results to other apps
echoerr() { echo "$@" 1>&2; }

echoerr copy source code to workspace...
mkdir -p ${WORKSPACE_DIR}
cp -r ${LIBRARY_DIR} ${WORKSPACE_DIR}/library

echoerr move files around in workspace dir...
mv ${WORKSPACE_DIR}/library/example ${WORKSPACE_DIR}/example
mv ${WORKSPACE_DIR}/library ${WORKSPACE_DIR}/example/library

echoerr link the library to the example...
cd ${WORKSPACE_DIR}/example
yarn add file:./library > /dev/null 2>&1

echoerr done, linked example can be found at ${WORKSPACE_DIR}/example

echo ${WORKSPACE_DIR}/example
