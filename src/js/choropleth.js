L.Choropleth = L.Map.extend({

  options: {
    crs: new L.Proj.CRS('ESRI:53009', '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +a=6371000 +b=6371000 +units=m +no_defs', {
      resolutions: [40000, 20000, 10000, 5000, 2500] 
    }),
    maxZoom: 3,
    scrollWheelZoom: false,
    colors: ['rgb(165,0,38)','rgb(215,48,39)','rgb(244,109,67)','rgb(253,174,97)','rgb(254,224,139)','rgb(217,239,139)','rgb(166,217,106)','rgb(102,189,99)','rgb(26,152,80)','rgb(0,104,55)']    
  },

  initialize: function (id, options) {
    L.Map.prototype.initialize.call(this, id, options);
    this.attributionControl.setPrefix('');
    this.createGraticule();
    this.createLegend();
    this.setView([0, 0], 0);
  },   

  createGraticule: function () {
    L.graticule({
      sphere: true,
      style: {
        opacity: 0,
        fillColor: '#ddf4fe',
        fillOpacity: 1,
        clickable: false
      }      
    }).addTo(this);

    L.graticule({
      style: {
        color: '#fff',
        weight: 1,
        opacity: 0.5,
        clickable: false
      }        
    }).addTo(this);
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
    }).addTo(this);
  },

  styleFeatures: function (values, year, type) {
    this.features.eachLayer(function (layer) {
      var feature = layer.feature;
      if (values[feature.id] && values[feature.id][year] && values[feature.id][year][type]) {
        var value = values[feature.id][year][type];  
        layer.setStyle({ fillColor: this.options.colors[Math.floor(value/10)] });
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
  	colors = colors || this.options.colors;
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
    this.legend.addTo(this);
  },

  onFeatureClick: function (evt) {
    if (evt.target.feature) {
      this.fire('featureclick', evt.target.feature);	
    }
  }  

});

L.choropleth = function (id, options) {
  return new L.Choropleth(id, options);
}; 	