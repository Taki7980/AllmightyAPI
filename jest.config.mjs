const config = {
  clearMocks: true,

  collectCoverage: true,

  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^#src/(.*)$': '<rootDir>/src/$1',
    '^#config/(.*)$': '<rootDir>/src/config/$1',
    '^#utils/(.*)$': '<rootDir>/src/utils/$1',
    '^#models/(.*)$': '<rootDir>/src/models/$1',
    '^#routes/(.*)$': '<rootDir>/src/routes/$1',
    '^#services/(.*)$': '<rootDir>/src/services/$1',
    '^#middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^#controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^#validations/(.*)$': '<rootDir>/src/validations/$1',
  },
};
export default config;
