# Contributor Manual

We welcome contributions of any size and skill level. As an open source project, we believe in giving back to our contributors and are happy to help with guidance on PRs, technical writing, and turning any feature idea into a reality.

> **Tip for new contributors:**
> Take a look at [https://github.com/firstcontributions/first-contributions](https://github.com/firstcontributions/first-contributions) for helpful information on contributing

## Quick Guide

### Prerequisites


```shell
node: "^>=16.15.0"
pnpm: "^8.3.0"
# otherwise, your build will fail
```

### Setting up your local repo

This repository uses pnpm workspaces, so you should **always run `pnpm install` from the top-level project directory**. Running `pnpm install` in the top-level project root will install dependencies for this repository, and every package in the repo.

```shell
git clone && cd ...
pnpm install
```

### Running tests

All tests may be run from the root of the repository by using the following command:

```shell
pnpm -r run test
```

### Making a Pull Request

TODO

## Code Structure

TODO

## Branches

### `main`

While these packages are in a pre-release state, `main` will reflect the latest code. If the API stabilizes, this document will be updated, but at that time `main` will reflect the code of the latest stable release.
