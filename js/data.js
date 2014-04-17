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
})*/

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
  return raw.records[i][raw.fields[j].id].trim();
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
// the first row is game day
// the second row is game score
// the first column is player names
function get_omat(raw) {
  var omat = [];
  var rows = get_raw_rows(raw);
  for (var i = 0; i < rows; i++) {
    omat[i] = get_raw_row(raw, i);
  }
  return omat;
}

// normalized raw data
// input omat
// return a data structure contains all information
// { 
//   player_count: number of players
//   game_count:  number of games
//   smat: side info matrix, N x M, smat(i, j) is side info of ith player and jth game
//   player_names: player name array, N x 1, players[i] is ith player name, start from 0
//   days: array of game day, M x 1, days[j] is jth game's day
//   game_scores: array of scores, M x 1, scores[j] is jth game's score
// }
// 
function get_ndata(dp) {
  var N = dp.rows - 2;
  var M = dp.cols - 1;
  var smat = [];
  var players = [];
  for (var i = 0; i < N; i++) { 
    smat[i] = dp.omat[i+2].slice(1, 1 + M); 
    players[i] = dp.omat[i+2][0];
  }
  var days = dp.omat[0].slice(1, 1 + M);
  var scores = dp.omat[1].slice(1, 1 + M);
  return { player_count: N, game_count: M, smat: smat, player_names: players, 
           days: days, game_scores: scores };
}

// input ndata
// return a data structure contains high level data products
// {
//   win_sides: M x 1, 'W' if white wins, 'C' if color wins, 'T' if tie
//   wlmat: N x M, win/lose matrix, wlmat[i][j] is win/lose code for ith player in jth game
//   games: M x 1 array of game statistics structure
//   players: N x 1 array of player statistics structure
//   splayers: hash of sorted players, based on different score metrics
// }
function get_pndata(ndata) {
  var win_sides = _.map(ndata.scores, get_win_side);
  var wlmat = get_wlmat(ndata, win_sides);
  var games = get_games(ndata, win_sides);
  var players = get_players(ndata, win_sides, wlmat);
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

function get_win_lose_code(win_side, side) {
  if (side) {
    if (win_side == 'T') return 'T';
    if (side == 'CW' || side == 'WC') return 'S';
    if (win_side == side) return 'W';
    return 'L';
  } else return "";
}

// wlm[i][j] = W|L|T|"" for ith player and jth game
function get_wlmat(ndata, win_sides) {
  var wlm = [];
  for (var i = 0; i < ndata.N; i++) {
    var r = [];
    for (var j = 0; j < ndata.M; j++) {
      r[j] = get_win_lose_code(win_sides[j], ndata.smat[i][j]);
    }
    wlm[i] = r;
  }
  return wlm;
}

function get_games(ndata, win_sides) {
  var games = [];
  for (var i = 0; i < ndata.M; i++) {
    var game = {};
    game.id = i;
    game.day = ndata.days[i];
    game.score = ndata.scores[i];
    var white_team = []; var color_team = []; var nplayers = 0;
    for (j = 0; j < ndata.N; j++) {
      var side = ndata.smat[j][i];
      if (side && side != "0") nplayers++;
      if (side == 'W') white_team.push(i);
      else if (side == 'C') color_team.push(i);
      else if (side == 'WC' || side == 'CW') { white_team.push(i); color_team.push(i); }
    }
    game.white_team = white_team; 
    game.color_team = color_team;
    game.nplayers = nplayers;
    games[i] = game;
  }
  return games;
}

// =========================>

// raw
// fields: ids for each column
// records: field_id: value
// records[i][fields[j].id] is the value in i-th row and j-th column
// the first column is the player's id
function create_data_products(raw) {
  var dp = {};
  
  // constants/definitions
  dp.win_lose_code_table = { 'W': 'win', 'L': 'lose', 'T': 'tie', 'S': 'switch' };

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
  dp.nplayers_by_score = sort_players_by_score(dp.nplayers);
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
    //var name = dp.player_names[i];
    if (side && side != "0") nplayers++;
    if (side == 'W') white_team.push(i);
    else if (side == 'C') color_team.push(i);
    else if (side == 'WC' || side == 'CW') { white_team.push(i); color_team.push(i); }
  }
  game.white_team = white_team; 
  game.color_team = color_team;
  game.nplayers = nplayers;
  return game;
}

// win_sides[j] = W|C|T
function get_win_sides(dp) {
  return _.map(dp.omat[1], get_win_side);
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

function is_attend(side_str) {
  return (side_str && side_str != '0');
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
  //player.attend_mask = _.map(all_sides, is_attend);
  
  var stats_all = get_player_stats_from_last_n_days(dp, dp.cols - 1, i);
  
  player = $.extend({}, player, stats_all);
  
  var N = 10;
  player.stats_N = get_player_stats_from_last_n_days(dp, N, i);
  
  return player;
}

function get_player_stats_from_last_n_days(dp, N, i) {
  var stats = {};
  var game_indices = [];
  var all_sides = dp.omat[i];
  for (var j = dp.cols - N; j < dp.cols; j++) { if (is_attend(all_sides[j])) { game_indices.push(j); } }
  stats.game_indices = game_indices;
  stats.attend_days = arr_slice(dp.omat[0], game_indices);
  stats.sides = arr_slice(dp.omat[i], game_indices);
  stats.win_lose_codes = arr_slice(dp.win_lose_matrix[i], game_indices);
  var wl_counts = get_win_lose_counts(stats.win_lose_codes);
  var scores = get_scores(wl_counts);
  var side_counts = _.countBy(stats.sides, function(c) {return c;});
  stats.attend = game_indices.length;
  stats.attend_rate = stats.attend / N;
  stats = $.extend({}, stats, wl_counts, scores, side_counts);
  return stats;
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

function sort_players_by_score(players) {
  var players_by_score = {};
  _.each(["acc", "impact", "attend"], function(score_type) {
    players_by_score[score_type] = _.sortBy(players, score_type).reverse();
  });
  return players_by_score;
}

//var comments = {};
//comments['3/29/2014']['CL'] = '少父聊发中年狂，左牵黄，右擎苍。弃帽脱裘，健骑卷平冈。欲沐春露驭赤兔，亲射虎，看李郎。'
//　　 + '雨酣胸胆尚开张，鬓微霜，又何妨！持球泥中，今日过冯唐！会挽雕弓如满月，西北望，射天狼。';
}