// configure Enzyme v3 for react 16
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import is from 'is_js';

Enzyme.configure({ adapter: new Adapter(), disableLifecycleMethods: true });

// to allow mocking fetch requests
global.fetch = require('jest-fetch-mock');

// something of a hack - wait for the next tick so all promises can resolve and we can continue
// useful for testing async lifestyle components like componentDidMount which don't provide any waiting hook
global.nextTick = () => new Promise((res) => process.nextTick(res));

// throw an error on console.error so that failing propTypes cause tests to fail
// eslint-disable-next-line no-console
console.error = (message) => {
  // Only fail on propType errors, not any random console.error call
  if (is.string(message) && message.includes('prop')) {
    throw new Error(message);
  }
};
