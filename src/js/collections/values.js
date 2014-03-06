var app = app || {};
app.collection = app.collection || {};

var ValuesCollection = Backbone.Collection.extend({
  model: app.model.Value,
  url: 'data/values.json',
  fetch: function() {
    var self = this;
    // TODO: Error handling
    $.getJSON(this.url, function(data) {
      self.reset(data.rows);
      app.fetched();
    });         
  },
  // Extracts values from one year/type as an object with country codes
  extract: function(year, type) {
    return _.object(this.chain()
      .filter(function(value){
        return (value.get('year') == year && value.get('type') == type);
      })
      .map(function(item) {
        return [item.attributes.country, item.attributes];
      })
      .value()
    );
  }  
});

app.collection.values = new ValuesCollection();
app.collection.values.fetch();