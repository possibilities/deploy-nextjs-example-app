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

if [[ "$@" == "--alias" ]]; then export RUN_NOW_ALIAS=1; fi

echo copy source code to workspace...
mkdir -p ${WORKSPACE_DIR}
cp -r ${LIBRARY_DIR} ${WORKSPACE_DIR}/library

echo move files around in workspace dir...
mv ${WORKSPACE_DIR}/library/example ${WORKSPACE_DIR}/example
mv ${WORKSPACE_DIR}/library ${WORKSPACE_DIR}/example/library

echo link the library to the example...
cd ${WORKSPACE_DIR}/example
yarn add file:./library > /dev/null 2>&1

echo done preparation, temporary workspace is at "${WORKSPACE_DIR}/example"

echo create now.sh deployment...
export DEPLOYMENT_URL=$(now --no-clipboard > /dev/null)
echo done deploying, app is available at "${DEPLOYMENT_URL}"

if [ ! -z ${RUN_NOW_ALIAS} ];
then
  echo create alias to latest deployment...
  export ALIAS_URL=$(now alias set $DEPLOYMENT_URL > /dev/null)
  echo done aliasing, app is available at ${ALIAS_URL}
fi

