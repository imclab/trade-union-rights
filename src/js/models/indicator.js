var app = app || {};
app.model = app.model || {};

var Indicator = Backbone.Model.extend({
  defaults: {
    'name': '',
    'description': ''
  }
});

app.model.indicator = new Indicator({
  id: '1',
  name: "Trade union rights",
  description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.<br><br>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  type: {
    total: 'Total',
    dejure: 'In law',
    defacto: 'In practice'
  },
  years: [2012, 2009, 2005, 2000]
});

