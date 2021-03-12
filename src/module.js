// const DccFacade = require('sm-communication-manager');
// const dpc = require('sm-protocol-manager');
// const di = require('sm-default-intelligence');

const DccFacade = require('../../sm-communication-manager');
const Dbs = require('../../sm-control-server');
const dpc = require('../../sm-protocol-manager');
const di = require('../../sm-default-intelligence');

module.exports = {
  Dbs,
  dpc,
  di,
  DccFacade,
};
