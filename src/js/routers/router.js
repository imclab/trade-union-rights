var TurRouter = Backbone.Router.extend({
  routes: {
    'ranking': 'showRanking',
    'country/:id': 'showCountry'
  },
  showRanking: function() {
  	console.log('showRanking');
  },
  showCountry: function(id) {
  	console.log('showCountry', id);
  }
});

var turRouter = new TurRouter();

Backbone.history.start();