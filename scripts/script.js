$(function() {

  //mobile sticky hover fix
  document.addEventListener('touchstart', function addtouchclass(e) { // first time user touches the screen
    document.documentElement.classList.add('touchevents')
    document.removeEventListener('touchstart', addtouchclass, false) // de-register touchstart event
  }, false);

  function setHeights() {
    // mobile vh issue fix
    if ($(window).width() < 800) {
      $('.vh-fix').each(function() {
        var setHeight = $(this).height();
        $(this).css({
          'height': setHeight
        });
      });
    } else {
      $('.vh-fix').each(function() {
        $(this).css({
          'height': ""
        });
      });
    }
  //sticky footer
    var footer_h = $('footer').height();
    $('main').css('margin-bottom', footer_h + "px");
  }

  setTimeout(function() {
    setHeights();
  }, 500)

  // recalculate on window resize
  $(window).resize(function() {
    width = $(window).width();
    setHeights();
  });

  /*---- CALENDAR-----*/

  // Initialize the calendar
  var startDate = new Date(2018, 7, 26);
  var endDate = new Date(2018, 9, 6);

  var days = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];

  //get all dates between start and end dates
  function getDateArray(start, end) {
    var arr = new Array();
    var dt = new Date(start);
    while (dt <= end) {
      arr.push(new Date(dt));
      dt.setDate(dt.getDate() + 1);
    }
    console.log(arr);
    return arr;
  }
  var dateArr = getDateArray(startDate, endDate);
  var html = "";

  function makeCalendar() {

    var today = new Date();
    //list days of week
    $(days).each(function(i) {
      $('#days').append('<div class="day">' + days[i] + '</div>');
    });

    //make dates
    Date.prototype.yyyymmdd = function() {
      var mm = this.getMonth() + 1; // getMonth() is zero-based
      var dd = this.getDate();

      return [this.getFullYear(),
              (mm>9 ? '' : '0') + mm,
              (dd>9 ? '' : '0') + dd
            ].join('-');
    };

    var date_i, date_key, date_no, date_class;
    $(dateArr).each(function(i) {
      date_i = dateArr[i];
      date_key =date_i.yyyymmdd();
      date_no = date_i.getDate();

      if (i < 6) {
        date_class = ' month_prev';
      } else if (i > 35) {
        date_class = ' month_next';
      } else {
        date_class = "";
      }

      html += '<div class="date' + date_class + '" data-id="' + date_key + '">' + date_no + '</div>';
    });

    $('#dates').html(html);
    // setTimeout(calculateHeights, 100);
  }

  //EVENTS data
  function getjson(url, callback) {
    var self = this,
      ajax = new XMLHttpRequest();
    ajax.open('GET', url, true);
    ajax.onreadystatechange = function() {
      if (ajax.readyState == 4) {
        if (ajax.status == 200) {
          var data = JSON.parse(ajax.responseText);
          return callback(data);
        } else {
          console.log(ajax.status);
        }
      }
    };
    ajax.send();
  }

  //EVENTS calendar
  function populateCalendar() {
    var url = 'scripts/events.json';
    getjson(url, function(obj) {
      for (key in obj) {
        //for each day with event:
        var id = '[data-id="' + key + '"]';
        var id_events = obj[key]; //list of events on day
        $(id).addClass('has_event');
        $(id).append('<div class="events" data-count="' + id_events.length + '"></div>');

        var event_r = '<div class="next"><svg class="arrow" data-name="arrow" viewBox="0 0 50 50"><title>arrow</title><line x1="4.25" y1="25" x2="43.56" y2="25"/><polyline points="28.5 9.95 43.56 25 28.5 40.05"/></svg></div>';
        var event_l = '<div class="prev"><svg class="arrow left" data-name="arrow" viewBox="0 0 50 50"><title>arrow</title><line x1="4.25" y1="25" x2="43.56" y2="25"/><polyline points="28.5 9.95 43.56 25 28.5 40.05"/></svg></div>';
        //add event slider navigation if more than one event
        var eventNav = "";
        var num_of_events = id_events.length;
        //set up each event
        for (i = 0; i < num_of_events; i++) {
          if (num_of_events > 1) {
            if (i == 0) {
              eventNav = '<div class="event-nav">' + event_r + '</div>';
            } else if (i == num_of_events - 1) {
              eventNav = '<div class="event-nav">' + event_l + '</div>';
            } else {
              eventNav = '<div class="event-nav">' + event_l + event_r + '</div>';
            }
          }

          $(id + ' .events').append('<div class="event"><div class="event-info"><time>' + id_events[i].date_f + '<br>' + id_events[i].time + '</time><h4>' + id_events[i].title + '</h4><p class="location">' + id_events[i].location + '</p>' + eventNav + '</div><div class="close-event"><svg class="x" data-name="close" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 31.33 31.33"><title>close</title><line class="cls-1" x1="1.77" y1="1.77" x2="29.56" y2="29.56"/><line class="cls-1" x1="29.56" y1="1.77" x2="1.77" y2="29.56"/></svg></div></div>');
        }
      }
    });

    var selected;

    //EVENTS slider

    $('#dates').on('click', '.date', function() {
      $('.display').removeClass('display');
      $('.show').removeClass('show');
      //get date group
      selected = $(this).find(">:first-child");
      selected.addClass('display');
      //get display event
      $(this).find(">:first-child > .event:first-child").addClass('show');
    });

    //close event info
    $('#dates').on("click", ".close-event", function(e) {
      e.stopPropagation();
      $(this).parents('.events').removeClass('display');
      $(this).parents('.event').removeClass('show');
    });

    $('#dates').on("click", ".event.show", function(e) {
      e.stopPropagation();
      $(this).removeClass('show');
      $(this).parents('.events').removeClass('display');
    });

    //display next events
    $('#dates').on("click", '.next', function(e) {
      e.stopPropagation();
      var nextEvent = $(this).parents('.event').next('.event');

      $(this).parents('.event').removeClass('show');

      if (nextEvent.length == 0) {
        nextEvent = $(this).parents('.events').children(':first-child');
      }
      nextEvent.addClass('show');
    });

    //display previous events
    $('#dates').on("click", '.prev', function(e) {
      e.stopPropagation();
      var prevEvent = $(this).parents('.event').prev('.event');

      $(this).parents('.event').removeClass('show');

      if (prevEvent.length == 0) {
        prevEvent = $(this).parents('.events').children(':last-child');
      }
      prevEvent.addClass('show');
    });
  }

  makeCalendar();
  populateCalendar();

  //SMOOTH scroll

  // NAV
  $('#menu').click(function() {
    $('#menu-expanded').slideToggle(300);
    $('#open').toggle();
    $('#close').toggle();
  });

  $('nav a').click(function() {
    $('.sticky').css('position', 'relative');
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') || location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html,body').animate({
          scrollTop: target.offset().top
        }, 400);
        $('#menu-expanded').slideUp();
        $('#open').toggle();
        $('#close').toggle();
        $('.sticky').css('position', 'sticky');
        return false;
      }
    }
  });

  //VIDEO functions
  var iframe = document.getElementById('vimeo');

  // $f == Froogaloop
  var player = $f(iframe);
  var visible = 1;
  var playing = 0;
  var playButton = document.getElementById("play-button");
  playButton.addEventListener("click", function() {
    player.api("play");
    playing = 1;
    $('#play-button').fadeOut();
    setTimeout(function() {
      $('.buttons').hide();
      $('#pause-button').show();
      visible = 0;
    }, 1200);
  });

  var pauseButton = document.getElementById("pause-button");
  pauseButton.addEventListener("click", function() {
    player.api("pause");
    playing = 0;
    $('#pause-button').fadeOut();
    setTimeout(function() {
      $('.buttons').hide();
      $('#play-button').show();
      visible = 0;
    }, 1200);
  });


  $('#vid_controls').mousemove(function() {
    if (visible == 0) {
      $('.buttons').fadeIn();
      visible = 1;
      console.log('fadeIn');
      if (playing == 1) {
        setTimeout(function() {
          $('.buttons').fadeOut();
          visible = 0;
        }, 1200);
      }
    }
  });

});
