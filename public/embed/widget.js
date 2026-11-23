/**
 * TalentXcel Universal Async Embed Widget Loader
 * https://www.talentxcel.in
 * Lightweight, zero-dependency async script (< 3KB)
 */
(function() {
  'use strict';

  var BASE_ORIGIN = 'https://www.talentxcel.in';

  // Find origin from current script tag if hosted on custom domain
  try {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].src || '';
      if (src.indexOf('/embed/widget.js') !== -1) {
        var a = document.createElement('a');
        a.href = src;
        BASE_ORIGIN = a.origin || BASE_ORIGIN;
        break;
      }
    }
  } catch (e) {}

  function initWidgets() {
    var elements = document.querySelectorAll('[data-asset-id], [data-category]');
    for (var j = 0; j < elements.length; j++) {
      mountWidget(elements[j]);
    }
  }

  function mountWidget(container) {
    if (container.getAttribute('data-txc-mounted') === 'true') return;
    container.setAttribute('data-txc-mounted', 'true');

    var assetId = container.getAttribute('data-asset-id') || '';
    var category = container.getAttribute('data-category') || '';
    var slug = container.getAttribute('data-slug') || '';
    var theme = container.getAttribute('data-theme') || 'dark';
    var layout = container.getAttribute('data-layout') || 'standard';

    var embedUrl = BASE_ORIGIN + '/embed/';
    if (category && slug) {
      embedUrl += encodeURIComponent(category) + '/' + encodeURIComponent(slug);
    } else if (assetId) {
      embedUrl += encodeURIComponent(assetId);
    } else {
      return;
    }

    var pubDomain = window.location.hostname || 'direct';
    embedUrl += '?theme=' + encodeURIComponent(theme) + '&layout=' + encodeURIComponent(layout) + '&pub_ref=' + encodeURIComponent(pubDomain);

    var iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.title = 'TalentXcel Verified Career Intelligence';
    iframe.loading = 'lazy';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    iframe.style.width = '100%';
    iframe.style.maxWidth = '600px';
    iframe.style.minHeight = layout === 'compact' ? '220px' : '340px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '12px';
    iframe.style.display = 'block';
    iframe.style.overflow = 'hidden';
    iframe.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';

    container.innerHTML = '';
    container.appendChild(iframe);
  }

  // Automatic Height Adjustment via PostMessage
  window.addEventListener('message', function(event) {
    if (!event.data || event.data.type !== 'txc-embed-resize') return;
    var iframes = document.querySelectorAll('iframe');
    for (var k = 0; k < iframes.length; k++) {
      if (iframes[k].contentWindow === event.source && event.data.height) {
        iframes[k].style.height = event.data.height + 'px';
      }
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidgets);
  } else {
    initWidgets();
  }
})();
