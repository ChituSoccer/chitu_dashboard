// widgets:
//   1. heads count line chart
//   2. latest game stats: score, heads count, attendees
//   3. leaderboard, monthly, quarterly, yearly; accu score, impact score
//   4. player stats board
//   6. 

var dashboard1 = (function () {

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

    function render() {

        var html =
            '<div id="chart1" class="chart"></div>' +
                '<div id="chart2" class="chart"></div>';

        $("#content").html(html);

        createLastGameWidget('#chart1');
        createHeadsCountLineChart('#chart2');
        //createBarChart('#chart2');

    }

    return {
        render: render
    }

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
        
var dashboard_players = (function () {

    "use strict";
    
    function createPlayersTable(selector) {
      var grid;
      var columns = [
        {id: "id", name: "ID", field: "id", sortable: true },
        {id: "name", name: "Name", field: "name", sortable: true },
        {id: "acc", name: "Acc. Score", field: "acc", sortable: true },
        {id: "impact", name: "Effectiveness", field: "impact", sortable: true},
        {id: "attend", name: "Attend", field: "attend", sortable: true},
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

      grid = new Slick.Grid(selector, dp.nplayers, columns, options);
      
      grid.onSort.subscribe(function (e, args) {
        var cols = args.sortCols;

        dp.nplayers.sort(slickgrid_sorter(cols));        
        grid.invalidateAllRows();
        grid.render();
      });
    }

    function render() {

      var html = '<div id="players-table"></div>';

      $("#content").html(html);

      createPlayersTable('#players-table');
    }

    return {
        render: render
    }

}());

var dashboard_games = (function () {

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

      grid = new Slick.Grid(selector, dp.ngames, columns, options);
      
      grid.onSort.subscribe(function (e, args) {
        var cols = args.sortCols;

        dp.ngames.sort(slickgrid_sorter(cols));        
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

