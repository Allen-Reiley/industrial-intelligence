const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/icons$': '<rootDir>/__mocks__/iconsMock.js',
    '^@/icons/(.*)$': '<rootDir>/__mocks__/iconsMock.js',
    '\\.\\./icons/index$': '<rootDir>/__mocks__/iconsMock.js',
    '\\./icons/index$': '<rootDir>/__mocks__/iconsMock.js',
    '^.+\\.svg$': '<rootDir>/__mocks__/svgMock.js',
    '^@/(.*)$': '<rootDir>/$1',
  },
}

module.exports = async () => {
  const config = await createJestConfig(customJestConfig)()
  return {
    ...config,
    moduleNameMapper: {
      '^@/icons$': '<rootDir>/__mocks__/iconsMock.js',
      '^@/icons/(.*)$': '<rootDir>/__mocks__/iconsMock.js',
      '\\.\\./icons/index$': '<rootDir>/__mocks__/iconsMock.js',
      '\\./icons/index$': '<rootDir>/__mocks__/iconsMock.js',
      '^.+\\.svg$': '<rootDir>/__mocks__/svgMock.js',
      ...config.moduleNameMapper,
    },
  }
}
