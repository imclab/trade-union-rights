var map, 
    values = {}, 
    geojson, 
    year = 2012;

var colors = ['rgb(165,0,38)','rgb(215,48,39)','rgb(244,109,67)','rgb(253,174,97)','rgb(254,224,139)','rgb(217,239,139)','rgb(166,217,106)','rgb(102,189,99)','rgb(26,152,80)','rgb(0,104,55)'];

initMap();

$.when(
  $.getJSON('data/countries_110m.geojson'),
  $.getJSON("http://turban.cartodb.com/api/v2/sql?q=SELECT country, year, type, value FROM turi_values WHERE indicator='test'")  
).then(loaded);

function loaded(countries, data) {
  if (countries[1] = 'success') {
    createMap(countries[0]);
  }
  if (data[1] = 'success') {
    styleMap(parseData(data[0]));
  }
}

function initMap(countries) {
  // Sphere Mollweide: http://spatialreference.org/ref/esri/53009/
  var crs = new L.Proj.CRS('ESRI:53009', '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +a=6371000 +b=6371000 +units=m +no_defs', {
    resolutions: [50000, 25000, 12500, 6250, 3125] 
  });

  map = L.map('map', {
    crs: crs,
    maxZoom: 3,
    scrollWheelZoom: false
  }).setView([0, 0], 0);

  map.attributionControl.setPrefix('');

  L.graticule({
    sphere: true,
    style: {
      opacity: 0,
      fillColor: '#ddf4fe',
      fillOpacity: 1,
      clickable: false
    }      
  }).addTo(map);

  L.graticule({
    style: {
      color: '#fff',
      weight: 1,
      opacity: 0.5,
      clickable: false
    }        
  }).addTo(map);
}

function createMap(countries) {
  geojson = L.geoJson(countries, {
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
  }).addTo(map);
}

function styleMap(values) {
  geojson.eachLayer(function (layer) {
      var feature = layer.feature;
      if (values[feature.id] && values[feature.id][year]) {
        var value = values[feature.id][year].both;  
        layer.setStyle({
          fillColor: colors[Math.floor(value/10)]
        });
        layer.bindLabel(feature.properties.name + ': ' + value, {direction: 'auto'}); 
        layer.on('click', onMapClick); 
      } else {
        layer.setStyle({
          fillColor: '#ddd'}
        ); 
        layer.unbindLabel(); 
        layer.off('click', onMapClick);
      }
  });

  createLegend(colors);
}

function parseData(data) {
  for (var i = 0; i < data.rows.length; i++) { 
  	var item = data.rows[i];
  	if (!values[item.country]) values[item.country] = {}; 
    if (!values[item.country][item.year]) values[item.country][item.year] = {}; 
  	values[item.country][item.year][item.type] = item.value;
  }
  return values;
}

function createLegend(colors) {
  var legend = L.control({
    position: 'bottomright'
  });  
  legend.onAdd = function(map){
    var div = L.DomUtil.create('div', 'leaflet-control-legend');
    var html = '<span>Worse</span>';
    for (var i = 0; i < colors.length; i++) {
      html += '<i class="leaflet-control-legend-color" style="background:' + colors[i] + '"></i>';
    }
    html += '<span>Better</span>';      
    div.innerHTML = html;      
    return div;
  };
  legend.addTo(map);
}

function onMapClick(evt) {
  if (evt.target.feature) showCountry(evt.target.feature);
}

function showCountry (country) {
  console.log("Show", values[country.id]);
  $('#detail').html('<h3>' + country.properties.name + '</h3><p>Show country data</p>');
}

