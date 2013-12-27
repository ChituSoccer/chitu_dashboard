// Load the Visualization API and the piechart package.
google.load('visualization', '1', {'packages':['corechart']});
  
// Set a callback to run when the Google Visualization API is loaded.
google.setOnLoadCallback(drawChart);
  
function drawChart() {
  var data_api = "https://script.googleusercontent.com/macros/echo?user_content_key=eSUW619lbGFiOiC4UYlL-UyLsO4D4xdG87wN-7ZqXffZsGEPBNet6BUoO8g3dLS3Qd63PbYEaw4E23BML93TlqrzdIdPIMdAm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnLm1J9c89dvBL8aYIn17OQF3bhIv47kuKDmwUH9z5uEaC2wKV1mcpa5ky5Iz7wo1cDOmbnRGq-tk&lib=MQqC-ypIQgVILvsAPRyVbqU46mM4fGLn5";
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
