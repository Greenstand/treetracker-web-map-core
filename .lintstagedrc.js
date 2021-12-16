module.exports = {
  // sort package.json if changed
  'package.json': 'sort-package-json',

  // format all file types recognized by prettier
  '*': 'prettier --ignore-unknown --write',

  // lint typescript files and run related unit tests
  '*.js': 'eslint --fix',

  // lint entire project if eslint settings or ignore file changed
  // do not pass filename arguments
  '.eslint*': () => 'eslint .',
}
