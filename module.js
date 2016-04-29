// my module, stored in universe.js
// patching phantomjs' require()
var require = patchRequire(require);

// now you're ready to go
var utils = require('utils');
var magic = 42;
exports.answer = function() {
    return utils.format("it's %d", magic);
};