# Link Next.js example app to library

Prepare a [Next.js](https://nextjs.org/docs) library's `./example` app for deployment on [now.sh](https://zeit.co/docs).

The project is copied and the configured project is placed in a temporary directory where `now` can be run. The main purpose of this script is to workaround Next's inability to work with symlinked (or `file:..` dependencies when deployed to now.

## Install

```Shell
ln -sf ${PWD}/link-nextjs-example-app-to-library.sh ~/local/bin/link-nextjs-example-app-to-library
```

## Usage

```Shell
cd $(link-nextjs-example-to-library) && now
```
