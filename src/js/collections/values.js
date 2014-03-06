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
      .filter(function(value) {
        return (value.get('year') == year && value.get('type') == type);
      })
      .map(function(item) {
        return [item.attributes.country, item.attributes];
      })
      .value()
    );
  },

  getValue: function(indicator, country, year, type) {
    return this.find(function(value) { 
      return (value.get('indicator') == indicator && value.get('country') == country && value.get('year') == year && value.get('type') == type); 
    }).get('value');
  },

  getTrend: function(indicator, country, year, type) {
    var prevYear = app.years[app.years.indexOf(year) + 1];
    if (prevYear) {
      var lastValue = this.getValue(indicator, country, year, type),
          prevValue = this.getValue(indicator, country, prevYear, type)
      if (lastValue !== 'No data' && prevValue !== 'No data') {
        if (lastValue > prevValue) {
          return '<span class="glyphicon glyphicon-arrow-up"></span>';
        } else if (lastValue < prevValue) {
           return '<span class="glyphicon glyphicon-arrow-down"></span>';         
        }
      }
    }
    return '';
  }

});

app.collection.values = new ValuesCollection();
app.collection.values.fetch();