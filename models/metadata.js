"use strict";
const csv = require('csv-parser');
const fs = require('fs');

module.exports = (sequelize, DataTypes) => {
	const MetaData = sequelize.define(
		"MetaData",
		{
			name: DataTypes.STRING,
			type: DataTypes.STRING,
			category: DataTypes.STRING,
			code: DataTypes.STRING,
			unique_id: DataTypes.STRING,
			parent_id: DataTypes.BIGINT,
			group: DataTypes.STRING,
			json: DataTypes.JSONB,
			status: DataTypes.STRING
		},
		{
			tableName: "meta_data"
		}
	);
	MetaData.associate = function(models) {
		// associations can be defined here
	};

	MetaData.syncLocationData = async () => {
		try {
			let dataToLoad = {
				'INDIA': {
					code: '+91',
					states: {}
				}
			};
			
			console.log('Starting location data load...');
			const fileName = 'allVillagesofIndia.csv';
			fs.createReadStream(`data/${fileName}`)
				.pipe(csv(
					{
						mapHeaders: ({ header, index }) => index
					}
				))
				.on('data', (data) => {
					if (data['2']) {
						let states = dataToLoad['INDIA'].states;
	
						if (!states[data['2']]) {
							states[data['2']] = {
								code: data['1'],
								districts: {}
							}
						}
	
						let districts = states[data['2']].districts;
						if (data['4']) {
							if (!districts[data['4']]) {
								districts[data['4']] = {
									code: data['3'],
									subDistricts: {}
								}
							}
	
							let subDistricts = districts[data['4']].subDistricts;
							if (data['6']) {
								if (!subDistricts[data['6']]) {
									subDistricts[data['6']] = {
										code: data['5'],
										villages: {}
									}
								}
	
								let villages = subDistricts[data['6']].villages;
								if (data['9'] && !villages[data['9']]) {
									villages[data['9']] = {
										code: data['7']
									}
								}
							}
						}
					}
				})
				.on('end', async () => {
					for (let i=0; i < Object.keys(dataToLoad).length; i++) {
						const countryName = Object.keys(dataToLoad)[i];
						console.log('Syncing country : ', countryName);
						const [country] = await MetaData.findOrCreate({
							where: {
								name: countryName,
								type: 'COUNTRY',
								category: 'LOCATION',
								code: dataToLoad[countryName].code,
								group: 'TERRAIN'
							}
						});
	
						const states = dataToLoad[countryName].states;
						for (let i=0; i < Object.keys(states).length; i++) {
							const stateName = Object.keys(states)[i];
							console.log('Syncing state : ', stateName);
							const [state] = await MetaData.findOrCreate({
								where: {
									name: stateName,
									type: 'STATE',
									category: 'LOCATION',
									code: states[stateName].code,
									group: 'TERRAIN',
									parent_id: country.id
								}
							});
	
							const districts = states[stateName].districts;
							for (let i=0; i < Object.keys(districts).length; i++) {
								const districtName = Object.keys(districts)[i];
								console.log('Syncing district : ', districtName);
								const [district] = await MetaData.findOrCreate({
									where: {
										name: districtName,
										type: 'DISTRICT',
										category: 'LOCATION',
										code: districts[districtName].code,
										group: 'TERRAIN',
										parent_id: state.id
									}
								});
		
								const subDistricts = districts[districtName].subDistricts;
								for (let i=0; i < Object.keys(subDistricts).length; i++) {
									const subDistrictName = Object.keys(subDistricts)[i];
									console.log('Syncing sub-district : ', subDistrictName);
									const [subDistrict] = await MetaData.findOrCreate({
										where: {
											name: subDistrictName,
											type: 'SUB_DISTRICT',
											category: 'LOCATION',
											code: subDistricts[subDistrictName].code,
											group: 'TERRAIN',
											parent_id: district.id
										}
									});
			
									const villages = subDistricts[subDistrictName].villages;
									for (let i=0; i < Object.keys(villages).length; i++) {
										const villageName = Object.keys(villages)[i];
										console.log('Syncing village : ', villageName);
										const [village] = await MetaData.findOrCreate({
											where: {
												name: villageName,
												type: 'VILLAGE',
												category: 'LOCATION',
												code: villages[villageName].code,
												group: 'TERRAIN',
												parent_id: subDistrict.id
											}
										});
									}
								}
							}
						}
					}
	
					console.log('Data loaded successfully.');
				});
		} catch (err) {
			console.log(err);
		}
	};

	return MetaData;
};
