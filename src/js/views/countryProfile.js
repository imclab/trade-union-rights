var app = app || {};
app.view = app.view || {};

app.view.CountryProfile = Backbone.View.extend({
  template: _.template($('#country-profile-template').html()), 
  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this;
  }
});