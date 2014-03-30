// load data and create data products
// raw data
// heads_count
// player_name_array
// game_info
// player_info
// player_win_lose_data
//   first row is time
//   first column is player's name
//   d[i][j] is W/L/T for ith-player and j-th day
//           

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
// fields: ids for each column
// records: field_id: value
// records[i][fields[j].id] is the value in i-th row and j-th column
// the first column is the player's id
function create_data_products(raw) {
  var dp = {};
  dp['raw'] = raw;
  dp['heads_count'] = get_head_counts(raw);
  dp['player_names'] = get_player_names(raw);
  dp['games'] = get_all_games(dp);
  dp['last_game'] = get_last_game(dp);
  return dp;
}

// for every column, add up non-zero items
function get_head_counts(raw) {
  var heads_count = [];
  for (var i = 4; i < raw.fields.length; i++) {
    var n = 0;
    var name = raw.fields[i].id;
    for (var j = 2; j < raw.records.length; j++) {
      var v = raw.records[j][name].trim();
      if (v && v != "0") n++;
    }
    heads_count[i-4] = {"week":raw.records[0][name].trim(), "count":n};
  }
  return heads_count;
}

// player_names[i] is the name of player in ith row
function get_player_names(raw) {
  var col_id = raw.fields[0].id;
  var player_names = [];
  for (var i = 0; i < raw.records.length; i++) {
    player_names[i] = raw.records[i][col_id];
  }
  return player_names;
}


function get_last_game(dp) {
  return get_game_info(dp, dp.raw.fields[dp.raw.fields.length - 1].id);
}

// array
function get_all_games(dp) {
  var fields = dp.raw.fields;
  var games = [];
  for (var i = 4; i < fields.length; i++) {
    games.push(get_game_info(dp, fields[i].id));
  }
  return games;
}

// time, score, white_team[i], color_team[i]
function get_game_info(dp, ind) {
  var raw = dp.raw;
  var fields = raw.fields;
  var records = raw.records;
  var v = {};
  v['time'] = records[0][ind];
  v['score'] = records[1][ind];
  var white_team = []; var color_team = [];
  for (i = 2; i < records.length; i++) {
    var side = records[i][ind].trim();
    var name = dp.player_names[i];
    if (side == 'W') white_team.push(name);
    else if (side == 'C') color_team.push(name);
    else if (side == 'WC' || side == 'CW') { white_team.push(name); color_team.push(name); }
  }
  v['white_team'] = white_team; v['color_team'] = color_team;
  v['nplayers'] = dp.heads_count[dp.heads_count.length - 1].count;
  return v;
}

// return 'W', 'C' or 'T' (for tie)
// sample input -> result 
//   W7:C6 -> 'W'
//   W2:C4 -> 'C'
//   W2:C2 -> 'T'
function get_win_side(str) {
  var ss = str.split(':');
  var n = {};
  for (var i = 0; i < ss.length; i++) {
    n[ss[i].charAt(0)] = parseInt(ss[i].substring(1));
  }
  if (n['W'] > n['C']) return 'W';
  else if (n['W'] < n['C']) return 'C';
  else return 'T';
}

// from the spreadsheet input
// compute statistics for each player
// player_stats[player_id] is a structure with 
//   attend_day_history,
//   team_side_history,
//   win_lose_history,
//   attend_count,
//   win_count,
//   lose_count,
//   draw_count,
//   switch_count,
//   acc_score, 
//   impact_score
// values[i] is ith player
function compute_player_stats(raw) {
  var playerSheet = SpreadsheetApp.openById('0ApIcf6jg2PQ4dEdTQVF6bHNRSUVKMy1wVm9CTXItNXc').getSheetByName('record');
  var values = playerSheet.getDataRange().getValues();
  Logger.log("col size: " + values[0].length)
  var start_col = 5;
  var to_col = values[0].length;
  var scores = [];
  for (var i = 2; i < values.length; i++) {
    //var name = values[i][1];
    var name = getShortName(values[i][1]);
    var attend_count = 0;
    var win_count = 0; 
    var draw_count = 0;  
    var switch_count = 0;  // label is CW or WC
    var loss_count = 0;
    //Logger.log(name);
    for (var j = start_col; j < to_col; j++) {
      var winSide = getWinSide(values[1][j]);
      //Logger.log(values[1][j] + ', win side: ' + winSide);
      var v = values[i][j];
      if (v == 0) continue;
      attend_count++;
      if (winSide == 'O') draw_count++;
      else {
        if (v == 'CW' || v == 'WC') switch_count++;
        else if (v == winSide) win_count++;
        else loss_count++;
      }
      //Logger.log(v);
    }
    var navg_score = (win_count * 3 + draw_count * 1 + switch_count * 1.5 + 3) / (attend_count+3);
    var acc_score = win_count * 3 + (draw_count + switch_count) * 2 + loss_count;
    var score = {'name': name, 'attend': attend_count, 'win': win_count, 'loss': loss_count,
                 'draw': draw_count, 'switch': switch_count, 'navg': navg_score, 'acc': acc_score}
    scores[i-2] = score;
    //Logger.log(JSON.stringify(score));
  }
  return scores;
}

var comments = {};
comments['3/29/2014']['CL'] = '少父聊发中年狂，左牵黄，右擎苍。弃帽脱裘，健骑卷平冈。欲沐春露驭赤兔，亲射虎，看李郎。'
　　 + '雨酣胸胆尚开张，鬓微霜，又何妨！持球泥中，今日过冯唐！会挽雕弓如满月，西北望，射天狼。';
