const csv = require('csv-parser')
const axios = require('axios');
const fs = require('fs');

const loadFromCsv = async (dataSource) => {
    console.log(`****Loading data for ${dataSource.name}*****`);
    const results = [];
    const filepath = `${dataSource.name || 'data'}.csv`;

    const parse = sources => sources.map((src, idx) => new Promise (async (resolve, reject) => {
        console.log(`Loading data: url(${src.url}), provider(${src.provider})`)

        const {
            url,
            provider,
            uniqueRowIdentifier
        } = src;
        const resp = await makeRequest({
            url
        });
        const file = await createFileAsync(filepath, resp.data);

        if(file && file.err) {
            reject(file.err);
        }
        
        fs.createReadStream(filepath)
        .pipe(csv())
        .on('data', (data) => {
            data.uq_id_prefix = uniqueRowIdentifier || provider;
            data.url = url;
            results.push(data)
        })
        .on('end', () => {
            resolve();
        })
    }));

    await Promise.all(parse(dataSource.sources));
    deleteFile(filepath);
    return results;
};

const createFileAsync = (path, data) => new Promise((resolve, reject) => {
    try {
        if (fs.existsSync(path)) {
          console.log(`file ${path} already exists`)
          resolve();
        }
        fs.writeFile(path, data, (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        })
    } catch(err) {
        console.error(err)
        reject({err})
    }
});

const deleteFile = (path) => {
    try {
        if (!fs.existsSync(path)) {
          console.log(`file ${path} doesn't exists`)
        }
        fs.unlink(path, (err) => {
            if(err) {
                console.Error(`Failed to delete ${path}`)
            }
        })
    } catch(err) {
        console.error(err)
    }
};

const makeRequest = async(options) => {
    if (!options.method){
        options.method = 'GET';
    }
    options.method = options.method.toUpperCase(); 

    try {
        const resp = await axios(options);
        return resp;
    } catch (ex) {
        throw ex;
    }
}

const validate = {
    str: (arg, prop) => {
        if(typeof arg !== 'string' || !arg) {
            throw new Error(`${prop} is invalid`)
        }
    },
    obj: (arg, prop) => {
        if(typeof arg !== 'object' || !arg) {
            throw new Error(`${prop} is invalid`)
        }
    },
    array: (arg, prop) => {
        if(!Array.isArray(arg)) {
            throw new Error(`${prop} is invalid`)
        }
    },
}

const downloadFile = async (url, dest) => {
    try {
        const resp = await makeRequest({
            url
        });
        await createFileAsync(dest, resp.data);
    } catch (ex) {
        throw ex;
    }
}

module.exports = {
    loadFromCsv,
    validate,
    downloadFile
}