var app = app || {};
app.collection = app.collection || {};

var CountriesCollection = Backbone.Collection.extend({
  model: app.model.Country,
  url: 'data/countries.json',
  fetch: function() {
    var self = this;
    // TODO: Error handling
    $.getJSON(this.url, function(data) {
      self.reset(data.rows);
      app.fetched();
    });         
  }  
});

app.collection.countries = new CountriesCollection();

app.collection.countries.fetch();

app.collection.countries.on('reset', function(countries) {
  app.view.countrySelect = new app.view.CountrySelect(countries);
});