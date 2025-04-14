// {
//   "moduleFileExtensions": ["ts", "js"],
//   "testEnvironment": "node",
//   "transform": {
//     "^.+\\.(ts|js)$": "ts-jest"
//   },
//   "collectCoverage": true,
//   "collectCoverageFrom": [
//     'src/services/**/*.ts',
//     'src/controllers/**/*.ts',
//     'src/middlewares/**/*.ts',
//     'src/routes/**/*.ts',
//     '!src/index.ts',            // Исключаем entry point
//     '!src/socketServer.ts',     // Исключаем WebSocket сервер, если не тестируешь
//   ]
// }


export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/socketServer.ts',
    '!src/db.ts',
    '!src/utils/**'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};
