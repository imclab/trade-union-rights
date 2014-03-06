var app = app || {};

app.year = 2012;
app.type = 'total';
app.country = null;

// http://stackoverflow.com/questions/12168587/how-to-synchronize-multiple-backbone-js-fetches#answer-12179210
app.fetched = _.after(3, function(){
  app.view.map.styleFeatures(app.year, app.type);
});







