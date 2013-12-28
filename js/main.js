// Load the Visualization API and the piechart package.
google.load('visualization', '1', {'packages':['corechart']});
  
// Set a callback to run when the Google Visualization API is loaded.
google.setOnLoadCallback(drawChart);
  
function drawChart() {
  var data_api = "https://script.google.com/macros/s/AKfycbzHGDaQ95wf54l7DamRvEQKbLeWCO2fhO5d3g71EPNHp_m2BY4/exec";
  var jsonData = $.ajax({
	  url: data_api,
	  dataType:"jsonp",
	  async: false
	  }).responseText;

  console.log(jsonData);
	  
  // Create our data table out of JSON data loaded from server.
  //var data = new google.visualization.DataTable(jsonData);

  // Instantiate and draw our chart, passing in some options.
  //var chart = new google.visualization.PieChart(document.getElementById('leaderboard_sum'));
  //chart.draw(data, {width: 400, height: 240});
}
