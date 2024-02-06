const launches = require('./launches.mongo');
const planets = require('./planets.mongo');
const axios = require('axios');

const SPACEX_URL = 'https://api.spacexdata.com/v5/launches/query';
async function loadLaunchData() {
    console.log('Downloading launch data...');
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    });
    if (firstLaunch?.length) {
        console.log('Launches already loaded');
    } else {
        await populateLaunches();
    }
}

async function populateLaunches() {
    // below is SPACEX API implementation to get data which is just reference to some IDs in actual GET launches request
    const response = await axios.post(SPACEX_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        customers: 1
                    }
                }
            ]
        }
    });
    const launchDocs = response.data.docs;

    if (response.status !== 200) {
        console.log('Problem downloading launch data');
        throw new Error('Problem downloading launch data');
    }

    for (const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap(payload => payload.customers);
        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers
        };
        await saveLaunch(launch);
    }
}

async function  saveLaunch(launch) {
    // await launches.updateOne({flightNumber: launch.flightNumber}, launch, {upsert: true});
    await launches.findOneAndUpdate({flightNumber: launch.flightNumber}, launch, {upsert: true});
    // findOneAndUpdate only sets the property we pass and don't return or add additonal mongo properties to object passed
    // updateOne also updates the passed launch object, so in response you will see few mongodb properties too which we don't want

}

async function findLaunch(filter) {
    return launches.find(filter);
}

const isExistingLaunchById = async (flightNumber) => {
    return await launches.findOne({"flightNumber": flightNumber}, {'_id': 0, '__v': 0});
}

async function getLatestFlightNumber() {
    const latestLaunch = await launches.findOne().sort('-flightNumber');  // - means desc order
    return latestLaunch?.flightNumber || 100;
}

const getAllLaunches = (skip, limit) => {
    return launches
        .find({}, {'_id': 0, '__v': 0})
        .sort({flightNumber: 1})
        .skip(skip)
        .limit(limit);
}

const abortLaunchById = async (flightNumber) => {
    const aborted = await launches.updateOne({flightNumber: flightNumber}, {upcoming: false, success: false});
    return aborted.acknowledged && aborted.modifiedCount === 1;
}

const addNewLaunch = async (launch) => {
    const planet = await planets.findOne({keplerName: launch.target});
    const newFlightNumber = await getLatestFlightNumber() + 1;
    if (!planet) {
        throw new Error('No matching planet found')
    }
    const newLaunch = {
        ...launch, flightNumber: newFlightNumber, customers: ['IRK'], upcoming: true, success: true
    };
    await saveLaunch(newLaunch);
    return newLaunch;
}

module.exports = {
    loadLaunchData, isExistingLaunchById, getAllLaunches, addNewLaunch, abortLaunchById
}