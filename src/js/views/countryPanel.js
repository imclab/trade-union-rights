var app = app || {};
app.view = app.view || {};

app.view.CountryPanel = Backbone.View.extend({
  el: '#country-panel',	
  template: _.template($('#country-panel-template').html()), 

  events: {
  },

  initialize: function(country) {
    this.model = country;
    this.render();
  },
  
  render: function() {

    console.log("$$$", app.collection.values.getValue(1, this.model.id, app.year, app.type));



    this.$el.html(this.template({
      id: this.model.attributes.id,
      name: this.model.attributes.name,
      indicator: app.model.indicator.get('name'),
      year: app.year
    }));
    return this;
  }
});