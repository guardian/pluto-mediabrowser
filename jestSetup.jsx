// setup file
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

// ensure that global TextEncoder is present, needed to Jose to avoid breaking on ReferenceError: TextEncoder is not defined
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
