'use strict';
const espree = require('espree');
const through = require('through2');
const rocambole = require('rocambole');
const PluginError = require('plugin-error');
const removeNode = require('rocambole-node-remove');
const updateNode = require('rocambole-node-update');

rocambole.parseFn = espree.parse;
rocambole.parseContext = espree;
rocambole.parseOptions = {
  range: true,
  tokens: true,
  comment: true,
  ecmaVersion: 2018,
  sourceType: 'module',
  ecmaFeatures: {
    jsx: false,
    globalReturn: false,
    impliedStrict: false
  }
};

function stripDebugger(node) {
  if (node.type === 'DebuggerStatement')
    removeNode(node);
}

function stripCalls(node, ...names) {
  if (node.type !== 'CallExpression')
    return;

  const expression = node.callee;

  if (expression && expression.type !== 'MemberExpression')
    return;

  let main = expression.object;

  if (main && main.type === 'MemberExpression' && main.object && main.object.type === 'Identifier' && main.object.name === 'window' && main.property)
    main = main.property;

  names.forEach(x => {
    if (main && main.type === 'Identifier' && main.name === x && expression.property) {
      removeNode(node); // updateNode(node, 'void 0');
      return;
    }
  });
}

function stripAlert(node) {
  if (node.type !== 'CallExpression')
    return;

  var main = node.callee;

  if (main && main.type === 'MemberExpression' && main.object && main.object.type === 'Identifier' && main.object.name === 'window' && main.property)
    main = main.property;

  if (main.type === 'Identifier' && main.name === 'alert')
    removeNode(node); // updateNode(node, 'void 0');
}


function stripAll(code) {
  return rocambole.moonwalk(code, node => {
    stripDebugger(node);
    stripCalls(node, 'console', 'Debug');
    stripAlert(node);
  });
}

module.exports = () => {
  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new PluginError('strip-debug', 'Streaming not supported'));
      return;
    }

    try {
      file.contents = Buffer.from(stripAll(file.contents.toString()).toString());
      this.push(file);
    } catch (err) {
      this.emit('error', new PluginError('strip-debug', err, { fileName: file.path }));
    }

    cb();
  });
}; 