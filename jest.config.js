module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverage: true,
  coverageReporters: [
    "text",
    "cobertura"
  ],
  verbose: true
}