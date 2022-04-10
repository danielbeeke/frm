/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFiles: ['./tests/test-utils/text.ts'],
  globals: {
    'ts-jest': {
        isolatedModules: true
    }
  },
};
