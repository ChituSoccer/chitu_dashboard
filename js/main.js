var leaderboard_key = '0ApIcf6jg2PQ4dGdTQkFOQ2RVQ2lHb1ktSEVnLTNZYXc';

var ds = new Miso.Dataset({
  importer : Miso.Dataset.Importers.GoogleSpreadsheet,
  parser : Miso.Dataset.Parsers.GoogleSpreadsheet,
  key : leaderboard_key,
  worksheet : "1"
});

ds.fetch({ 
  success : function() {
    console.log(ds.columnNames());
  },
  error : function() {
    console.log("Are you sure you are connected to the internet?");
  }
});