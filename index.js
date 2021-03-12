const dotenv = require('dotenv');

const { BU } = require('base-util-jh');
const config = require('./src/config');

const Control = require('./src/Control');

module.exports = Control;

// if __main process
if (require !== undefined && require.main === module) {
  console.log('__main__');
  // const config = require('./src/config');

  let path;
  switch (process.env.NODE_ENV) {
    case 'development':
      path = `${process.cwd()}/.env`;
      break;
    case 'production':
      path = `${process.cwd()}/.env`;
      break;
    default:
      path = `${process.cwd()}/.env`;
      break;
  }

  dotenv.config({ path });

  const controller = new Control(config);
  controller
    .setMainList()
    .then(() => controller.setControllerListForDBS())
    // .then(() => controller.setControllerListForDBP())
    .then(dbsList =>
      // BU.CLIN(dbsList, 2);
      controller.operationServer(),
    )
    .then(() => {
      BU.CLI('operation Server');
    })
    .catch(err => {
      BU.CLI(err);
    });
  // controller.selectMap();

  process.on('uncaughtException', err => {
    // BU.debugConsole();
    BU.CLI(err.message);
    console.log('Node NOT Exiting...');
  });

  process.on('unhandledRejection', err => {
    // BU.debugConsole();
    BU.CLI(err.message);
    console.log('Node NOT Exiting...');
  });
}
