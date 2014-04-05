(function () {

  "use strict";

  document.addEventListener("deviceready", function () {
    FastClick.attach(document.body);
    StatusBar.overlaysWebView(false);
  }, false);


  // Show/hide menu toggle
  $('#btn-menu').click(function () {
    if ($('#container').hasClass('offset')) { $('#container').removeClass('offset'); } 
    else { $('#container').addClass('offset'); }
    return false;
  });
  
  function hide_menu() {
    if ($('#container').hasClass('offset')) { $('#container').removeClass('offset'); } 
  }

  // Basic view routing
  $(window).on('hashchange', route);

  function route() {
    var hash = window.location.hash;
    hide_menu(); 
    if (hash == "" || hash === "#dashboard/1") {
        dashboard1.render();
    } else if (hash === "#dashboard/games") {
        dashboard_games.render();
    } else if (hash === "#dashboard/players") {
        dashboard_players.render();
    }
  }

  load_data(route);
  
  window.update_on_hash = route;

}());