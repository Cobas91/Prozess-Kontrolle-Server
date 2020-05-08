var request = require("request")
const config = require('../config.json')

async function sendDailyFeedback(data, channel){
    var clientServerOptions = {
        uri: config.teams.channels[channel],
        body: JSON.stringify(data),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    request(clientServerOptions, function (error, response) {
        if(error){
            return error
        }else{
            return response.body
        }
    });
    return true
}

function versandReady(data, channel){
    var clientServerOptions = {
        uri: config.teams.channels[channel],
        body: JSON.stringify(data),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    request(clientServerOptions, function (error, response) {
        if(error){
            return error
        }else{
            return response.body
        }
    });
    return true
}



module.exports = {sendDailyFeedback, versandReady}