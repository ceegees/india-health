'use strict';
module.exports = (sequelize, DataTypes) => {
  const Hospitals = sequelize.define('Hospitals', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING
    },
    district_id: {
      type: DataTypes.INTEGER
    },
    state_id: {
      type: DataTypes.INTEGER
    },
    country_id: {
      type: DataTypes.INTEGER
    },
    lat: {
      type: DataTypes.STRING
    },
    lng: {
      type: DataTypes.STRING
    },
    bed_capacity: {
      type: DataTypes.BIGINT,
      default: 0
    },
    icu_capacity: {
      type: DataTypes.BIGINT,
      default: 0
    },
    phone_number: {
      type: DataTypes.STRING
    },
    pincode: {
      type: DataTypes.STRING
    },
    json: {
      type: DataTypes.JSONB
    },
    source_url: {
      type: DataTypes.STRING
    },
    source_row_uq_id: {
      type: DataTypes.STRING
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {});

  Hospitals.associate = function(models) {
    // associations can be defined here
  };

  Hospitals.syncHospitals = async (utils, dataSources) => {
    try {
      utils.validate.obj(dataSources, 'dataSources');
      utils.validate.array(dataSources.sources, 'dataSources.sources');
  
      if(!dataSources.sources.length) {
        console.log(`No source found for loading hospital records`)
        return;
      }
      
      const resp = await utils.loadFromCsv(dataSources);
      const { models } = sequelize;
      if(!resp.length) {
        console.log(`Failed to parse any data from ${dataSources.sources.join()}`)
        return;
      }
  
      for(let idx = 0; idx < resp.length; idx++) {
        const eachHospital = resp[idx];
        const location = (eachHospital.Location_Coordinates || ',').split(',');
        const source_row_uq_id = `${eachHospital.uq_id_prefix}_${idx}`;
  
        //check for a duplicate entry from a single source
        const isExists = await models.Hospitals.findOne({
          where: {
            source_url: eachHospital.url,
            source_row_uq_id
          }
        });
  
        if(isExists) {
          continue;
        }
  
        const hospital = await models.Hospitals.create({
          name: eachHospital.Hospital_Name,
          lat: location[0],
          lng: location[1],
          pincode: eachHospital.Pincode,
          phone_number: eachHospital.Telephone || eachHospital.Mobile_Number,
          address: eachHospital.Address_Original_First_Line,
          bed_capacity: eachHospital.Total_Num_Beds,
          json: {
            ...eachHospital
          },
          source_url: eachHospital.url,
          source_row_uq_id
        });
  
        if(!hospital) {
          console.log(`Failed to insert record for hospital ${eachHospital.Hospital_Name}`)
        }
      }
    } catch(ex) {
      console.error(ex)
    }
    
  }

  return Hospitals;
};

