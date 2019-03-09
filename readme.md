# Link Next.js example app to library

Prepares a [Next.js](https://nextjs.org/docs) library's `./example` app for deployment on [now.sh](https://zeit.co/docs).

The project is copied and the configured project is placed in a temporary directory where `now` can be run. The main purpose of this script is to workaround Next's <a href='#is-this-really-necessary' id='fnref1'>inability<sup>1</sup></a> to work with symlinked (or `file:..` dependencies when deployed to now.


## Install

```Shell
ln -sf ${PWD}/link-nextjs-example-app-to-library.sh ~/local/bin/link-nextjs-example-app-to-library
```

## Usage

```Shell
link-nextjs-example-app-to-library
```

To also run `now ln` also an `--alias` CLI flag can be used

```Shell
link-nextjs-example-app-to-library --alias
```

## Is this really necessary?

This seems necessary based on my experience (see summary above) but I would be excited to learn that I'm wrong and there's an easy way to do deploy a Next.js app to now.sh that lives in a repo subdirectory and depends on another npm package located in the same repo. Please reach out to me at mikebannister@gmail.com if you can help, thanks!
