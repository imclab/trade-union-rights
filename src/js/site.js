$(function() {

  var map, 
      index,  
      values = {}, 
      geojson, 
      countries,
      criteria,
      year = 2012;

  var colors = ['rgb(165,0,38)','rgb(215,48,39)','rgb(244,109,67)','rgb(253,174,97)','rgb(254,224,139)','rgb(217,239,139)','rgb(166,217,106)','rgb(102,189,99)','rgb(26,152,80)','rgb(0,104,55)'];

  initMap();

  $.when(
    $.getJSON("http://turban.cartodb.com/api/v2/sql?q=SELECT id, name FROM turi_index"),      
    $.getJSON('data/countries_110m.geojson'),
    $.getJSON("http://turban.cartodb.com/api/v2/sql?q=SELECT country, year, type, value FROM turi_values WHERE indicator='test'")  
  ).then(loaded);

  function loaded(indicators, geojson, data) {
    if (indicators[1] = 'success') {
      indicators = indicators[0].rows;
      index = {
        name: indicators[0].name,
        items: []
      };
      for (var i = 0; i < indicators.length; i++) { 
        index.items[indicators[i].id] = {
          name: indicators[i].name,
          dejure: {},
          defacto: {}
        };
      }
      //console.log(indicators, index);
    }

    if (geojson[1] = 'success') {
      createMap(geojson[0]);
      countries = parseFeatures(geojson[0].features);
    }

    if (data[1] = 'success') {
      var values = parseData(data[0]);
      styleMap(values, year);
      createTable(countries, values);
    }
  }

  function initMap() {
    // Sphere Mollweide: http://spatialreference.org/ref/esri/53009/
    var crs = new L.Proj.CRS('ESRI:53009', '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +a=6371000 +b=6371000 +units=m +no_defs', {
      resolutions: [40000, 20000, 10000, 5000, 2500] 
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

    createLayerSwitcher();
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
    createLegend(colors);
  }

  function styleMap(values, year) {
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

  function parseFeatures(features) {
    var countries = {};
    for (var i = 0; i < features.length; i++) {
      countries[features[i].id] = features[i].properties;     
    }
    return countries;
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
    if (evt.target.feature) showCountry(evt.target.feature.id);
  }

  function showCountry (code) {
    var country = countries[code];
    $('#indicator').hide();

    var html = '<button style="float: right" type="button" id="profile-button" class="btn btn-warning">Country profile</button>';


    html += '<h4>' + country.name + '</h4><p>Trade union rights - total</p>';
    html += '<div id="placeholder" class="demo-placeholder"></div><br/>';

    html += '<table id="ranking" class="table table-hover table-condensed"><thead><tr><th>Indicator</th><th class="text-right">2012</th><th class="text-right">Trend</th></tr></thead><tbody>';

    for (id in index.items) {
      var indicator = index.items[id];
      //console.log(indicator);
      var style = 'default';
      if (id == 1) style = 'warning';
      html += '<tr class="' + style + '"><td>' + indicator.name + '</td><td class="text-right">xx</td><td></td></tr>'

      if (id == 1) {
        html += '<tr><td style="padding-left: 20px">In law</td><td class="text-right">xx</td><td></td></tr>'
        html += '<tr><td style="padding-left: 20px">In practice</td><td class="text-right">xx</td><td></td></tr>'
      }

    }

    html +='</tbody></table>';



    $('#country').html(html).show();
    createGraph(values[code]);
    $('#profile-button').click(function (evt) {
      showProfile(code);
    });
  }

  function createGraph (values) {
    var data = [];
    for (year in values) {
      data.push([year, values[year].both]);
    }
    $.plot("#placeholder", [data], {
      series: {
        lines: { show: true },
        points: { show: true }
      },
      xaxis: {
        tickDecimals: 0
      },
      yaxis: {
        tickDecimals: 0
      }
    });    
  }

  function createTable (countries, values) {
    var html = '',
        year = 2012;

    for (code in values) {  
      var name = 'Country';
      if (countries[code]) name = countries[code].name;
      var value = values[code][year].both;
      html += '<tr id="' + code + '"><td>' + name + '</td><td></td><td></td><td class="text-right">' + value + '</td></tr>'
    }

    $('#ranking tbody').append(html);

    new Tablesort(document.getElementById('ranking'));

    // Trigger click to sort table
    $('#ranking thead tr th:last-child').trigger('click');

    $('#ranking tbody tr').click(function() {
      if (this.id) showCountry(this.id);
    });

  }

  $('.navbar-nav .toggle').click(function (evt) {
    evt.preventDefault(); 
    menuChange(this.id);
  });

  function menuChange (id) {
    $('.navbar-nav li').removeClass('active');
    $('#'+ id).addClass('active');
    $('.toggle-pane').hide();
    $('#'+ id +'-pane').show();    
  }

  function showMap () {

  }

  function showRanking () {

  }

  function showProfile(code) {
    menuChange('country-nav');
    $('#country').hide();
    $('#indicator').show();

    var country = countries[code];
    $('#profile').html('<h3>' + country.name + '</h3>');

    if (criteria) {
      createCriteriaTable(index);
    } else {
      $.getJSON("http://turban.cartodb.com/api/v2/sql?q=SELECT id, indicator_id, type, name FROM turi_criteria ORDER BY indicator_id, id", function(data) {
        for (var i = 0; i < data.rows.length; i++) {   
          var criterion = data.rows[i];
          index.items[criterion.indicator_id][criterion.type][criterion.id] = {
            name: criterion.name
          };
        }   
        createCriteriaTable(index);
        criteria = true;        
      });  
    } 
  }

  function createCriteriaTable (index) {
    html = '';

    for (id in index.items) {
      var indicator = index.items[id];
      html += '<tr id="1" class="warning"><td>' + indicator.name + '</td><td class="text-right"></td></tr>';
      html += '<tr id="1dj"><td style="padding-left:20px">In law</td><td class="text-right"></td></tr>';

      for (id in indicator.dejure) {
        var criterion = indicator.dejure[id];
        html += '<tr id="1" class="criterion"><td style="padding-left:40px">' + id + '. ' + criterion.name + '</td><td class="text-right" style="font-size:14;font-weight:bold;">' + ((Math.random() < 0.5) ? '<span class="glyphicon glyphicon glyphicon-ok-sign"></span>' : '') + '</td></tr>';
      }

      html += '<tr id="1df"><td style="padding-left:20px">In practice</td><td class="text-right"></td></tr>';      

      for (id in indicator.defacto) {
        var criterion = indicator.defacto[id];
        html += '<tr id="1" class="criterion"><td style="padding-left:40px">' + id + '. ' + criterion.name + '</td><td class="text-right" style="font-size:14;font-weight:bold;">' + ((Math.random() < 0.5) ? '<span class="glyphicon glyphicon glyphicon-ok-sign"></span>' : '') + '</td></tr>';
      }
    }

    $('#criteria tbody').append(html);
  }

  function createLayerSwitcher () {
    var years = [2012, 2009, 2005, 2000];

    var html = '<div class="btn-group">';
    html += '<div class="btn-group btn-group-sm"><button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">Trade union rights<span class="caret"></span></button><ul class="dropdown-menu"><li><a href="#">Trade union rights</a></li><li><a href="#">Fundamental civil liberties</a></li><li><a href="#">Freedom of association rights</a></li><li><a href="#">Collective bargaining rights</a></li><li><a href="#">Right to strike</a></li></ul></div>';
    html += '<div class="btn-group btn-group-sm"><button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">Total<span class="caret"></span></button><ul class="dropdown-menu"><li><a href="#">Total</a></li><li><a href="#">In law</a></li><li><a href="#">In practice</a></li></ul></div>';
      
    // Years
    html += '<div class="btn-group btn-group-sm dropdown-years"><button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" data-target="#"><i>' + years[0] + '</i><span class="caret"></span></button><ul class="dropdown-menu">';
    for (var i = 0; i < years.length; i++) {   
      html += '<li><a href="#">' + years[i] + '</a></li>';
    };
    html += '</ul></div>';

    html += '</div>';    
    $('#indicator-control').append(html);

    $('#indicator-control .dropdown-years li a').click(function (evt) {
      var year = $(this).text();
      $('#indicator-control .dropdown-years i').text(year);
      styleMap(values, year);
    });

  }

});
