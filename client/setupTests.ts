import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";

// Suppress Node deprecation warnings for punycode at process level
const originalEmitWarning = process.emitWarning;
process.emitWarning = (warning: any, ...args: any[]) => {
  const msg = typeof warning === 'string' ? warning : warning && warning.toString();
  if (msg && msg.includes('punycode')) {
    return;
  }
  originalEmitWarning.call(process, warning, ...args);
};

fetchMock.enableMocks();

// Suppress specific deprecation and act warnings across all tests
const originalError = console.error;
console.error = (...args: any[]) => {
  const msg = args[0] && args[0].toString();
  if (
    msg.includes('ReactDOMTestUtils.act') ||
    msg.includes('punycode')
  ) {
    return;
  }
  originalError(...args);
};
