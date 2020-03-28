const models = require('../models');
const utils = require('./utils');
const config = require('../config');
const _ = require('lodash');

const loadHospitals = async() => {
    const dataSources = _.get(config, 'dataSources.hospitals', [])
    await models.Hospitals.syncHospitals(utils, dataSources);
}

try {
    if (process.argv.length > 2) {
        const option = process.argv[2];
        if (option === 'hospitals') {
            loadHospitals();
        }
    } else {
        const dataSources = _.get(config, 'dataSources') || {};
        const options = Object.keys(dataSources).join(' | ');
        console.error(`Missing options [${options}]`);
    }
} catch (ex) {
    console.error(ex);
}
