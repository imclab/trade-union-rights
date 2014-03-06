var app = app || {};
app.view = app.view || {};

app.view.CountryPanel = Backbone.View.extend({
  el: '#country-panel',	
  template: _.template($('#country-panel-template').html()), 
  events: {
  },
  initialize: function() {
    console.log("init!");
  },
  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this;
  }
});