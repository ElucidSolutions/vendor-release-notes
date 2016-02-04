// This site's base URL.
var baseURL = 'http://www.elucidsolutions.com/projects/OAM/vendor-release-notes';

// The RSS File Path.
var rssPath = '/releases.rss';

// The Releases document URL.
var releasesURL = 'releases.xml';

// The releases queued for display.
var releasesToDisplay = [];

// The default number of releases to display.
var defaultNumReleasesToDisplay = 1;

// The number of releases to display.
var numReleasesToDisplay = defaultNumReleasesToDisplay;

// The number of releases to add each time the user clicks on the 'more' link.
var numReleasesToAdd = 10;

// Accepts a Releases XML document, parses the XML element, and returns the result. 
function parseReleases (releasesDocument) {
  return $('release', releasesDocument).map (function (releaseIndex, releaseElement) {
    return {
      'date': Date.parse ($('date', releaseElement).text ()),
      'changes': $('changes', releaseElement).children ('change').map (function (changeIndex, changeElement) {
        return {
          'title':      $('title', changeElement).html (),
          'number':     $('number', changeElement).text (),  
          'system':     $('system', changeElement).text (),
          'type':       $('type', changeElement).text (),
          'motivation': {
            'description': $('motivation > description', changeElement).html (),
            'images':      $('motivation > images', changeElement).children ('image').map (function (imageIndex, imageElement) {
              return {
                'url':           $('url', imageElement).text (),
                'caption':       $('caption', imageElement).html (),
                'alternateText': $('alternateText', imageElement).html ()
              };
            })
          },
          'effect': {
            'description': $('effect > description', changeElement).html (),
            'images':      $('effect > images', changeElement).children ('image').map (function (imageIndex, imageElement) {
              return {
                'url':           $('url', imageElement).text (),
                'caption':       $('caption', imageElement).html (),
                'alternateText': $('alternateText', imageElement).html ()
              };
            })
          }
        };
      })
    };
  });
}

/*
  Accepts two arguments: url, a URL string that
  references a Release Notes XML file; and
  continuation, a function that accepts the
  parsed ReleaseNotes object; parses the
  file and returns the ReleaseNotes object.
*/
function getReleases (url, continuation) {
  $.ajax (url, {
    dataType: 'xml',
    success: function (releasesDocument) {
      continuation (parseReleases (releasesDocument));
    },
    error: function (request, status, error) {
      alert (error);
    }
  });
}

// Accepts an array of Releases and returns their dates.
function getReleaseDates (releases) {
  return releases.map (function (releaseIndex, release) {
    return release.date;
  });
}

/*
  Accepts an array of dates and sorts them so that
  the most recent dates are first.
*/
function sortDates (dates) {
  return dates.sort (function (date0, date1) {
    return date1.compareTo (date0);
  });
}

/*
  Accepts three arguments: releases, an array of
  releases; year, an integer that represents a
  year; and month, a long month name; and returns
  those releases that were published in the given
  year/month.
*/
function filterReleaseByDate (releases, year, month) {
  return releases.filter (function (releaseIndex, release) {
    return release.date.toString ('MMMM') === month &&
           release.date.getFullYear () === year;
  });
}

/*
  Accepts an array of Releases and sorts them by
  date so that the most recent releases are first.
*/
function sortReleasesByDate (releases) {
  return releases.sort (function (release0, release1) {
    return release1.date.compareTo (release0.date);
  });
}

/*
  Accepts a ReleaseNotes object and returns a HTML
  element that represents it.
*/
function releasesToHTML (releases) {
  var releasesElement = $('<div></div>').addClass ('releases');

  for (var releaseIndex = 0; releaseIndex < releases.length; releaseIndex ++) {
    var release = releases [releaseIndex];
    var releaseElement = $('<div></div>').addClass ('release')
          .append ($('<h2></h2>').addClass ('release-header').text (release.date.toString ('MMMM yyyy')));
  
    for (var index = 0; index < release.changes.length; index ++) {
      var change = release.changes [index];
      var changeElement = $('<div></div>').addClass ('change')
            .append ($('<div></div>').addClass ('change-header')
              .append ($('<h2></h2>').addClass ('change-title').html (change.title))
              .append ($('<h2></h2>').addClass ('change-system').text (change.system)))
            .append ($('<div></div>').addClass ('change-type').text (change.type));
  
      if (change.motivation) {
        changeElement
          .append ($('<div></div>').addClass ('change-question change-motivation')
            .append ($('<h3></h3>').addClass ('change-motivation-title').text ('Why was this changed?'))
            .append (change.motivation.description));

        for (var imageIndex = 0; imageIndex < change.motivation.images.length; imageIndex ++) {
          var image = change.motivation.images [imageIndex];
          changeElement
            .append ($('<div></div>').addClass ('screenshotContainer')
              .append ($('<div></div>').addClass ('screenshotBox')
              .append ($('<a></a>').addClass ('fancybox').attr ('href', image.url).attr ('title', '')
                .append ($('<img></img>').addClass ('screenshot').attr ('src', image.url).attr ('alt', image.alternateText)))
              .append ($('<div></div>').addClass ('screenshotText')
                .append ($('<p></p>').addClass ('figCaption').text (image.caption))
                .append ($('<p></p>').addClass ('clickTo').text ('Click the image to enlarge')))));
        }
      }

      if (change.effect) {
        changeElement
          .append ($('<div></div>').addClass ('change-question change-effects')
            .append ($('<h3></h3>').addClass ('change-effects-title').text ('What must I do?'))
            .append (change.effect.description));

        for (var imageIndex = 0; imageIndex < change.effect.images.length; imageIndex ++) {
          var image = change.effect.images [imageIndex];
          changeElement
            .append ($('<div></div>').addClass ('screenshotContainer')
              .append ($('<div></div>').addClass ('screenshotBox')
              .append ($('<a></a>').addClass ('fancybox').attr ('href', image.url).attr ('title', '')
                .append ($('<img></img>').addClass ('screenshot').attr ('src', image.url).attr ('alt', image.alternateText)))
              .append ($('<div></div>').addClass ('screenshotText')
                .append ($('<p></p>').addClass ('figCaption').text (image.caption))
                .append ($('<p></p>').addClass ('clickTo').text ('Click the image to enlarge')))));
        }
      }
  
      releaseElement.append (changeElement);

      if (index < release.changes.length - 1) {
        releaseElement.append ('<hr></hr>').addClass ('change-divider');
      }

      releasesElement.append (releaseElement);
    }
  }

  return releasesElement;
}

