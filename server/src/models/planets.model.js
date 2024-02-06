const fs = require('fs');
const path = require('path');
const {parse} = require('csv-parse');

const planets = require('./planets.mongo');

const habitablePlanets = [];

function isHabitablePlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED'
        && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
        && planet['koi_prad'] < 1.6;
}

const getAllPlanets = async () => {
    // empty first {} means, all values needed,  there can be second argument is list of keys we want, can be multiple strings or object
    return await planets.find({}, {'_id': 0, '__v': 0}); // 0 means we don't want these keys
}

const savePlanet = async (planet) => {
    try {
        // insert + udpate = upsert , will only insert if not existing, so that's why not using create
        // as below is getting called on each server launch
        await planets.updateOne({
                keplerName: planet.kepler_name
            },
            {keplerName: planet.kepler_name},
            {upsert: true}
        ) // matching schema
    } catch (e) {
        console.error('Error', e);
    }

}

function loadPlanetsData() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'))
            .pipe(parse(({
                comment: '#',
                columns: true
            })))
            .on('data', async (data) => {
                if (isHabitablePlanet(data)) {
                    // habitablePlanets.push(data);
                    savePlanet(data);
                }
            })
            .on('error', (err) => {
                console.error(err);
                reject(err);
            })
            .on('end', async () => {
                const countPlanetsFound = (await getAllPlanets()).length;
                console.log('habitablePlanets Found', countPlanetsFound);
                resolve();
            });
    });

}

console.log('111habitablePlanets', habitablePlanets)


module.exports = {
    getAllPlanets,
    loadPlanetsData
};
