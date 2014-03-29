var chitu_pubdata_key = '0ApIcf6jg2PQ4dEFNTFo2NTl2NzcwQUVaQmJwbklBN1E';
var dp = {};
gdocs.fetch({ url: chitu_pubdata_key }).done(function(result) {
    // structure of result is below
    console.log(result);
    //raw = result;
    dp = create_data_products(result);
    dashboard1.render();
});

// raw
// fields: names for each column
// records: field-name: value

function create_data_products(raw) {
  var dp = {};
  dp['heads_count'] = create_head_counts(raw);
  return dp;
}

// for every column, add up non-zero items
function create_head_counts(raw) {
  var heads_count = [];
  for (var i = 4; i < raw.fields.length; i++) {
    var n = 0;
    var name = raw.fields[i].id;
    for (var j = 0; j < raw.records.length; j++) {
      if (raw.records[j][name]) n++;
    }
    heads_count[i-4] = {"week":i-4, "count":n};
  }
  return heads_count;
}

var dashboard1 = (function () {

    "use strict";

    function createLineChart(selector) {
        $(selector).dxChart({
            dataSource: dp.heads_count,
            //dataSource: summary,
            animation: {
                duration: 350
            },
            commonSeriesSettings: {
                argumentField: "week"
            },
            series: [
                { valueField: "count", name: "#" }
            ],
            argumentAxis: {
                grid: {
                    visible: true
                }
            },
            tooltip: {
                enabled: true
            },
            title: {
                text: "Heads Count",
                font: {
                    size: "24px"
                }
            },
            legend: {
                verticalAlignment: "bottom",
                horizontalAlignment: "center"
            },
            commonPaneSettings: {
                border: {
                    visible: true,
                    right: false
                }
            }
        });
    }

    function render() {

        var html =
            '<div id="chart1" class="chart"></div>' +
                '<div id="chart2" class="chart"></div>';

        $("#content").html(html);

        createLineChart('#chart1');
        //createBarChart('#chart2');

    }

    return {
        render: render
    }

}());