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