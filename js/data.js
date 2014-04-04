// load data and create data products
// raw data
// player_names[i] is the name for ith player
// game_days[j] is the day for jth game
// game_info[j] is the information for jth game
// player_info
// player_win_lose_data
//   first row is time
//   first column is player's name
//   d[i][j] is W/L/T for ith-player and j-th day
//           

function load_data(on_ready) {

var chitu_pubdata_key = '0ApIcf6jg2PQ4dEFNTFo2NTl2NzcwQUVaQmJwbklBN1E';

/*
gdocs.fetch({ url: chitu_pubdata_key }).done(function(raw) {
  // structure of result is below
  console.log('successfully load raw data from gdocs');
  $.jStorage.set('raw', raw);
  on_raw_loaded(raw);
}).fail(function() {
  console.log('failed to connect to gdocs');
  var raw = $.jStorage.get('raw');
  on_raw_loaded(raw);
});
*/

  var raw = $.jStorage.get('raw');
  on_raw_loaded(raw);

function on_raw_loaded(raw) {
  console.log('on raw loaded .....');
  var dp = create_data_products(raw);
  window.dp = dp;
  //dashboard1.render();
  console.log('ready');
  on_ready();
  //window.update_on_hash();
}

// i-th row, j-th col, start from 0
function get_raw_value(raw, i, j) {
  return raw.records[i][raw.fields[j].id];
}

function get_raw_rows(raw) { return raw.records.length; }
function get_raw_cols(raw) { return raw.fields.length; }

function get_raw_row(raw, row_ind) {
  var r = [];
  for (var i = 0; i < raw.fields.length; i++) {
    r[i] = get_raw_value(raw, row_ind, i);
  }
  return r;
}

function get_raw_col(raw, col_id) {
  var c = [];
  for (var i = 0; i < raw.records.length; i++) {
    c[i] = get_raw_value(raw, i, col_id);
  }
  return c;
}


// convert gdocs input data to a 2d array
// omat[i][j] = raw.records[i][raw.fields[j].id]
function get_omat(raw) {
  var omat = [];
  var rows = get_raw_rows(raw);
  for (var i = 0; i < rows; i++) {
    omat[i] = get_raw_row(raw, i);
  }
  return omat;
}

// raw
// fields: ids for each column
// records: field_id: value
// records[i][fields[j].id] is the value in i-th row and j-th column
// the first column is the player's id
function create_data_products(raw) {
  var dp = {};
  dp.raw = raw;
  dp.rows = get_raw_rows(raw);
  dp.cols = get_raw_cols(raw);
  dp.omat = get_omat(raw);
  dp.player_names = get_player_names(dp);
  dp.game_days = get_game_days(dp);
  dp.win_sides = get_win_sides(dp);
  dp.win_lose_matrix = get_win_lose_matrix(dp);
  dp.games = get_all_games(dp);
  dp.last_game = _.last(dp.games);
  dp.players = get_players(dp);
  dp.ngames = dp.games.slice(1, dp.games.length);
  dp.nplayers = dp.players.slice(2, dp.players.length);
  return dp;
}

function set_value(M, i, j, v) {
  M.records[i][raw.fields[j].id] = v;
}

// player_names[i] is the name of player in ith row
function get_player_names(dp) { return get_raw_col(dp.raw, 0); }

// game_days[i] is the day in jth column
function get_game_days(dp) { return dp.omat[0]; }

function get_last_game(dp) {
  return get_game_info(dp, dp.raw.fields[dp.raw.fields.length - 1].id);
}

// array
function get_all_games(dp) {
  var games = [];
  for (var i = 1; i < dp.cols; i++) {
    games.push(get_game_info(dp, i));
  }
  return games;
}

// time, score, white_team[i], color_team[i], nplayers
function get_game_info(dp, ind) {
  var omat = dp.omat;
  var game = {};
  game.id = ind;
  game.time = omat[0][ind];
  game.score = omat[1][ind];
  var white_team = []; var color_team = []; var nplayers = 0;
  for (i = 2; i < dp.rows; i++) {
    var side = omat[i][ind].trim();
    var name = dp.player_names[i];
    if (side && side != "0") nplayers++;
    if (side == 'W') white_team.push(name);
    else if (side == 'C') color_team.push(name);
    else if (side == 'WC' || side == 'CW') { white_team.push(name); color_team.push(name); }
  }
  game.white_team = white_team; 
  game.color_team = color_team;
  game.nplayers = nplayers;
  return game;
}

// return 'W', 'C' or 'T' (for tie)
// sample input -> result 
//   W7:C6 -> 'W'
//   W2:C4 -> 'C'
//   W2:C2 -> 'T'
function get_win_side(str) {
  if (str) {
    var ss = str.split(':');
    var n = {};
    for (var i = 0; i < ss.length; i++) {
      n[ss[i].charAt(0)] = parseInt(ss[i].substring(1));
    }
    if (n['W'] > n['C']) return 'W';
    else if (n['W'] < n['C']) return 'C';
    else return 'T';
  } else { return 'T'; }
}

// win_sides[j] = W|C|T
function get_win_sides(dp) {
  return _.map(dp.omat[1], get_win_side);
}

var win_lose_code_table = { 'W': 'win', 'L': 'lose', 'T': 'tie', 'S': 'switch' };

function get_win_lose_code(win_side, side) {
  if (side) {
    if (win_side == 'T') return 'T';
    if (side == 'CW' || side == 'WC') return 'S';
    if (win_side == side) return 'W';
    return 'L';
  } else return "";
}


// wlm[i][j] = W|L|T|"" for ith player and jth game
function get_win_lose_matrix(dp) {
  var wlm = [];
  for (var i = 2; i < dp.rows; i++) {
    var r = [];
    for (var j = 1; j < dp.cols; j++) {
      r[j] = get_win_lose_code(dp.win_sides[j], get_raw_value(dp.raw, i, j));
    }
    wlm[i] = r;
  }
  return wlm;
}

function arr_slice(arr, indices) {
  return _.map(indices, function(i) { return arr[i]; });
}

// from the spreadsheet input
// compute statistics for each player
// players[i] is a structure with 
//   id     index in raw's row
//   name   first column data
//   game_indices[k]
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
function get_player_info(dp, i) {
  var player = {};
  player.id = i;
  player.name = dp.player_names[i];
  var game_indices = [];
  var all_sides = dp.omat[i];
  for (var j = 1; j < dp.cols; j++) { if (all_sides[j] && all_sides[j] != '0') { game_indices.push(j); } }
  player.game_indices = game_indices;
  player.attend_days = arr_slice(dp.omat[0], game_indices);
  player.sides = arr_slice(dp.omat[i], game_indices);
  player.win_lose_codes = arr_slice(dp.win_lose_matrix[i], game_indices);
  var wl_counts = get_win_lose_counts(player.win_lose_codes);
  var scores = get_scores(wl_counts);
  var side_counts = _.countBy(player.sides, function(c) {return c;});
  player.attend = game_indices.length;
  player = $.extend({}, player, wl_counts, scores, side_counts);
  
  return player;
}

function get_win_lose_counts(win_lose_codes) {
  var win_lose_code_table = { 'W': 'win', 'L': 'lose', 'T': 'tie', 'S': 'switch' };
  return _.countBy(win_lose_codes, function(c) { return win_lose_code_table[c]; });
}

function get_scores(wl_counts) {
  var total = 0; var avg = 0; var acc = 0;
  if (wl_counts.win) { total += wl_counts.win; acc += 3 * wl_counts.win; }
  if (wl_counts.tie) { total += wl_counts.tie; acc += 1.5 * wl_counts.tie; }
  if (wl_counts['switch']) { var n = wl_counts['switch']; total += n; acc += 1.5 * n; }
  if (wl_counts.lose) { var n = wl_counts.lose; total += n; acc += 0; }
  return { 'acc': acc, 'impact': (acc + 3) / (total + 3) };  
}

function get_players(dp) {
  var players = [];
  for (i = 2; i < dp.rows; i++) players[i] = get_player_info(dp, i);
  return players;
}

//var comments = {};
//comments['3/29/2014']['CL'] = '少父聊发中年狂，左牵黄，右擎苍。弃帽脱裘，健骑卷平冈。欲沐春露驭赤兔，亲射虎，看李郎。'
//　　 + '雨酣胸胆尚开张，鬓微霜，又何妨！持球泥中，今日过冯唐！会挽雕弓如满月，西北望，射天狼。';
}