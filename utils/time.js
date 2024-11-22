const moment = require('moment');

module.exports.inHours = (d1, d2) => {
    var t2 = d2.getTime();
    var t1 = d1.getTime();

    return parseInt((t2-t1)/(24*3600*1000));
}

module.exports.inDates = (d1, d2) => {
    var t2 = d2.getTime();
    var t1 = d1.getTime();

    return parseInt((t2-t1)/(24*3600*1000));
}

module.exports.inWeeks = (d1, d2) => {
    var t2 = d2.getTime();
    var t1 = d1.getTime();

    return parseInt((t2-t1)/(24*3600*1000*7));
}

module.exports.inMonths = (d1, d2) => {
    var d1Y = d1.getFullYear();
    var d2Y = d2.getFullYear();
    var d1M = d1.getMonth();
    var d2M = d2.getMonth();

    return (d2M+12*d2Y)-(d1M+12*d1Y);
}

module.exports.inYears = (d1, d2) => { 
    return d2.getFullYear()-d1.getFullYear();
}

module.exports.compareDate = (date1, date2) => {
    //date1 < date: true, date1 >= date2: false
    return moment(date1).isBefore(date2);
}

function pad(num) {
    return ("0" + Math.round(num)).slice(-2);
}
module.exports.hhmmss = (secs, showSeconds) => {
  var minutes = Math.floor(secs / 60);
  secs = Math.floor(secs%60);
  var hours = Math.floor(minutes/60)
  minutes = minutes%60;
  return `${pad(hours)}:${pad(minutes)}${showSeconds===true?(':' + pad(secs)):''}`;
  // return pad(hours)+":"+pad(minutes)+":"+pad(secs); for old browsers
}

module.exports.mergeOverlap = (dateRanges) => {
    let ranges = [];
    for(let i = 0; i < dateRanges.length; i += 1) {
        ranges.push({from: moment(dateRanges[i].from).unix(), to: moment(dateRanges[i].to).unix()})
    }

    let result = [], last;

    ranges.forEach(function (r) {
        if (!last || r.from > last.to)
            result.push(last = r);
        else if (r.to > last.to)
            last.to = r.to;
    });

    for(let j = 0; j < result.length; j += 1) {
        result[j].from = moment(result[j].from * 1000).format("YYYY-MM-DDTHH:mm:ssZ");
        result[j].to = moment(result[j].to * 1000).format("YYYY-MM-DDTHH:mm:ssZ");
    }

    return result;
}