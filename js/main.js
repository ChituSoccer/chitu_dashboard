// Load the Visualization API and the piechart package.
google.load('visualization', '1', {'packages':['corechart']});
  
// Set a callback to run when the Google Visualization API is loaded.
google.setOnLoadCallback(drawChart);
  
var ddd = 0;
function drawChart() {
  var data_api = "https://script.google.com/macros/s/AKfycbz6TcOdQFZnEptubFeCGVYkysVpASbNfbxiXVdBzyI/exec";
  var jsonData = $.ajax({
	  url: data_api,
	  dataType:"jsonp",
	  success: function( response ) {
        console.log("response:" + response ); // server response
		ddd = response;
      },
      error: function(e) {
        console.log(e.message);
      }
	  });

	  
  // Create our data table out of JSON data loaded from server.
  //var data = new google.visualization.DataTable(jsonData);

  // Instantiate and draw our chart, passing in some options.
  //var chart = new google.visualization.PieChart(document.getElementById('leaderboard_sum'));
  //chart.draw(data, {width: 400, height: 240});
}
