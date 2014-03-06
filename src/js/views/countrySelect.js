var app = app || {};
app.view = app.view || {};

app.view.CountrySelect = Backbone.View.extend({
  el: '#country-select',
  
  events: {
    'change': 'change'
  },

  initialize: function(countries) {
    this.collection = countries;
    this.render();
    this.$el.chosen()
  },

  render: function() {
    this.collection.each(this.renderCountry, this);
    return this;
  },

  // TODO: Better with only one append?
  renderCountry: function(country) {
    this.$el.append('<option value="' + country.id + '">' + country.get('name') + '</option>');
  },

  change: function(evt, option) {
  	console.log("Show country", option.selected, this.collection.get(option.selected));
  }
});  