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
    if (hash == "" || hash === "#dashboard") {
      dashboard_controller.render();
    } else if (hash === "#games") {
      games_controller.render();
    } else if (hash === "#players") {
      players_controller.render();
    } else {
      var names = hash.split('/');
      if (names.length < 2) return;
      if (names[0] == "#players") players_controller.render_player(names[1]);
    }
  }

  load_data(route);
  
  window.update_on_hash = route;

}());