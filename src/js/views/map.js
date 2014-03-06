var app = app || {};
app.view = app.view || {};

app.view.Map = Backbone.View.extend({
  el: '#map-panel',
  colors: ['rgb(165,0,38)','rgb(215,48,39)','rgb(244,109,67)','rgb(253,174,97)','rgb(254,224,139)','rgb(217,239,139)','rgb(166,217,106)','rgb(102,189,99)','rgb(26,152,80)','rgb(0,104,55)'],

  initialize: function(values) {
    this.collection = values;
    this.render();
  },

  render: function() {
    var map = this.map = L.map('map', {
      crs: new L.Proj.CRS('ESRI:53009', '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +a=6371000 +b=6371000 +units=m +no_defs', {
        resolutions: [40000, 20000, 10000, 5000, 2500] 
      }),
      maxZoom: 3,
      scrollWheelZoom: false
    });

    map.attributionControl.setPrefix('');
    map.setView([0, 0], 0);

    this.createGraticule();
    this.loadFeatures();
    this.createLegend();    

    return this;
  },

  createGraticule: function() {
    L.graticule({
      sphere: true,
      style: {
        opacity: 0,
        fillColor: '#ddf4fe',
        fillOpacity: 1,
        clickable: false
      }      
    }).addTo(this.map);

    L.graticule({
      style: {
        color: '#fff',
        weight: 1,
        opacity: 0.5,
        clickable: false
      }        
    }).addTo(this.map);    
  },

  loadFeatures: function () {
    var self = this;
    $.getJSON('data/countries_110m.geojson', function(geojson) {
      self.drawFeatures(geojson);
      app.fetched();
    });
  },

  drawFeatures: function (geojson) {
    this.features = L.geoJson(geojson, {
      style: function (feature) {
        return {
          color: '#fff',
          opacity: 1,
          weight: 1,
          fillColor: '#ddd',
          fillOpacity: 1,
          clickable: true
        };
      }
    }).addTo(this.map);
  },

  styleFeatures: function (year, type) {
    var values = this.collection.extract(year, type); 

    this.features.eachLayer(function (layer) {
      var feature = layer.feature;
      if (values[feature.id]) {
        var value = values[feature.id].value;  
        layer.setStyle({ fillColor: this.colors[Math.floor(value/10)] });
        layer.bindLabel(feature.properties.name + ': ' + value, {direction: 'auto'}); 
        layer.on('click', this.onFeatureClick, this); 
      } else {
        layer.setStyle({ fillColor: '#ddd'} ); 
        layer.unbindLabel(); 
        layer.off('click', this.onFeatureClick, this);
      }
    }, this);
  },

  createLegend: function (colors) {
    colors = colors || this.colors;
    this.legend = L.control({
      position: 'bottomright'
    });  
    this.legend.onAdd = function(map){
      var div = L.DomUtil.create('div', 'leaflet-control-legend');
      var html = '<span>Worse</span>';
      for (var i = 0; i < colors.length; i++) {
        html += '<i class="leaflet-control-legend-color" style="background:' + colors[i] + '"></i>';
      }
      html += '<span>Better</span>';      
      div.innerHTML = html;      
      return div;
    };
    this.legend.addTo(this.map);
  },

  onFeatureClick: function (evt) {
    var id = evt.target.feature.id;
    app.view.countryPanel = new app.view.CountryPanel(app.collection.countries.get(id));
  }   
}); 

app.view.map = new app.view.Map(app.collection.values);