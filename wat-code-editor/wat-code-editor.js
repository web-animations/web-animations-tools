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

Polymer('wat-code-editor', {
  mode: 'columns',
  javascript: '',
  previewJavascript: '',
  html: '',
  css: '',
  theme: 'github',
  themeOptions: ['ambiance', 'chaos', 'chrome', 'clouds', 'clouds_midnight',
      'cobalt', 'crimson_editor', 'dawn', 'dreamweaver', 'eclipse', 'github',
      'idle_fingers', 'katzenmilch', 'kr_theme', 'kuroir', 'merbivore',
      'merbivore_soft', 'mono_industrial', 'monokai', 'pastel_on_dark',
      'solarized_dark', 'solarized_light', 'terminal', 'textmate', 'tomorrow',
      'tomorrow_night', 'tomorrow_night_blue', 'tomorrow_night_bright',
      'tomorrow_night_eighties', 'twilight', 'vibrant_ink', 'xcode'],
  showGutter: true,
  tabSize: 2,
  useWrapMode: true,
  showPrintMargin: true,

  ready: function() {
    this.selected = ['javascript', 'html', 'css'];
    this.updatePreview();
  },

  toggle: function() {
    this.mode = this.mode == 'columns' ? 'rows' : 'columns';
  },

  htmlChanged: function() {
    this.reload();
  },

  cssChanged: function() {
    if (this.previewStyle) {
      this.previewStyle.textContent = this.css;
    }
  },

  selectedChanged: function() {
    var editors = [this.$.javascript, this.$.html, this.$.css];
    var visible = [];
    
    editors.forEach(function(editor) {
      var hidden = !this.selected || this.selected.indexOf(editor.id) < 0;
      if (hidden) {
        editor.setAttribute('hidden', null);
      } else {
        editor.removeAttribute('hidden');
        visible.push(editor);
      }
    }.bind(this));
    
    if (visible.length == 0) {
      this.$.container2.setAttribute('hidden', null);
    } else {
      this.$.container2.removeAttribute('hidden');
      if (visible.length == 1) {
        this.$.container2.appendChild(visible[0]);
      } else if (visible.length == 2) {
        this.$.container2.appendChild(visible[0]);
        this.$.container2.appendChild(visible[1]);
      } else if (visible.length == 3) {
        this.$.container1.appendChild(visible[0]);
        this.$.container2.appendChild(visible[1]);
        this.$.container2.appendChild(visible[2]);
      }
    }
    this.style.display = 'none';
    this.offsetTop; // FIXME (once Chrome is fixed)
    this.style.display = '';
  },

  timedItemChanged: function(oldValue, newValue) {
    if (!oldValue) {
      this.updateCode();
      this.previewJavaScript = this.javascript;
    }
  },

  updateCode: function() {
    this.javascript = 'document.timeline.play(' +
        serializeTimedItem(this.timedItem) + ');';
  },

  updatePreview: function() {
    this.previewJavaScript = this.javascript;
    this.reload();
  },

  reload: function() {
    var preview = this.$['preview-frame'];

    var d = preview.contentDocument;
    if (!d) {
      preview.onload = this.updatePreview.bind(this);
      return;
    }

    d.open();
    d.write('<!DOCTYPE html>');
    d.write('<script src="../../web-animations-js/web-animations.js"></script>');
    d.write('<style>body { };</style>')
    d.write(this.html);
    d.close();

    preview.onload = function() {
      var w = preview.contentWindow;
      var d = preview.contentWindow.document;

      this.previewStyle = d.querySelector('style');
      this.previewStyle.textContent = this.css;

      var script = d.createElement('script');
      script.textContent = this.previewJavaScript;
      d.body.appendChild(script);
      
      if (d.timeline.getCurrentPlayers().length > 0) {
        var player = d.timeline.getCurrentPlayers()[0];
        this.$['player-controls'].player = player;
        this.timedItem = player.source;
        window.Animation = w.Animation;
        window.ParGroup = w.ParGroup;
        window.SeqGroup = w.SeqGroup;
        window.KeyframeEffect = w.KeyframeEffect;
        window.MotionPathEffect = w.MotionPathEffect;
      } else {
        console.error('Could not find any active players.');
      }
    }.bind(this);
  },

  clearAll: function() {
    this.timedItem = new Animation(null, null, 0);
    this.javascript = this.css = this.html = '';
    this.updateCode();
  }
});
