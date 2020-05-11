var express = require("express"),
  router = express.Router();
const fs = require("fs");
var config = require("../config.json");

router.post("/set", async (request, response) => {
  var newConfig = config;
  var body = request.body;
  //Daily_Job_Uhrzeit
  var Daily_Uhrzeit = body.Daily_Job_Uhrzeit.split(":");
  //Lagerbestand_Import
  var Lagerbestand_array = body.Lagerbestand_Import.split("/");
  var Lagerbestand_file = Lagerbestand_array[Lagerbestand_array.length - 1];
  var Lagerbestand_pfad = body.Lagerbestand_Import.replace(
    Lagerbestand_file,
    ""
  );
  //Lieferschein_Import
  var Lieferschein_array = body.Lieferschein_Import.split("/");
  var Lieferschein_file = Lieferschein_array[Lieferschein_array.length - 1];
  var Lieferschein_pfad = body.Lieferschein_Import.replace(
    Lieferschein_file,
    ""
  );

  //PowerBI
  //Uhrzeit
  var PowerBI_Uhrzeit = body.PowerBI_Uhrzeit.split(":");
  //PowerBI Checkliste
  var PowerBI_Checkliste_array = body.powerbi_checklisten_pfad.split("/");
  var PowerBI_Checklisten_file =
    PowerBI_Checkliste_array[PowerBI_Checkliste_array.length - 1];
  var PowerBI_Checklisten_pfad = body.powerbi_checklisten_pfad.replace(
    PowerBI_Checklisten_file,
    ""
  );
  //PowerBI Systeme
  var PowerBI_Systeme_array = body.powerbi_systeme_pfad.split("/");
  var PowerBI_Systeme_file =
    PowerBI_Systeme_array[PowerBI_Systeme_array.length - 1];
  var PowerBI_Systeme_pfad = body.powerbi_systeme_pfad.replace(
    PowerBI_Systeme_file,
    ""
  );
  //PowerBI Status
  var PowerBI_Status_array = body.powerbi_status_pfad.split("/");
  var PowerBI_Status_file =
    PowerBI_Status_array[PowerBI_Status_array.length - 1];
  var PowerBI_Status_pfad = body.powerbi_status_pfad.replace(
    PowerBI_Status_file,
    ""
  );

  //Teams
  var Teams_DailyFeedBack_Channel = body.teams_daily_channel;
  var Teams_DailyFeedBack_Uhrzeit = body.teams_daily_time.split(":");

  newConfig = {
    ...config,
    Daily_Job_Uhrzeit: {
      stunde: Daily_Uhrzeit[0],
      minute: Daily_Uhrzeit[1],
      sekunde: Daily_Uhrzeit[2],
    },
    Lagerbestand_Import: {
      file: Lagerbestand_file,
      pfad: Lagerbestand_pfad,
    },
    Lieferschein_Import: {
      file: Lieferschein_file,
      pfad: Lieferschein_pfad,
    },
    PowerBI: {
      time: {
        stunde: PowerBI_Uhrzeit[0],
        minute: PowerBI_Uhrzeit[1],
        sekunde: PowerBI_Uhrzeit[2],
      },
      checklisten: {
        ...config.PowerBI.checklisten,
        powerBIFile: PowerBI_Checklisten_file,
        pfad: PowerBI_Checklisten_pfad,
      },
      systeme: {
        ...config.PowerBI.systeme,
        powerBIFile: PowerBI_Systeme_file,
        pfad: PowerBI_Systeme_pfad,
      },
      status: {
        ...config.PowerBI.status,
        powerBIFile: PowerBI_Status_file,
        pfad: PowerBI_Status_pfad,
      },
    },
    teams: {
      ...config.teams,
      dailyFeedback: {
        time: {
          stunde: Teams_DailyFeedBack_Uhrzeit[0],
          minute: Teams_DailyFeedBack_Uhrzeit[1],
          sekunde: Teams_DailyFeedBack_Uhrzeit[2],
        },
        channel: Teams_DailyFeedBack_Channel,
      },
    },
  };
  //Error Handling! TODO
  fs.writeFileSync("./config.json", JSON.stringify(newConfig));
  response.send({ success: "Daten erfolgreich angepasst." });
});

module.exports = router;
