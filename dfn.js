// dfn.js
// makes <dfn> elements link back to all uses of the term
// no copyright is asserted on this file

var dfnMapTarget = -1;
var dfnMapDone = false;
var dfnMap = {};
function initDfn() {
  var links = document.querySelectorAll('a[href*="#"]');
  dfnMapTarget = links.length;
  var k = 0;
  var n = 0;
  var initDfnInternal = function () {
    n += 1;
    var start = new Date();
    while (k < dfnMapTarget) {
      // Don't use .href or .hash because the URL parser is relatively expensive
      var s = links[k].getAttribute('href').split('#')[1];
      if (!links[k].closest('.no-backref, .self-link, ul.index, #idl-index + pre, ol.toc')) {
        if (links[k].hasAttribute('data-x-internal'))
          s = links[k].getAttribute('data-x-internal')
        if (!(s in dfnMap))
          dfnMap[s] = [];
        dfnMap[s].push(links[k]);
      }
      k += 1;
      if ('requestIdleCallback' in window) {
        if (k % 1000 === 0) {
          requestIdleCallback(initDfnInternal);
          return;
        }
      } else {
        if (new Date() - start > 1000) {
          setTimeout(initDfnInternal, 10000);
          return;
        }
      }
    }
    dfnMapDone = true;
    document.body.className += " dfnEnabled";
  }
  initDfnInternal();
}

var dfnPanel;
var dfnUniqueId = 0;
var dfnTimeout;
document.addEventListener('click', dfnShow, false);
function dfnShow(event) {
  if (dfnTimeout) {
    clearTimeout(dfnTimeout);
    dfnTimeout = null;
  }
  if (dfnPanel) {
    dfnPanel.parentNode.removeChild(dfnPanel);
    dfnPanel = null;
  }
  if (dfnMapDone) {
    var node = event.target;
    while (node && (!node instanceof HTMLElement || !(node.localName == 'dfn' || (node instanceof HTMLHeadingElement && node.hasAttribute('data-dfn-type')))))
      node = node.parentNode;
    if (node) {
      event.preventDefault();
      var panel = document.createElement('div');
      panel.className = 'dfnPanel';
      if (node.id || node.parentNode.id) {
        var permalinkP = document.createElement('p');
        var permalinkA = document.createElement('a');
        permalinkA.href = '#' + (node.id || node.parentNode.id);
        permalinkA.textContent = '#' + (node.id || node.parentNode.id);
        permalinkP.appendChild(permalinkA);
        panel.appendChild(permalinkP);
      }
      if (node.firstChild instanceof HTMLAnchorElement) {
        var realLinkP = document.createElement('p');
        realLinkP.className = 'spec-link';
        realLinkP.textContent = 'Spec: ';
        var realLinkA = document.createElement('a');
        realLinkA.href = node.firstChild.href;
        realLinkA.textContent = node.firstChild.href;
        realLinkP.appendChild(realLinkA);
        panel.appendChild(realLinkP);
      }
      var p = document.createElement('p');
      panel.appendChild(p);
      if (node.id in dfnMap || node.parentNode.id in dfnMap) {
        p.textContent = 'Referenced in:';
        var ul = document.createElement('ul');
        var lastHeader;
        var lastLi;
        var n;
        var sourceLinks = [];
        if (node.id in dfnMap)
          for (var i = 0; i < dfnMap[node.id].length; i += 1)
            sourceLinks.push(dfnMap[node.id][i]);
        if (node.parentNode.id in dfnMap)
          for (var i = 0; i < dfnMap[node.parentNode.id].length; i += 1)
            sourceLinks.push(dfnMap[node.parentNode.id][i]);
        for (var i = 0; i < sourceLinks.length; i += 1) {
          var link = sourceLinks[i];
          var header = dfnGetCaption(link);
          var a = document.createElement('a');
          var linkid = link.id;
          if (!linkid) {
            if (link.parentNode.id) {
              linkid = link.parentNode.id;
            } else {
              link.id = 'dfnReturnLink-' + dfnUniqueId++;
              linkid = link.id;
            }
          }
          a.href = '#' + linkid;
          a.onclick = dfnMovePanel;
          if (header != lastHeader) {
            lastHeader = header;
            n = 1;
            var li = document.createElement('li');
            if (typeof header == 'string') {
              a.appendChild(document.createTextNode(header));
            } else {
              var cloneHeader = header.cloneNode(true);
              [].slice.call(cloneHeader.querySelectorAll('a, dfn')).forEach(replaceWithChildren);
              while (cloneHeader.hasChildNodes())
                a.appendChild(cloneHeader.firstChild);
            }
            lastLi = li;
            li.appendChild(a);
            ul.appendChild(li);
          } else {
            n += 1;
            a.appendChild(document.createTextNode('(' + n + ')'));
            lastLi.appendChild(document.createTextNode(' '));
            lastLi.appendChild(a);
          }
        }
        panel.appendChild(ul);
      } else {
        p.textContent = 'No references in this file.';
      }
      node.appendChild(panel);
      dfnPanel = panel;
    }
  } else {
    dfnTimeout = setTimeout(dfnShow, 250, event);
  }
}

function replaceWithChildren(el) {
  while (el.hasChildNodes()) {
    el.parentNode.insertBefore(el.firstChild, el);
  }
  el.parentNode.removeChild(el);
}

function dfnMovePanel(event) {
  dfnPanel.style.position = 'fixed';
  dfnPanel.style.left = '1em';
  dfnPanel.style.bottom = '1em';
  dfnPanel.style.maxWidth = '20em';
  dfnPanel.style.maxHeight = '50vh';
  dfnPanel.style.overflow = 'auto';
  document.body.appendChild(dfnPanel);
  event.stopPropagation();
}

function dfnGetCaption(link) {
  var node = link;
  while (node) {
    if (node instanceof HTMLHeadingElement) {
      return node;
    } else if (node instanceof HTMLElement && node.localName == 'nav') {
      return 'Navigation';
    } else if (!node.previousSibling) {
      node = node.parentNode;
    } else {
      node = node.previousSibling;
    }
  }
  return 'Page';
}

// setup
initDfn();
