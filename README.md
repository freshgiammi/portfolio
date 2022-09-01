# ⚡ Supercharged Next [![CodeFactor](https://www.codefactor.io/repository/github/freshgiammi-lab/supercharged-next/badge)](https://www.codefactor.io/repository/github/freshgiammi-lab/supercharged-next) [![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com/) [![GitHub Repo stars](https://img.shields.io/github/stars/freshgiammi-lab/supercharged-next)](https://github.com/freshgiammi-lab/supercharged-next/stargazers)

> **Note:** This repository is _still_ (and probably always will be) a **work in progress**.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [Author](#author)
- [License](#license)

## Features

This template comes 🔋 packed with some goodies, like:

### 🥇 Stuff that'll make your code go _vroom_

- ⚡ **Next.js v12**
  - ['Absolute Import' and 'Module path aliases'](https://nextjs.org/docs/advanced-features/module-path-aliases): import components and static files by using `@/` and `~/` as base path!
- ⚛️ **React v18**
- 📝 **TypeScript**
- ✨ **Tailwind CSS 3**: Because we all need a little help when it's about CSS, don't we?

### 🥈 Stuff that'll help you code, in a _clean_ way

- 🔍 **ESLint**: Finds issues and problems in your code, and _sometimes_ fixes them automatically! As a bonus, it also sorts your imports.
- 💅 **Prettier**: Consistently format your code, so that you don't mix single and double quotes and whatnot (me? never done that...)
- 👗 **Stylelint**: A mighty, modern linter that helps you avoid errors and enforce conventions in your styles.
- 🐶 **Husky**: Modern native Git hooks made easy. _Included hooks are:_
  - [pre-commit](.husky/pre-commit): Run lint-staged before comiting
  - [post-merge](.husky/post-merge): Run `yarn` after merges, to re-allign imports
  - [commit-msg](.husky/commit-msg): Run commit-lint on commit generation
  - [pre-push](.husky/pre-push): Run linting before pushing
- 👀 **Lint-staged**: Run linters against staged git files!
- 📝 **Commitlint**: Make sure all your commits are compliant with [conventional-commits](https://www.conventionalcommits.org)!
  - You can also run `yarn commit` for a guided commit prompt!
- 🤖 **Github Actions**: Also known as the _'poor man's code review'_
  - [.github/workflows/code-review.yaml](.github/workflows/code-review.yaml)

### 🥉 Extra goodies, because I'm in a giving mood

- :octocat: **.github presets**: Keep the code clean, but the repo too! _This template includes presets for:_
  - [.github/ISSUE_TEMPLATE](.github/ISSUE_TEMPLATE)
    - [Bug Report](.github/ISSUE_TEMPLATE/bug_report.yml)
    - [Feature Request](.github/ISSUE_TEMPLATE/feature_request.yml)
  - [.github/CODE_OF_CONDUCT.md](.github/CODE_OF_CONDUCT.md)
  - [.github/SECURITY.md](.github/SECURITY.md)
  - [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md)
  - [CHANGELOG.md](CHANGELOG.md)

## Getting Started

### 1. Use/Clone the template repo:

If you look hard enough, you'll see a green button that says 'Use this template' right above the list of files. I mean, you can still use the good 'ole `git clone` or just straight download the repo as a zip file, but by using the dedicated button you'll also show a link to this template on your repo, and I'd appreciate if you did that!

Remember to check out all the stuff under [.github](.github), so that your project can be aligned to your needs.

**Please**, do not fork this repo. I mean you can, but the button is there to avoid forking!

### 2. Install dependencies and whatnot:

You can either use **yarn** or **npm** (just one of those two, of course). If you decide to use the latter, make sure to change the related [husky](.husky) configuration files, since they're **yarn** based. Also, remove **yarn.lock**.

Then, run one of these two commands, based on the package manager of your choice.

```bash
$ yarn install
$ npm install
```

### 3. Run the dev server:

Again, use the command based on the package manager you've chosen.

```bash
$ yarn dev
$ npm run dev
```

Then, navigate to [http://localhost:3000](http://localhost:3000) and you should see the template running successfully.

### 4. Go crazy

From here onwards, you're basically good to go. Have fun, whatever you plan on doing!

## Contributing

Contributions are always welcome. Please read [CONTRIBUTING.md](.github/CONTRIBUTING.md) for details on the code of conduct, and the process for submitting pull requests.

## Author

This template has been built by [freshgiammi](https://github.com/freshgiammi).
_Why, you might ask?_

During my time as a full-stack developer, I grew tired of having to set up countless repositories from the ground up: write ESLint rules, write pre-hooks, get Github Actions up and running, do this do that... As the teams at my workplace grew, it was clear that the need for a common template was overdue.
I took all the knowledge I gained up until that moment and poured it all in this template, so that you can take advantage of this too!

See the list of [contributors](https://github.com/freshgiammi-lab/supercharged-next/graphs/contributors) who helped this project's growth.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p>Made with <span style="color: #e25555;">♥</span> by <a href="https://freshgiammi.github.io"> freshgiammi</a></p>
