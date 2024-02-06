const {getAllLaunches, addNewLaunch, abortLaunchById, isExistingLaunchById} = require("../../models/launches.model");
const {getPagination} = require("../../services/query");

async function httpGetAllLaunches(req, res) {
    const {limit, skip} = getPagination(req.query);
    return res.status(200).json(await getAllLaunches(skip, limit));
}

async function httpAbortLaunch(req, res) {
    const launchId = +req.params.id;
    const existLaunch = await isExistingLaunchById(launchId);
    if (!existLaunch) {
        return res.status(404).json({error: 'Launch not found'});
    }
    const aborted = await abortLaunchById(launchId);
    if (!aborted) {
        return res.status(400).json({error: 'Launch not aborted'});
    }
    return res.status(200).json({ok: true});
}

async function httpPostNewLaunch(req, res) {
    const launch = req.body;

    if (!launch.mission || !launch.rocket || !launch.target) {
        return res.status(400).json({error: 'Missing required launch properties'});
    }

    launch.launchDate = new Date(req.body.launchDate);

    if (isNaN(launch.launchDate.valueOf())) {
        return res.status(400).json({error: 'Invalid date'});
    }

    const newLaunch = await addNewLaunch(launch);
    return res.status(201).json(newLaunch);
}

module.exports = {
    httpGetAllLaunches,
    httpPostNewLaunch,
    httpAbortLaunch
};