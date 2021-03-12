require('dotenv').config();

const { di } = require('./module');

const {
  dccFlagModel: { controllerParserType },
} = di;

const ENV = process.env;

const config = {
  createSocketServerInfo: {
    port: ENV.DBC_SOCKET_PORT,
    wrapperCategory: 'default',
  },
  projectInfo: {
    projectMainId: ENV.PJ_MAIN_ID || 'UPSAS',
    projectSubId: ENV.PJ_SUB_ID || 'muan',
    featureConfig: {
      apiConfig: {
        type: 'socket',
        host: ENV.PJ_HTTP_HOST,
        port: ENV.PJ_API_PORT,
        addConfigInfo: {
          parser: controllerParserType.socket.DELIMITER,
          option: '\u0004',
        },
      },
    },
  },
  /** @type {dbInfo} */
  dbInfo: {
    port: ENV.PJ_DB_PORT || '3306',
    host: ENV.PJ_DB_HOST || 'localhost',
    user: ENV.PJ_DB_USER || 'root',
    password: ENV.PJ_DB_PW || 'test',
    database: ENV.PJ_DB_DB || 'test',
  },
  inquirySchedulerInfo: {
    intervalCronFormat: '0 * * * * *',
    intervalSaveCnt: 1,
    validInfo: {
      diffType: 'minutes',
      duration: 2,
    },
  },
};
module.exports = config;
