var app = app || {};
app.view = app.view || {};

app.view.IndicatorControl = Backbone.View.extend({
  el: '#indicator-control',	
  template: _.template($('#indicator-control-template').html()), 

  events: {
    'click .dropdown-type a': 'onTypeClick',
    'click .dropdown-year a': 'onYearClick'
  },

  initialize: function(indicator) {
    this.model = indicator;
    this.render();    
  },

  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this;
  },

  onTypeClick: function(evt) {
    app.type = evt.target.id;
    this.$('.dropdown-type i').text(evt.target.text);
    app.view.map.styleFeatures(app.year, app.type);
  },

  onYearClick: function(evt) {
    app.year = parseInt(evt.target.text);
    this.$('.dropdown-year i').text(app.year);
    app.view.map.styleFeatures(app.year, app.type);
  }
});

app.view.indicatorControl = new app.view.IndicatorControl(app.model.indicator);