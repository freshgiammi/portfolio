const path = require('path');

const buildEslintCommand = (filenames) =>
  `yarn lint:strict --fix --file ${filenames.map((f) => path.relative(process.cwd(), f)).join(' --file ')}`;

module.exports = {
  'src/**/*.{js,jsx,ts,tsx}': [buildEslintCommand],
  '*.{json,css,scss,md}': ['yarn prettify'],
};
