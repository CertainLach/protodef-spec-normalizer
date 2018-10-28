let proto = require("./input.json");
const simplify = require('../');
console.log(JSON.stringify(simplify(proto),null,4));