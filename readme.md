# DEPRECATED IN FAVOR OF https://github.com/possibilities/now-next-example-builder

# Deploy Next.js Next.js example app

Deploys a [Next.js](https://nextjs.org/docs) library's `./example` app on [now.sh](https://zeit.co/docs).

The app is copied to a temporary directory where it is prepared before `now` is invoked. The main purpose of this script is to workaround Next's <a href='#is-this-really-necessary'>inability<sup>1</sup></a> to work with symlinked (or `file:..` dependencies when deployed to now.


## Install

```Shell
yarn global add deploy-nextjs-example-app
```

## Usage

```Shell
deploy-nextjs-example-app
```

To also run `now ln` also an `--alias` CLI flag can be used

```Shell
deploy-nextjs-example-app --alias
```

## Is this really necessary?

This seems necessary based on my experience (see summary above) but I would be excited to learn that I'm wrong and there's an easy way to do deploy a Next.js app to now.sh that lives in a repo subdirectory and depends on another npm package located in the same repo. Please reach out to me at mikebannister@gmail.com if you can help, thanks!
