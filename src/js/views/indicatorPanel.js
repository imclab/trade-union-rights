var app = app || {};
app.view = app.view || {};

app.view.IndicatorPanel = Backbone.View.extend({
  el: '#indicator-panel',	
  template: _.template($('#indicator-panel-template').html()), 

  initialize: function(indicator) {
    this.model = indicator;
    this.render();    
  },

  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this;
  }
});

app.view.indicatorPanel = new app.view.IndicatorPanel(app.model.indicator);
