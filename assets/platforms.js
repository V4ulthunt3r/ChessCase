/* Chess Case — platform configuration and platform choice.

   This is the one place to edit when a store link, release status, privacy URL, supported
   devices or a screenshot of the Android gallery changes. See "Platforms" in README.md.

   Loaded synchronously in <head> (it is small), so <html data-platform="…"> is set before the
   first paint and the page never flashes the wrong platform. Rendering happens in site.js.

   Choice of platform, first match wins:
     1. ?platform=ios | ?platform=android in the URL (not saved)
     2. the visitor's own earlier choice (localStorage "platform")
     3. the device: iPhone/iPad → ios, Android → android
     4. defaultPlatform
   No redirects, no cookies, nothing leaves the browser. */
(function () {
  var config = {
    defaultPlatform: 'ios',

    platforms: {
      ios: {
        name: 'iOS',
        /* comingSoon | beta | available. "beta" and "available" need a valid URL below,
           otherwise the page falls back to "comingSoon". */
        status: 'comingSoon',
        storeUrl: '',                 /* https://apps.apple.com/… once the app is live */
        betaUrl: '',                  /* https://testflight.apple.com/join/… for a public beta */
        urlPattern: /^https:\/\/(apps\.apple\.com|testflight\.apple\.com)\//,
        store: 'App Store',
        /* Optional wording per store, overriding text[lang][status] below. */
        lead: {
          en: { comingSoon: 'Coming soon to the', beta: 'Join the beta for the', available: 'Download on the' },
          de: { comingSoon: 'Bald im', beta: 'Zur Beta für den', available: 'Laden im' }
        },
        icon: 'i-apple',
        version: '',                  /* e.g. '1.0' once released; empty hides the row */
        privacy: { en: 'privacy.html', de: 'privacy-de.html', final: true },
        facts: {
          en: [
            ['i-hinge', 'Designed for iPhone Duo'],
            ['i-phone', 'iPhone & iPad · iOS 18 or later'],
            ['i-globe', 'Interface in English'],
            ['i-card', 'Purchases through the App Store']
          ],
          de: [
            ['i-hinge', 'Entwickelt für iPhone Duo'],
            ['i-phone', 'iPhone & iPad · ab iOS 18'],
            ['i-globe', 'Oberfläche auf Englisch'],
            ['i-card', 'Käufe über den App Store']
          ]
        },
        gallery: []
      },

      android: {
        name: 'Android',
        status: 'comingSoon',
        storeUrl: '',                 /* https://play.google.com/store/apps/details?id=com.hildel.duochess */
        betaUrl: '',                  /* https://play.google.com/apps/testing/com.hildel.duochess */
        urlPattern: /^https:\/\/play\.google\.com\//,
        store: 'Google Play',
        icon: 'i-store',
        version: '',
        /* final: false keeps the footer label "pre-release" and the page on noindex.
           Flip to true only once the reviewed policy is published at these URLs. */
        privacy: { en: 'privacy-android.html', de: 'privacy-android-de.html', final: false },
        facts: {
          en: [
            ['i-foldable', 'Made for Android foldables'],
            ['i-phone', 'Android phones · Android 8.0 or later'],
            ['i-globe', 'Interface in English and German'],
            ['i-card', 'Purchases through Google Play']
          ],
          de: [
            ['i-foldable', 'Gemacht für faltbare Android-Phones'],
            ['i-phone', 'Android-Phones · ab Android 8.0'],
            ['i-globe', 'Oberfläche auf Deutsch und Englisch'],
            ['i-card', 'Käufe über Google Play']
          ]
        },
        /* The "In action" gallery. Files live in assets/img/android/<lang>/, one copy per
           language because the app UI is localised. Pre-release screens, so they are labelled. */
        gallery: [
          { file: 'phone-game.jpg', w: 720, h: 1280,
            alt: { en: 'Chess Case on an Android phone: a Classic Walnut game after a few opening moves, “White to move” below the board, Close case and Menu above it.',
                   de: 'Chess Case auf einem Android-Phone: eine Partie auf „Klassischer Nussbaum“ nach einigen Eröffnungszügen, darunter „Weiß am Zug“, darüber „Koffer schließen“ und „Menü“.' },
            caption: { en: 'Two players on Classic Walnut', de: 'Zu zweit auf Klassischer Nussbaum' } },
          { file: 'phone-clock.jpg', w: 720, h: 1280,
            alt: { en: 'A clock duel on Tournament Green: green and ivory squares, with both players’ remaining time under the board.',
                   de: 'Ein Uhrenduell auf „Turniergrün“: grüne und elfenbeinfarbene Felder, darunter „Schwarz am Zug“ und die Restzeit beider Seiten.' },
            caption: { en: 'Clock duel on Tournament Green', de: 'Uhrenduell auf Turniergrün' } },
          { file: 'phone-analysis.jpg', w: 720, h: 1280,
            alt: { en: 'The analysis board on Ocean Blue: blue and mist squares, “White to move” below the board.',
                   de: 'Das Analysebrett auf „Ozeanblau“: blaue und nebelgraue Felder, darunter „Weiß am Zug“.' },
            caption: { en: 'Analysis on Ocean Blue', de: 'Analyse auf Ozeanblau' } }
        ]
      }
    },

    /* Interface strings shared by every platform. */
    text: {
      en: {
        comingSoon: 'Coming soon to', beta: 'Join the beta on', available: 'Get it on',
        status: { comingSoon: 'In development', beta: 'Public beta', available: 'Available' },
        version: 'Version',
        announce: 'Showing Chess Case for {name}.',
        privacyFinal: 'Privacy – {name}', privacyDraft: 'Privacy – {name} (pre-release)'
      },
      de: {
        comingSoon: 'Demnächst bei', beta: 'Zur Beta bei', available: 'Jetzt bei',
        status: { comingSoon: 'In Entwicklung', beta: 'Öffentliche Beta', available: 'Verfügbar' },
        version: 'Version',
        announce: 'Chess Case für {name} wird angezeigt.',
        privacyFinal: 'Datenschutz – {name}', privacyDraft: 'Datenschutz – {name} (vor Veröffentlichung)'
      }
    }
  };

  var root = document.documentElement;
  var has = function (p) { return typeof p === 'string' && Object.prototype.hasOwnProperty.call(config.platforms, p); };

  function detect() {
    var nav = window.navigator || {};
    var ua = nav.userAgent || '';
    if (/Android/i.test(ua) || (nav.userAgentData && /android/i.test(nav.userAgentData.platform || ''))) return 'android';
    /* iPadOS reports a Mac user agent; touch points tell it apart from a real Mac. */
    if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && nav.maxTouchPoints > 1)) return 'ios';
    return null;
  }

  var current = null, source = 'default';
  try {
    var q = new URLSearchParams(location.search).get('platform');
    if (q && has(q.toLowerCase())) { current = q.toLowerCase(); source = 'url'; }
  } catch (e) {}
  if (!current) {
    try { var saved = localStorage.getItem('platform'); if (has(saved)) { current = saved; source = 'saved'; } } catch (e) {}
  }
  if (!current) { var d = detect(); if (d) { current = d; source = 'device'; } }
  if (!current) current = config.defaultPlatform;

  /* Status as the page should show it: a status that needs a link falls back without one. */
  config.effectiveStatus = function (p) {
    var c = config.platforms[p];
    var url = c.status === 'available' ? c.storeUrl : c.status === 'beta' ? (c.betaUrl || c.storeUrl) : '';
    return url && c.urlPattern.test(url) ? { status: c.status, url: url } : { status: 'comingSoon', url: '' };
  };

  config.current = current;
  config.source = source;
  root.setAttribute('data-platform', current);
  window.ChessCase = config;
})();
