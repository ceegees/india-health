module.exports = {
    app: {
        name: 'Covid Care Services',
        port: 5000
    },
    dataSources: {
        hospitals: {
            name: 'Hospitals across India',
            sources: [
                {
                    url: 'https://raw.githubusercontent.com/ceegees/india-public-domain-data/master/facilities/health/hospital_directory.csv',
                    provider: 'github',
                    uniqueRowIdentifier: 'Sr_No'
                }
            ]
        },
        localBodies: {

        } 
    }
};