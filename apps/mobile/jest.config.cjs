module.exports = {
  preset: 'jest-expo',
  modulePaths: ['<rootDir>/node_modules'],
  setupFilesAfterEnv: ['./jest.setup.cjs'],
  testMatch: ['**/__tests__/**/*.test.tsx'],
};
