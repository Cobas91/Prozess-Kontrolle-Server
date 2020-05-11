function convert(UNIX_timestamp, format) {
  var a = new Date(UNIX_timestamp);
  var months = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  if (sec < 10) {
    sec = ("0" + sec).slice(-2);
  }
  var time;
  switch (format) {
    case "DD MM JJ":
      time = `${date}.${month}.${year}`;
      break;
    case "DD MM":
      time = `${date}.${month}`;
      break;
    case "DD MM JJ mm":
      time = `${date}.${month}.${year} - ${hour}:${min}:${sec}`;
      break;
    case "DD MM HH mm":
      time = `${date}.${month}.${year} - ${hour}:${min} Uhr`;
      break;
  }

  return time;
}
module.exports = { convert };
