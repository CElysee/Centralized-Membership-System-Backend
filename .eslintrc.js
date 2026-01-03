module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'jsdoc'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'airbnb-base',
    'airbnb-typescript',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    'import/no-cycle': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'import/prefer-default-export': 'off',
    'react/jsx-filename-extension': 'off',
    'eol-last': ['error', 'always'],
    'prettier/prettier': 'error',
    'quotes': ['error', 'single', { 'avoidEscape': true, 'allowTemplateLiterals': false }],
    'class-methods-use-this': 'off',
    'import/no-extraneous-dependencies': 'off',
    'indent': ['error', 2],
    'object-curly-newline': [
      'error',
      {
        ObjectExpression: { multiline: true, minProperties: 1 },
        ObjectPattern: { multiline: true, minProperties: 6 },
        ImportDeclaration: { multiline: true, minProperties: 5 },
        ExportDeclaration: { multiline: true, minProperties: 5 },
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/test.js', // Example: allowing devDependencies in test files
          '**/*.test.js', // or any other pattern for test files
          '**/webpack.config.js', // if you're using Webpack and want to allow devDependencies here
        ],
        optionalDependencies: false,
        peerDependencies: false,
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.js', // Allow devDependencies in test files
          '**/*.spec.ts', // Allow in TypeScript test files
          'test/**', // Allow in test directories
          'tests/**', // Another common test directory
          'spec/**', // Allow in spec directories
          '**/__tests__/**', // Allow in Jest's __tests__ directories
          '**/*.test.ts', // Specific pattern for TypeScript test files
          '**/*.spec.js', // Specific pattern for JavaScript spec files
        ],
        optionalDependencies: false,
        peerDependencies: false,
      },
    ],
    'operator-linebreak': [
      'error',
      'before', // Enforce operators to be placed after the line break
      {
        overrides: {
          '=': 'after', // Ensure no line break before or after '='
        },
      },
    ],
    'require-jsdoc': [
      'error',
      {
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true,
        },
      },
    ],
    'valid-jsdoc': [
      'error',
      {
        requireReturn: true,
        requireReturnType: true,
        requireParamDescription: true,
        requireReturnDescription: true,
      },
    ],
    "prettier/prettier": "off",
    'max-lines-per-function': ['error', { max: 250, skipBlankLines: true, skipComments: true }],
    'max-len': ['error', { code: 180, ignoreUrls: true }],
    'max-lines': ['error', { max: 1000, skipBlankLines: true, skipComments: true }],
    'max-depth': ['error', 4],
    'max-params': ['error', 4],
    'max-statements': ['error', 30],
    'max-statements-per-line': ['error', { max: 1 }],
    complexity: ['error', 20],
    'max-nested-callbacks': ['error', 10],
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
        'newlines-between': 'always',
      },
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        ts: 'never',
      },
    ],
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          object: false,
        },
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      rules: {
        'no-undef': 'off',
      },
    },
  ],
  settings: {
    'import/resolver': {
      node: {
        paths: ['.'],
        extensions: ['.js', '.ts', '.d.ts'],
      },
    },
  },
};
