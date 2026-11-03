const React = require('react');

function MockSvg(props) {
  return React.createElement('svg', props);
}

MockSvg.default = MockSvg;
MockSvg.__esModule = true;

module.exports = MockSvg;
