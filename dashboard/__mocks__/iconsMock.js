const React = require('react');

function createIcon(name) {
  const Component = function Icon(props) {
    return React.createElement('svg', { ...props, 'data-icon': name });
  };
  Component.displayName = name;
  return Component;
}

const icons = {};

const handler = {
  get: function(target, prop) {
    if (prop === '__esModule') return true;
    if (prop === 'default') return target;
    if (typeof prop === 'string' && !(prop in target)) {
      target[prop] = createIcon(prop);
    }
    return target[prop];
  }
};

module.exports = new Proxy(icons, handler);
