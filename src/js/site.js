$(function() {

  var data = {
    years: [2012, 2009, 2005, 2000],
    year: 2012,
    indicators: {},
    indicator: '1',
    types: {
      total: 'Total',
      dejure: 'In law',
      defacto: 'In practice'
    },
    type: 'total',
    countries: {},
    sortedCountries: [],
    country: null,
    values: {},
    criteria: null,
    criterion: null  
  };
  
  //initMap();
  var map = L.choropleth('map');
  var geojson;

  createLayerSwitcher();

  $.when(
    $.getJSON("http://turban.cartodb.com/api/v2/sql?q=SELECT id, name, description FROM turi_indicators"),   
    $.getJSON("http://turban.cartodb.com/api/v2/sql?q=SELECT iso_n3 AS code, name FROM turi_countries ORDER BY name"),          
    $.getJSON('data/countries_110m.geojson'),
    $.getJSON("http://turban.cartodb.com/api/v2/sql?q=SELECT indicator, country, year, type, value FROM turi_indicator_values")  
  ).then(parseData);

  map.on('featureclick', function (feature){
    data.country = feature.id;
    showCountryPanel(data.country);
  });

  $('.navbar-nav .toggle').click(function (evt) {
    evt.preventDefault(); 
    menuChange(this.id);
  });

  $('#country-panel .close').click(function () {
    data.country = null;
    //$('#country-panel').hide();

    //$('#col-right').animate({"margin-left":"-400px"}, "slow");
    $('#country-panel').hide();

    $('#indicator-panel').show();
  });

  $('#profile-button').click(function () {
    showProfile(data.country);
  });

  function parseData(indicators, countries, geojson, values) {
    if (indicators[1] = 'success') {
      indicators = indicators[0].rows;
      for (var i = 0; i < indicators.length; i++) { 
        var indicator = indicators[i];
        data.indicators[indicator.id] = indicator;
        data.values[indicator.id] = {};
      }
    }

    if (countries[1] = 'success') {
      countries = countries[0].rows;
      for (var i = 0; i < countries.length; i++) { 
        var country = countries[i];
        data.countries[country.code] = country;
        data.sortedCountries.push(country);        
      }
      createDropdown(data.sortedCountries);
    }

    if (geojson[1] = 'success') {
      //drawCountries(geojson[0]);
      map.drawFeatures(geojson[0]);
    }

    if (values[1] = 'success') {
      values = values[0].rows;
      for (var i = 0; i < values.length; i++) { 
        var value = values[i];
      
        if (!data.values[value.indicator][value.country]) data.values[value.indicator][value.country] = {}; 
        if (!data.values[value.indicator][value.country][value.year]) data.values[value.indicator][value.country][value.year] = {}; 
        data.values[value.indicator][value.country][value.year][value.type] = value.value;
      }
      map.styleFeatures(data.values[data.indicator], data.year, data.type);
      createRanking(data.countries, data.values[data.indicator]);
      showIndicator(data.indicator);
    }
  }








  // Show indicator info in right column
  function showIndicator (id) {
    var indicator = data.indicators[id],
        description = indicator.description.split(/\r\n|\r|\n/g);

    var html = '<div class="panel-heading"><h3 class="panel-title">' + indicator.name + '</h3></div><div class="panel-body">';
    for (var i = 0; i < description.length; i++) {   
      html += description[i] + '<br/>';
    }
    html += '</div>';
    $('#indicator-panel').html(html).show();
  }

  function showCountryPanel (code) {
    var countryPanel = $('#country-panel'),
        country = data.countries[code],
        year = data.year;

    $('#indicator-panel').hide();

    $('.panel-title', countryPanel).text(country.name);

    var html = '<p><h4>' + data.indicators[data.indicator].name + ' ' + year + '</h4></p><div id="country-chart"></div>';
    html += '<table id="country-table" class="table table-hover table-condensed">';
    html += '<thead><tr><th></th><th class="text-right">Score</th><th class="text-center">Trend</th></tr></thead><tbody>';

    var indicator = data.indicators[1];

    html += '<tr class="' + ((data.type == 'total') ? 'warning' : 'default') + '"><td>Total</td><td class="text-right">' + getValue(1, code, year, 'total') + '</td><td class="text-center">' + getTrend(1, code, year, 'total') + '</span></td></tr>';
    html += '<tr class="' + ((data.type == 'dejure') ? 'warning' : 'default') + '"><td>In law</td><td class="text-right">' + getValue(1, code, year, 'dejure') + '</td><td class="text-center">' + getTrend(1, code, year, 'dejure') + '</td></tr>'
    html += '<tr class="' + ((data.type == 'defacto') ? 'warning' : 'default') + '"><td>In practice</td><td class="text-right">' + getValue(1, code, year, 'defacto') + '</td><td class="text-center">' + getTrend(1, code, year, 'defacto') + '</td></tr>'

    /*
    for (id in data.indicators) {
      var indicator = data.indicators[id];

      html += '<tr class="' + ((id == data.indicator && data.type == 'total') ? 'warning' : 'default') + '"><td>' + indicator.name + '</td><td class="text-right">' + getValue(id, code, year, 'total') + '</td><td class="text-center">' + getTrend(id, code, year, 'total') + '</span></td></tr>';
      if (id == data.indicator) {
        html += '<tr class="' + ((data.type == 'dejure') ? 'warning' : 'default') + '"><td style="padding-left: 20px">In law</td><td class="text-right">' + getValue(id, code, year, 'dejure') + '</td><td class="text-center">' + getTrend(id, code, year, 'dejure') + '</td></tr>'
        html += '<tr class="' + ((data.type == 'defacto') ? 'warning' : 'default') + '"><td style="padding-left: 20px">In practice</td><td class="text-right">' + getValue(id, code, year, 'defacto') + '</td><td class="text-center">' + getTrend(id, code, year, 'defacto') + '</td></tr>'
      }
    }
    */

    html += '</tbody></table>';

    $('.panel-body', countryPanel).html(html);

    countryPanel.show();
    createGraph(data.values[data.indicator][code]);
  }

  function getValue (indicator, country, year, type) {
    var values = data.values[indicator];
    if (values[country] && values[country][year] && values[country][year][type]) {
      return values[country][year][type];
    } else {
      return 'No data';
    }
  }

  function getTrend (indicator, country, year, type) {
    var prevYear = data.years[data.years.indexOf(year) + 1];
    if (prevYear) {
      var lastValue = getValue(indicator, country, year, type),
          prevValue = getValue(indicator, country, prevYear, type)
      if (lastValue !== 'No data' && prevValue !== 'No data') {
        if (lastValue > prevValue) {
          return '<span class="glyphicon glyphicon-arrow-up"></span>';
        } else if (lastValue < prevValue) {
           return '<span class="glyphicon glyphicon-arrow-down"></span>';         
        }
      }
    }
    return '';
  }

  function createGraph (values) {
    var series = [],
        points = {};

    for (year in values) {
      series.push([year, values[year].total]);
      points[year] = series.length - 1;
    }
    var chart = $.plot("#country-chart", [series], {
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
    if (points[data.year] !== undefined) {
      chart.highlight(0, points[data.year]);
    }
  }

  function createRanking (countries, values) {
    var html = '',
        year = 2012;

    for (code in values) {  
      var name = 'Country';
      if (countries[code]) name = countries[code].name;
      var value = values[code][year].total;
      html += '<tr id="' + code + '"><td>' + name + '</td>';
      html += '<td width="50%"><div class="progress"><div class="progress-bar" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style="width: ' + value + '%;"><span class="sr-only">60% Complete</span></div></div></td>';
      html += '<td class="text-right">' + value + '</td></tr>'
    }

    $('#ranking tbody').append(html);

    new Tablesort(document.getElementById('ranking'));

    // Trigger click to sort table
    $('#ranking thead tr th:last-child').trigger('click').trigger('click');

    $('#ranking tbody tr').click(function() {
      if (this.id) showCountryPanel(this.id);
    });

  }

  function menuChange (id) {
    $('.navbar-nav li').removeClass('active');
    $('#'+ id).addClass('active');
    $('.toggle-pane').hide();
    $('#'+ id +'-pane').show();
    $('#country-panel').hide();
    $('#indicator-panel').show();  
  }

  function showProfile(code) {
    menuChange('country-nav');
    $('#country').hide();
    $('#indicator').show();

    var country = data.countries[code];
    $('#profile').html('<h3>' + country.name + '</h3>');

    if (data.criteria) {
      createCriteriaTable(data.indicators);
    } else {
      $.getJSON("http://turban.cartodb.com/api/v2/sql?q=SELECT id, indicator, type, name FROM turi_criteria ORDER BY indicator, id", function(criteria) {
        data.criteria = {};

        for (var i = 0; i < criteria.rows.length; i++) {   
          var criterion = criteria.rows[i],
              indicator = data.indicators[criterion.indicator];

          data.criteria[criterion.id] = criterion;
          if (!indicator[criterion.type]) indicator[criterion.type] = {};
          indicator[criterion.type][criterion.id] = criterion; 
        }   
        createCriteriaTable(data.indicators);     
      });  
    } 
  }

  function createCriteriaTable (indicators) {
    html = '';

    for (id in indicators) {
      var indicator = indicators[id];
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

    $('#criteria-table tbody').append(html);
  }

  function createLayerSwitcher () {
    var years = [2012, 2009, 2005, 2000],
        control = $('#indicator-control');

    var html = '<div class="btn-group">';
    //html += '<div class="btn-group btn-group-sm"><button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">Trade union rights<span class="caret"></span></button><ul class="dropdown-menu"><li><a href="#">Trade union rights</a></li><li><a href="#">Fundamental civil liberties</a></li><li><a href="#">Freedom of association rights</a></li><li><a href="#">Collective bargaining rights</a></li><li><a href="#">Right to strike</a></li></ul></div>';

    // Type
    html += '<div class="btn-group dropdown-type"><button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><i>Total</i><span class="caret"></span></button><ul class="dropdown-menu">';
    html += '<li id="total"><a href="#">Total</a></li>';
    html += '<li id="dejure"><a href="#">In law</a></li>';
    html += '<li id="defacto"><a href="#">In practice</a>';
    html += '</li></ul></div>';
      
    // Years
    html += '<div class="btn-group dropdown-years"><button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" data-target="#"><i>' + years[0] + '</i><span class="caret"></span></button><ul class="dropdown-menu">';
    for (var i = 0; i < years.length; i++) {   
      html += '<li><a href="#">' + years[i] + '</a></li>';
    };
    html += '</ul></div>';

    html += '</div>';    
    control.append(html);

    $('.dropdown-type li', control).click(function (evt) {
      data.type = this.id;
      $('.dropdown-type i', control).text(data.types[data.type]);
      map.styleFeatures(data.values[data.indicator], data.year, data.type);
      if (data.country) {
        showCountryPanel(data.country);
      }
    });

    $('.dropdown-years li a', control).click(function (evt) {
      data.year = parseInt($(this).text());
      $('.dropdown-years i', control).text(data.year);
      map.styleFeatures(data.values[data.indicator], data.year, data.type);
      if (data.country) {
        showCountryPanel(data.country);
      }
    });

  }

  function createDropdown (countries) {
    var html = '';
    for (var i = 0; i < countries.length; i++) {    
      var country = countries[i];
      html += '<option value="' + country.code + '">' + country.name + '</option>'
    }
    $('.countries').append(html); 

    $('.countries').chosen({width: '300px'}).change(function (evt, option) {
      showProfile(option.selected)
    });
  }

});
