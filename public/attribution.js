// Ad attribution without cookies, shared by the landing page and the content pages.
//
// The site sets no cookies and stores nothing in the browser, on purpose: no consent banner is
// needed that way. So a visit is attributed from its own address only. Paid ads open the page with
// utm_* parameters (the Google Ads "final URL suffix", or Sklik's UTM option) and Google Ads adds a
// gclid. This script copies them into the store links, where the stores report them:
//
// - Google Play gets them in its `referrer` parameter. Play Console shows store listing
//   acquisitions by utm_source / utm_campaign, and the app can read the whole string, gclid
//   included, through the Play Install Referrer API.
// - The App Store only knows its own campaign links: `pt` (the provider token of the developer
//   account) plus `ct` (a campaign token of up to 40 characters). App Store Connect then shows
//   downloads by `ct`. Until APP_STORE_PT is filled in, App Store links stay as they are.
//
// The address is the only carrier, so links to other pages of the site carry the same parameters
// along; without that, a visitor who reads /eet-2-0 before downloading would lose the attribution.
//
// This file is cached for a year (firebase.json), so every page links it as /attribution.js?v=N.
// Raise N in every page with every change to this file.
(function () {
  // App Store Connect → Analytics → Acquisition → Campaigns → "Generate a campaign link": the
  // number after pt= in the generated link.
  var APP_STORE_PT = '128101608';

  var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid'];
  var params = new URLSearchParams(location.search);
  var found = [];
  KEYS.forEach(function (k) {
    // A keyword arrives through {keyword} and can be any text: cap it so a link never grows huge.
    var v = (params.get(k) || '').trim().slice(0, 100);
    if (v) found.push([k, v]);
  });
  if (!found.length) return;

  var query = found.map(function (p) { return p[0] + '=' + encodeURIComponent(p[1]); }).join('&');
  var get = function (k) {
    for (var i = 0; i < found.length; i++) if (found[i][0] === k) return found[i][1];
    return '';
  };
  // ct allows 40 characters. Source, campaign and ad group are what the report needs to tell ads
  // apart; the keyword would not fit.
  var ct = [get('utm_source') || (get('gclid') ? 'google' : ''), get('utm_campaign'), get('utm_content')]
    .filter(Boolean).join('-').replace(/[^A-Za-z0-9._-]+/g, '_').slice(0, 40);

  Array.prototype.forEach.call(document.querySelectorAll('a[href]'), function (a) {
    var url;
    try { url = new URL(a.getAttribute('href'), location.href); } catch (e) { return; }

    if (url.hostname === 'play.google.com' && url.pathname === '/store/apps/details') {
      url.searchParams.set('referrer', query);
    } else if (url.hostname === 'apps.apple.com' && APP_STORE_PT && ct) {
      url.searchParams.set('pt', APP_STORE_PT);
      url.searchParams.set('ct', ct);
      url.searchParams.set('mt', '8');
    } else if (url.origin === location.origin && url.pathname !== location.pathname && !/\.[a-z0-9]+$/i.test(url.pathname)) {
      // Another page of the site (not a file such as the poster or the IndexNow key): same
      // parameters, so the attribution survives the visit.
      found.forEach(function (p) { url.searchParams.set(p[0], p[1]); });
    } else {
      return;
    }
    a.href = url.href;
  });
})();
