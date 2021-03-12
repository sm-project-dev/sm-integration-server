const _ = require('lodash');
const Promise = require('bluebird');

const { BM } = require('base-model-jh');
const { BU } = require('base-util-jh');

const SocketServer = require('./SocketServer');

const { Dbp, Dbs } = require('./module');

const dsmConfig = require('./config');

class Control {
  /**
   *
   * @param {dsmConfig} config
   * @param {dbInfo=} dbInfo
   */
  constructor(config = dsmConfig, dbInfo = config.dbInfo) {
    this.config = config;
    // BU.CLI(dbInfo);

    this.biModule = new BM(dbInfo);

    /** @type {MAIN[]} */
    this.siteList = [];

    this.controllerListForDBS = [];
    /** @type {DBP[]} */
    this.controllerListForDBP = [];
  }

  /** MAIN DB Table을 가지고 오고 seq 순서대로 정렬 */
  async setMainList() {
    /** @type {MAIN[]} */
    const siteList = await this.biModule.getTable('main', { is_deleted: 0 }, false);
    this.siteList = _(siteList)
      .reject({ uuid: 'all' })
      .sortBy('main_seq');
    return this.siteList;
  }

  /**
   * @desc Step 1
   * DBS 객체 목록 생성 및 구동
   */
  async setControllerListForDBS() {
    BU.CLI('setControllerListForDBS');
    // Main 정보 만큼 DBS List 생성
    this.siteList.forEach(mainInfo => {
      const cloneConfig = _.cloneDeep(this.config);
      cloneConfig.uuid = mainInfo.uuid;

      const mainDBS = new Dbs();

      const controllerDBS = mainDBS.createControl(cloneConfig);

      // 해당 DBS Main UUID 정의
      // controllerDBS.mainUUID = mainInfo.uuid;
      this.controllerListForDBS.push(controllerDBS);
    });

    // DBS 초기화가 끝날떄까지 기다림
    // this.controllerListDBS 객체 목록 순회
    await Promise.each(this.controllerListForDBS, controllerDBS =>
      // BU.CLIN(controllerDBS);
      controllerDBS
        .init()
        // DBS 객체 구동 시작
        .then(() =>
          // BU.CLI('start runFeature');
          controllerDBS.runFeature(),
        )
        .then(() => {
          // Main Socket Server 접속 시작
          // controllerDBS.inquiryAllDeviceStatus();
          controllerDBS.runDeviceInquiryScheduler();
          Promise.resolve();
        })
        .catch(err => {
          Promise.reject(err);
        }),
    );

    // const wfk = _.map(this.controllerListForDBS, dl => {
    //   const pickInfo = _.pick(dl.dataLoggerInfo, ['main_seq', 'm_name', 'dl_real_id']);
    //   pickInfo.mainUUID = this.mainUUID;
    //   return pickInfo;
    // });
    // BU.CLI(wfk)

    // return this.config;

    return this.controllerListForDBS;
  }

  /**
   * @desc Step 2
   * DBS 객체 목록 생성 및 구동
   */
  async setControllerListForDBP() {
    BU.CLI('setControllerListForDBP');

    const dbpController = new Dbp(_.cloneDeep(this.config));

    const deviceControllerList = await dbpController.init(this.config.dbInfo);
    dbpController.runDeviceInquiryScheduler();
    return deviceControllerList;
  }

  /**
   * @desc Step 2
   * Server 구동
   */
  async operationServer() {
    // BU.CLI('operationServer');
    // Socket Server 정보가 있다면 구동
    if (!_.isEmpty(this.config.createSocketServerInfo)) {
      const socketServer = new SocketServer(this.config.createSocketServerInfo, this.biModule);
      await socketServer.setMainSiteUUIDList();
      socketServer.createServer();
    }
  }

  // async selectMap() {
  //   const result = await this.biModule.getTable('main_map');

  //   const file = result[0];
  //   const map = file.contents;

  //   const r = JSON.parse(map);
  //   BU.CLI(r.drawInfo);
  // }
}
module.exports = Control;
