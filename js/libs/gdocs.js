var gdocs = gdocs || {};

// note module is *defined* in qunit tests :-(
if (typeof module !== 'undefined' && module != null && typeof require !== 'undefined') {
  var _ = require('underscore');
  module.exports = recline;
}

(function(my) {
  my.__type__ = 'gdocs';

  var Deferred = _.isUndefined(this.jQuery) ? _.Deferred : jQuery.Deferred;

  // Fetch data from a Google Docs spreadsheet.
  //
  // For details of config options and returned values see the README in
  // the repo at https://github.com/Recline/backend.gdocs/
  my.fetch = function(config) {
    var dfd  = new Deferred(); 
    var urls = my.getGDocsApiUrls(config.url, config.worksheetIndex);

    // TODO cover it with tests
    // get the spreadsheet title
    (function () {
      var titleDfd = new Deferred();

      jQuery.getJSON(urls.spreadsheetAPI, function (d) {
          titleDfd.resolve({
              spreadsheetTitle: d.feed.title.$t
          });
      });

      return titleDfd.promise();
    }()).then(function (response) {

      // get the actual worksheet data
      jQuery.getJSON(urls.worksheetAPI, function(d) {
        var result = my.parseData(d);
        var fields = _.map(result.fields, function(fieldId) {
          return {id: fieldId};
        });

        var metadata = _.extend(urls, {
              title: response.spreadsheetTitle +" - "+ result.worksheetTitle,
              spreadsheetTitle: response.spreadsheetTitle,
              worksheetTitle  : result.worksheetTitle
        });
        dfd.resolve({
          metadata: metadata,
          records       : result.records,
          fields        : fields,
          useMemoryStore: true
        });
      });
    });

    return dfd.promise();
  };

  // ## parseData
  //
  // Parse data from Google Docs API into a reasonable form
  //
  // :options: (optional) optional argument dictionary:
  // columnsToUse: list of columns to use (specified by field names)
  // colTypes: dictionary (with column names as keys) specifying types (e.g. range, percent for use in conversion).
  // :return: tabular data object (hash with keys: field and data).
  // 
  // Issues: seems google docs return columns in rows in random order and not even sure whether consistent across rows.
  my.parseData = function(gdocsWorksheet, options) {
    var options  = options || {};
    var colTypes = options.colTypes || {};
    var results = {
      fields : [],
      records: []
    };
    var entries = gdocsWorksheet.feed.entry || [];
    var key;
    var colName;
    // percentage values (e.g. 23.3%)
    var rep = /^([\d\.\-]+)\%$/;

    for(key in entries[0]) {
      // it's barely possible it has inherited keys starting with 'gsx$'
      if(/^gsx/.test(key)) {
        colName = key.substr(4);
        results.fields.push(colName);
      }
    }

    // converts non numberical values that should be numerical (22.3%[string] -> 0.223[float])
    results.records = _.map(entries, function(entry) {
      var row = {};

      _.each(results.fields, function(col) {
        var _keyname = 'gsx$' + col;
        var value = entry[_keyname].$t;
        var num;
 
        // TODO cover this part of code with test
        // TODO use the regexp only once
        // if labelled as % and value contains %, convert
        if(colTypes[col] === 'percent' && rep.test(value)) {
          num   = rep.exec(value)[1];
          value = parseFloat(num) / 100;
        }

        row[col] = value;
      });

      return row;
    });

    results.worksheetTitle = gdocsWorksheet.feed.title.$t;
    return results;
  };

  // Convenience function to get GDocs JSON API Url from standard URL
  // 
  // @param url: url to gdoc to the GDoc API (or just the key/id for the Google Doc)
  my.getGDocsApiUrls = function(url, worksheetIndex) {
    // https://docs.google.com/spreadsheet/ccc?key=XXXX#gid=YYY
    var regex = /.*spreadsheet\/ccc?.*key=([^#?&+]+)[^#]*(#gid=([\d]+).*)?/,
      matches = url.match(regex),
      key
        ;
    
    if (!!matches) {
        key = matches[1];
        // the gid in url is 0-based and feed url is 1-based
        worksheet = parseInt(matches[3]) + 1;
        if (isNaN(worksheet)) {
          worksheet = 1;
        }
    }
    else if (url.indexOf('spreadsheets.google.com/feeds') != -1) {
        // we assume that it's one of the feeds urls
        key = url.split('/')[5];
        // by default then, take first worksheet
        worksheet = 1;
    } else {
      key = url;
      worksheet = 1;
    }
    worksheet = (worksheetIndex || worksheetIndex ===0) ? worksheetIndex : worksheet;

    return {
      worksheetAPI: 'https://spreadsheets.google.com/feeds/list/'+ key +'/'+ worksheet +'/public/values?alt=json',
      spreadsheetAPI: 'https://spreadsheets.google.com/feeds/worksheets/'+ key +'/public/values?alt=json',
      spreadsheetKey: key,
      worksheetIndex: worksheet
    };
  };
}(gdocs));
