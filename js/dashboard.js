// widgets:
//   1. heads count line chart
//   2. latest game stats: score, heads count, attendees
//   3. leaderboard, monthly, quarterly, yearly; accu score, impact score
//   4. player stats board
//   6. 

var dashboard_controller = (function () {

  "use strict";

  function createHeadsCountLineChart(selector) {
    $(selector).dxChart({
      dataSource: dp.games,
      animation: { duration: 350 },
      commonSeriesSettings: { argumentField: "time"},
      series: [
          { valueField: "nplayers", name: "#" }
      ],
      argumentAxis: { grid: { visible: true } },
      tooltip: { enabled: true },
      title: { text: "Heads Count", font: { size: "24px" } },
      legend: { verticalAlignment: "bottom", horizontalAlignment: "center" },
      commonPaneSettings: { border: { visible: true, right: false } }
    });
  }
  
  var game_tmpl = _.template($('#game_tmpl').html());
  function createLastGameWidget(selector) {
    $(selector).html(game_tmpl(dp['last_game']));
  }

  var leaderboard_tmpl = _.template($('#leaderboard_tmpl').html());
  var leaderboards_tmpl = _.template($('#leaderboards_tmpl').html());
  
  function createLeaderboardsWidget(selector) {
    $(selector).html(leaderboards_tmpl({ 'leaderboard_tmpl': leaderboard_tmpl, 'dp': dp}));
      $('ul.players-scores').readmore({
        speed: 500,
        maxHeight: 200,
        moreLink: '<a href="#">More &gt&gt </a>',
        lessLink: '<a href="#">Less &lt&lt</a>'
      });
  }
  
  function render() {

    var html = $('#dashboard_tmpl').html();

    $("#content").html(html);

    createLastGameWidget('#game_boards');
    createHeadsCountLineChart('#heads_count');
    createLeaderboardsWidget('#leaderboards');
    //createBarChart('#chart2');
  }

  return { render: render }

}());

var slickgrid_sorter = function(cols) {
  return function (dataRow1, dataRow2) {
    for (var i = 0, l = cols.length; i < l; i++) {
      var field = cols[i].sortCol.field;
      var sign = cols[i].sortAsc ? 1 : -1;
      var value1 = dataRow1[field], value2 = dataRow2[field];
      var result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
      if (result != 0) {
        return result;
      }
    }
    return 0;
  };
};
        
var players_controller = (function () {

    "use strict";
    
    function createPlayersTable(selector) {
      var grid;
      var columns = [
        {id: "id", name: "ID", field: "id", sortable: true },
        {id: "name", name: "Name", field: "name", sortable: true },
        {id: "acc", name: "Acc. Score", field: "acc", sortable: true },
        {id: "impact", name: "Effectiveness", field: "impact", sortable: true},
        {id: "attend", name: "Attend", field: "attend", sortable: true},
        {id: "attend_rate", name: "Attend Rate", field: "attend_rate", sortable: true},
        {id: "white", name: "White", field: "W", sortable: true},
        {id: "color", name: "Color", field: "C", sortable: true},
        {id: "win", name: "Win", field: "win", sortable: true},
        {id: "lose", name: "Lose", field: "lose", sortable: true},
        {id: "tie", name: "Tie", field: "tie", sortable: true}
      ];

      var options = {
        enableCellNavigation: true,
        enableColumnReorder: false,
        multiColumnSort: true
      };

      grid = new Slick.Grid(selector, dp.players(), columns, options);
      
      grid.onSort.subscribe(function (e, args) {
        var cols = args.sortCols;

        dp.players.sort(slickgrid_sorter(cols));        
        grid.invalidateAllRows();
        grid.render();
      });
    }

    function render() {
      var html = '<div id="players-table"></div>';
      $("#content").html(html);
      createPlayersTable('#players-table');
    }
    
    function is_number(num){ return !isNaN(num); }
    function to_number(num) { return +num; }
    
    var player_tmpl = _.template($('#player_tmpl').html());
    // name can be id or name
    function render_player(name) {
      var players = dp.players();
      if (is_number(name)) create_player_page_chartjs("#content", players[to_number(name)]);
    }
    
    function create_player_page_chartjs(selector, player) {
      $("#content").html(player_tmpl(player));
      var wl_data = _.map(["win", "lose", "tie", "switch"], function(name) {
        if (player[name]) return { name: name, val:player[name] };
      });
      show_stats_chart_chartjs("#win-lose-stats-chart", wl_data, "win/lose counts");
      var side_data = _.map(["W", "C", "WC", "CW"], function(name) {
        if (player[name]) return { name: name, val:player[name] };
      });
      show_stats_chart_chartjs("#white-color-stats-chart", side_data, "white/color counts");
    }

    function show_stats_chart_chartjs(selector, data, title) {
      $(selector).dxPieChart({
        dataSource: data,
        title: title,
        tooltip: {
          enabled: true,
          percentPrecision: 2,
          customizeText: function() { 
            return this.valueText + " - " + this.percentText;
          }
        },
        legend: {
          horizontalAlignment: "right",
          verticalAlignment: "top",
          margin: 0
        },
        series: [{
          type: "doughnut",
          argumentField: "name",
          label: {
            visible: true,
            connector: {
              visible: true
            }
          }
        }]
      });
    }
    
    return {
        render: render,
        render_player: render_player
    }

}());

var games_controller = (function () {

    "use strict";
    
    function createGamesTable(selector) {
      var grid;
      var columns = [
        {id: "id", name: "ID", field: "id", sortable: true },
        {id: "time", name: "Time", field: "time", sortable: true },
        {id: "score", name: "Score", field: "score", sortable: true },
        {id: "nplayers", name: "# Players", field: "nplayers", sortable: true}
      ];

      var options = {
        enableCellNavigation: true,
        enableColumnReorder: false,
        multiColumnSort: true
      };

      grid = new Slick.Grid(selector, dp.games, columns, options);
      
      grid.onSort.subscribe(function (e, args) {
        var cols = args.sortCols;

        dp.games.sort(slickgrid_sorter(cols));        
        grid.invalidateAllRows();
        grid.render();
      });
    }

    function render() {
      var html = '<div id="games-table"></div>';
      $("#content").html(html);
      createGamesTable('#games-table');
    }

    return {
        render: render
    }

}());

var pages_controller = (function () {
  "use strict";
  function render_about() {
    $("#content").html('<div style="margin:50px;text-align:center">brought to you by ferryzhou</div>');
  }
  return {
    render_about: render_about
  }
}());
// render player
//   name, 
