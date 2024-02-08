// const API_URL = 'http://localhost:8080/v1/';
const API_URL = 'v1/';

// Load planets and return as JSON.
async function httpGetPlanets() {
    const response = await fetch(`${API_URL}planets`);
    return await response.json();
}

async function httpGetLaunches() {
    const response = await fetch(`${API_URL}launches`);
    return await response.json();
}

async function httpSubmitLaunch(launch) {
    try {
        return await fetch(`${API_URL}launches`, {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(launch),
        });
    } catch (e) {
        return {ok: false}
    }

}

async function httpAbortLaunch(id) {
    try {
        return await fetch(`${API_URL}launches/${id}`, {
            method: "delete"
        });
    } catch (e) {
        return {ok: false}
    }
}

export {
    httpGetPlanets,
    httpGetLaunches,
    httpSubmitLaunch,
    httpAbortLaunch,
};