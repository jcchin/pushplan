/*****************************************************************************/
/* Client App Namespace  */
/*****************************************************************************/
_.extend(App, {

});

App.helpers = {

};

_.each(App.helpers, function (helper, key) {
  UI.registerHelper("formatDate", function(datetime, format) {
      if(datetime){
        if (moment) {
            var f = DateFormats[format];
            return moment(datetime).format(f);
        }
        else {
            return datetime;
        }
      }
    });

});

var DateFormats = {
    short: "MMM Do YY",
    long: "dddd DD.MM.YYYY HH:mm",
    date: "ddd \n MM/DD",
    day: "dddd \n MM/DD: ha",
    hour: "h a"
};