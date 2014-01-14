"use strict";
/*
 * Copyright 2014 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

var tabLinks = new Array();
var contentDivs = new Array();

function init() {
  var tabListItems = document.getElementById('tabs').childNodes;
  
  for (var i = 0; i < tabListItems.length; i++) {
    if (tabListItems[i].nodeName == "LI") {
      var tabLink = getFirstChildWithTagName(tabListItems[i], 'A');
      var id = getHash(tabLink.getAttribute('href'));
      
      tabLinks[id] = tabLink;
      contentDivs[id] = document.getElementById(id);
    }
  }

  var i = 0;

  for (var id in tabLinks) {
    tabLinks[id].onclick = showTab;
    tabLinks[id].onfocus = function() {
      this.blur();
    };
    if (id == 'preview') {
      tabLinks[id].className = 'selected';
      showPreview();
    }
    i++;
  }

  i = 0;

  for (var id in contentDivs) {
    if (i != 0) {
      contentDivs[id].className = 'tab-content hide';
    }
    i++;
  }
}

function getFirstChildWithTagName(element, tagName) {
  for (var i = 0; i < element.childNodes.length; i++) {
    if (element.childNodes[i].nodeName == tagName) {
      return element.childNodes[i];
    }
  }
}

function getHash(url) {
  var hashPos = url.lastIndexOf('#');
  return url.substring(hashPos + 1);
}

function showTab() {
  var selectedId = getHash(this.getAttribute('href'));

  if (selectedId == 'preview') {
    showPreview();
  }

  for (var id in contentDivs) {
    if (id == selectedId) {
      tabLinks[id].className = 'selected';
      contentDivs[id].className = 'tab-content';
    } else {
      tabLinks[id].className = '';
      contentDivs[id].className = 'tab-content hide';
    }
  }

  // prevent the browser from following the clicked link
  return false;
}

function getTextArea(id) {
  return getFirstChildWithTagName(document.querySelector(id), 'TEXTAREA');
}

function showPreview() {
  var iframe = document.querySelector('iframe');
  iframe.src = '../polymer-animation/web-animations.html';
  
  iframe.onload = function() {
    var w = iframe.contentWindow;
    var d = iframe.contentWindow.document;

    w.animation = new Animation(null, null, 0);
    
    var content = d.createElement('div');
    content.innerHTML = getTextArea('#html .code').value;
    d.body.appendChild(content);
    
    var style = d.createElement('style');
    style.textContent = getTextArea('#css .code').value;
    d.body.appendChild(style);

    var script = d.createElement('script');
    script.textContent = getTextArea('#javascript .code').value;
    d.body.appendChild(script);

    var player = d.timeline.play(w.animation);
    document.querySelector('wat-player-controls').player = player;

    if (player.source._children) {
      document.querySelector('wat-bezier').target = 
          document.querySelector('wat-player-controls').
          player.source._children[0];
    }
  }
}