/*
  Returns an RSS document that lists the given
  release notes.
  Note: Mozilla contains a bug in which JQuery can
  not be used to create tags named 'link' with
  attached text nodes.
*/
function releasesToRSS (releases) {
  var rss = '<?xml version="1.0" encoding="utf-8"?><rss version="2.0"><channel><title>eOffer/eMod Release Notes</title><description>The latest release notes for eOffer and eMod.</description>';
  rss += '<link>' + baseURL + rssPath + '</link>';
  rss += '<lastBuildDate>' + Date.now ().toUTCString () + '</lastBuildDate>';
  rss += '<pubDate>' + Date.now ().toUTCString () + '</pubDate>';

  for (var releaseIndex = 0; releaseIndex < releases.length; releaseIndex ++) {
    var release = releases [releaseIndex];
    for (var changeIndex = 0; changeIndex < release.changes.length; changeIndex ++) {
      var change = release.changes [changeIndex];
      var url = baseURL + '#' + change.number;

      rss += '<item>';
      rss += '<title><![CDATA[' + change.title + ']]></title>';
      rss += '<description><![CDATA[' + change.effect.description + ']]></description>';
      rss += '<link>' +  url + '</link>';
      rss += '<guid>' + url + '</guid>';
      rss += '<pubDate>' + release.date.toUTCString () + '</pubDate>'
      rss += '</item>';
    }
  }

  rss += '</channel></rss>';

  return rss;
}

// Updates the display.
function updateDisplay () {
  // display the releases that have been queued for display.
  $('div#releases-section').html (releasesToHTML (sortReleasesByDate (releasesToDisplay).slice (0, numReleasesToDisplay)));

  if (numReleasesToDisplay >= releasesToDisplay.length) {
    $('#load-more-releases').addClass ('disabled');
  } else {
    $('#load-more-releases').removeClass ('disabled');
  }
}

// Disable the Display All Releases button.
function disableDisplayAllReleasesButton () {
  $('#display-all-releases').addClass ('disabled').attr ('title', 'All of the releases are displayed below.');
}

// Enable the Display All Releases button.
function enableDisplayAllReleasesButton () {
    $('#display-all-releases').removeClass ('disabled').attr ('title', 'Click here to display all releases.');
}

// Deselect the date filter.
function deselectDateFilter () {
    $('#filter-releases').prop ('selectedIndex', -1);
}

// Displays all of the releases.
function displayAllReleases () {
  getReleases (releasesURL, function (releases) {
    numReleasesToDisplay = defaultNumReleasesToDisplay;
    releasesToDisplay = releases;
    updateDisplay ();
    disableDisplayAllReleasesButton ();
    deselectDateFilter ();
  });
}

/*
  Displays those releases that were published in
  the selected year/month.
*/
function filterReleasesCallback () {
  var date = new Date ($(this).val ());

  getReleases (releasesURL, function (releases) {
    numReleasesToDisplay = defaultNumReleasesToDisplay;
    releasesToDisplay = filterReleaseByDate (releases, date.getFullYear (), date.toString ('MMMM'));
    updateDisplay ();
    enableDisplayAllReleasesButton ();
  });
}

// Displays the next batch of releases.
function displayMoreReleasesCallback () {
  numReleasesToDisplay += numReleasesToAdd;
  updateDisplay (); 
}

// Sets the event handlers.
function setHandlers () {
  $('select#filter-releases').change (filterReleasesCallback);
  $('input#display-all-releases').click (displayAllReleases);
  $('#load-more-releases').click (displayMoreReleasesCallback);
}
