# React Setup Checklist ✅

> Simple checklist to follow when bootstrapping new React applications

Often when starting a new project, I get overwhelmed with the seemingly endless to-do list of the setup phase. This is my attempt to standardize the process.

## Table of Contents

1. **[Setup Husky and Lint Staged](#setup-husky-and-lint-staged)**
2. **[Configure CI Pipeline](#configure-ci-pipeline)**
3. **[Add Helpful Metadata](#add-helpful-metadata)**
4. **[Create Layout Component](#create-layout-component)**
5. **[Modify Head](#modify-head)**
6. **[Use Front End Checklist](#use-front-end-checklist)**

### Setup Husky and Lint Staged

- [ ] Use [lint config](https://github.com/melanieseltzer/lint-config) for easy setup. Husky and lint-staged enable eslint and prettier to be run on each commit.

### Configure CI pipeline

- [ ] Configure [CircleCI](https://circleci.com) to enable tests and typechecking to be run automatically.

### Add Helpful Metadata

- [ ] Add helpful metadata to the package.json:

```json
{
  "name": "awesome-app",
  "version": "0.0.0",
  "description": "Awesome app does awesome things",
  "author": "Melanie Seltzer",
  "license": "MIT",
  "homepage": "https://github.com/melanieseltzer/awesome-app#readme",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/melanieseltzer/awesome-app.git"
  },
  "bugs": {
    "url": "https://github.com/melanieseltzer/awesome-app/issues"
  }
}
```

### Create Layout Component

- [ ] Create a layout component that wraps every page, doing things like:
  - [ ] Set the page title and meta description if needed
  - [ ] Provide a standard layout if applicable to the application (e.g. header and footer always included)

### Modify Head

- [ ] Use [React Helmet](https://github.com/nfl/react-helmet) inside of the aforementioned layout component to make any necessary modifications to head.

### Use Front End Checklist

- [ ] Run a check using the [Front End Checklist](https://github.com/thedaviddias/Front-End-Checklist) before production launch.

## 🤝 Contributing

Contributions welcome! This is an ongoing document and I'm sure it'll change.
