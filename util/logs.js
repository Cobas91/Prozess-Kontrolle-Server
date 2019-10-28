const db = require("./dbConnector")


async function add(input){
    var toAdd = {
        logText: input.message
    }
    console.log(toAdd)
    const result = await db.insert("db_logs", [toAdd]).catch(function (err) {    
        return err
      });
    return result
}



module.exports = { add };