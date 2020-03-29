const models = require('../models');
const utils = require('./utils');
const config = require('../config');
const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const csv = require('csvtojson');

const loadHospitals = async() => {
    const dataSources = _.get(config, 'dataSources.hospitals', []);
    await models.Hospitals.syncHospitals(utils, dataSources);
}

const loadLocalBodies = async () => {
    try {
        const dataSources = _.get(config, 'dataSources.localBodies', []);

        const sourceUrl = dataSources.sources[0].url;
        const dataFile = path.join(process.cwd(), 'uploads', 'allVillagesofIndia.csv');
        if (!fs.existsSync(dataFile)) {
            await utils.downloadFile(sourceUrl, dataFile);
        }
        let count = 0;

        const cUqId = 'IN@CTRY';
        let state = null;
        let district = null;
        const replaceExp = new RegExp('\\([0-9 ]+\\)','i')

        let country = await models.MetaData.findOne({
            where: {
                unique_id: cUqId
            }
        });
        if (!country) {
            country = await models.MetaData.create({
                name: 'India',
                type: 'geo_info',
                unique_id: cUqId,
                category: 'country',
                code: 'IN'
            });
        }

        csv({
            delimiter: ';',
            noheader: false,
            headers: [
                'sNo',
                'stateCode', 'stateNameEn',
                'distCode', 'distNameEn',
                'subDistCode', 'subDistNameEn',
                'villageCode', 'villageVersion', 'villageNameEn',
                'villageNameL10n', 'villageStatus',
                'census2001', 'census2011'
            ]
        })
        .fromFile(dataFile)
        .subscribe(async (json) => {
            const sUqId = `${cUqId}_${json.stateCode}@ST`;
            const dUqId = `${sUqId}_${json.distCode}@DT`;
            const vUqId = `${dUqId}_${json.villageCode}@VLG`;
            if (!state || state.unique_id != sUqId) {
                state = await models.MetaData.findOne({
                    where: {
                        unique_id: sUqId,
                        type: 'geo_info',
                    }
                });
                if (!state) {
                    state = await models.MetaData.create({
                        parentId: country.id,
                        name: json.stateNameEn,
                        type: 'geo_info',
                        unique_id: sUqId,
                        code: json.stateCode,
                        category: 'state'
                    });
                }
            }

            if (!district || district.unique_id != dUqId) {
                district = await models.MetaData.findOne({
                    where:{
                        unique_id: dUqId,
                        type: 'geo_info',
                    }
                });
                if(!district) {
                    district = await models.MetaData.create({
                        parentId: state.id,
                        name: json.distNameEn,
                        type: 'geo_info',
                        unique_id: dUqId,
                        code: json.distCode,
                        category: 'district'
                    });
                }
            }

            const village = await models.MetaData.findOne({
                where: {
                    unique_id: vUqId,
                    type: 'geo_info',
                }
            })
            const vName = [json.villageNameEn.replace(replaceExp,'').trim()];
            const vL10nName = json.villageNameL10n.replace(replaceExp,'').trim();
            if (vL10nName != '') {
                vName.push(vL10nName);
            }
            if (!village) {
                await models.MetaData.create({
                    parentId: district.id,
                    type:'geo_info',
                    name: vName.join(' - '),
                    unique_id:vUqId,
                    code: json.villageCode,
                    category: 'village'
                })
            } else {
                village.update({
                    parentId: district.id,
                    type:'geo_info',
                    name: vName.join(' - '),
                    unique_id: vUqId,
                    code: json.villageCode,
                    category: 'village'
                })
            }
            count++;
            if (count % 1000 == 0) {
                console.log(`Added ${count}`);
            }
        }).then(() => {
            console.log(count);
            process.exit();
        });
    } catch(err) {
        console.log(err);
    }
}

try {
    if (process.argv.length > 2) {
        const option = process.argv[2];
        if (option === 'hospitals') {
            loadHospitals();
        } else if (option === 'local-bodies') {
            loadLocalBodies();
        }
    } else {
        const dataSources = _.get(config, 'dataSources') || {};
        const options = Object.keys(dataSources).join(' | ');
        console.error(`Missing options [${options}]`);
    }
} catch (ex) {
    console.error(ex);
}
