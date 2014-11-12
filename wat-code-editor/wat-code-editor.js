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
  /**
   * The message displayed in the top bar of `wat-code-editor`.
   *
   * @attribute message
   * @type string
   * @default ''
   */
  message: '',
  /**
   * The orientation of the code editor panes. Can be set to `rows` or `columns`.
   *
   * @attribute mode
   * @type string
   * @default 'rows'
   */
  mode: 'rows',
  rowsMode: true,
  /**
   * The JavaScript that is run to produce the preview in the preview frame.
   *
   * @attribute javascript
   * @type string
   * @default ''
   */
  javascript: '',
  /**
   * The most recently executed JavaScript.
   *
   * @attribute previewJavascript
   * @type string
   * @default ''
   */
  previewJavascript: '',
  /**
   * The HTML used to specify the contents of the preview frame.
   *
   * @attribute html
   * @type string
   * @default ''
   */
  html: '',
  /**
   * The CSS used to style the contents of the preview frame.
   *
   * @attribute css
   * @type string
   * @default ''
   */
  css: '',
  /**
   * The theme used in the `wat-ace-editor` elements.
   *
   * @attribute theme
   * @type string
   * @default 'github'
   */
  theme: 'github',
  /**
   * Specifies whether or not line numbers are to be displayed in the
   * `wat-ace-editor` elements.
   *
   * @attribute showGutter
   * @type boolean
   * @default true
   */
  showGutter: true,
  /**
   * Specifies the number of spaces per tab to use in the `wat-ace-editor`
   * elements.
   *
   * @attribute tabSize
   * @type number
   * @default 2
   */
  tabSize: 2,
  /**
   * Specifies whether or not to wrap lines when they exceed the width of the
   * `wat-ace-editor` elements.
   *
   * @attribute useWrapMode
   * @type boolean
   * @default true
   */
  useWrapMode: true,
  /**
   * Specifies whether or not vertical rulers are to be displayed in the
   * `wat-ace-editor` elements.
   *
   * @attribute showPrintMargin
   * @type boolean
   * @default true
   */
  showPrintMargin: true,
  state: 'loading',
  update: null,

  ready: function() {
    this.mode = window.localStorage['wat-mode'] || this.mode;
    this.rowsMode = this.mode == 'rows' ? true : false;
    if (window.localStorage['wat-selected-editors'] === undefined) {
      this.selected = ['javascript', 'html', 'css'];
    } else {
      this.selected = window.localStorage['wat-selected-editors'].split(',');
    }
    this.previewFrame = this.$['preview-frame'];
    this.updatePreview();
  },

  observe: {
    'javascript': 'toggleUnsavedIndicator',
    'previewJavascript': 'toggleUnsavedIndicator'
  },

  rowsModeChanged: function() {
    this.mode = this.rowsMode ? 'rows' : 'columns';
  },

  modeChanged: function() {
    window.localStorage['wat-mode'] = this.mode;
  },

  htmlChanged: function() {
    if (this.state == 'loading') {
      return;
    }
    this.updateState('reload');
  },

  cssChanged: function() {
    if (this.state == 'loading') {
      return;
    }
    this.updateState('css');
  },

  updateState: function(state, delay) {
    if (delay === undefined) {
      delay = 500;
    }
    if (state == 'css' && this.state == 'reload') {
      state = 'reload';
    }
    if (this.update) {
      clearTimeout(this.update);
      this.update = null;
    }

    this.state = state;

    this.update = setTimeout(function() {
      if (this.state == 'css') {
        this.previewStyle.textContent = this.css;
      } else if (this.state == 'reload') {
        this.reload();
      }
      this.state = 'idle';
      this.saveFilesToLocalStorage();
    }.bind(this), delay);
  },

  toggleUnsavedIndicator: function() {
    if (this.previewJavascript == this.javascript) {
      this.$.unsaved.setAttribute('hidden', null);
      this.$.run.setAttribute('fade', null);
    } else {
      this.$.unsaved.removeAttribute('hidden');
      this.$.run.removeAttribute('fade');
    }
  },

  selectedChanged: function() {
    window.localStorage['wat-selected-editors'] = this.selected;

    var editors = [this.$.javascript, this.$.html, this.$.css, this.$.keyframe];
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
      } else if (visible.length >= 3) {
        this.$.container1.appendChild(visible[0]);
        this.$.container2.appendChild(visible[1]);
        this.$.container2.appendChild(visible[2]);
        if (visible.length == 4) {
          this.$.container2.appendChild(visible[3]);
        }
      }
    }
    this.style.display = 'none';
    this.offsetTop; // FIXME (once Chrome is fixed)
    this.style.display = '';
  },

  timedItemChanged: function(oldValue, newValue) {
    if (!oldValue) {
      this.updateCode();
      this.previewJavascript = this.javascript;
    }
  },

  updateCode: function() {
    this.javascript = 'document.timeline.play(' +
        serializeTimedItem(this.timedItem) + ');';
  },

  /**
   * Stores the current `javascript` string in `previewJavascript`, then updates
   * the preview frame and the player of `wat-player-controls` using
   * `javascript`, `html`, and `css`.
   *
   * @method updatePreview
   */
  updatePreview: function() {
    this.previewJavascript = this.javascript;
    this.updateState('reload', 0);
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
      script.textContent = this.previewJavascript;
      d.body.appendChild(script);
      
      if (d.timeline.getCurrentPlayers().length > 0) {
        var player = d.timeline.getCurrentPlayers()[0];
        this.$['player-controls'].player = player;
        this.timedItem = player.source;
        window.Animation = w.Animation;
        window.AnimationGroup = w.AnimationGroup;
        window.AnimationSequence = w.AnimationSequence;
        window.KeyframeEffect = w.KeyframeEffect;
        window.MotionPathEffect = w.MotionPathEffect;
      } else {
        this.fire('request-toast', 'Could not find any active players.');
      }
    }.bind(this);
  },

  /**
   * Saves the current `javascript`, `html`, and `css` strings to local storage.
   *
   * @method saveFilesToLocalStorage
   */
  saveFilesToLocalStorage: function() {
    window.localStorage['wat-javascript'] = this.javascript;
    window.localStorage['wat-css'] = this.css;
    window.localStorage['wat-html'] = this.html;
  },

  /**
   * Loads `wat-javascript`, `wat-html`, and `wat-css` from local storage,
   * unless they are all empty strings, in which case `timedItem` is set to
   * `new Animation(null, null, 0)`.
   *
   * @method loadFilesFromLocalStorage
   */
  loadFilesFromLocalStorage: function() {
    if (!window.localStorage['wat-javascript'] && !window.localStorage['wat-html'] &&
        !window.localStorage['wat-css']) {
      this.timedItem = new Animation(null, null, 0);
    } else {
      this.javascript = window.localStorage['wat-javascript'] || this.javascript;
      this.html = window.localStorage['wat-html'] || this.html;
      this.css = window.localStorage['wat-css'] || this.css;
    }
    this.previewJavascript = this.javascript;
    this.state = 'idle';
    this.reload();
  },

  /**
   * Sets `timedItem` to `new Animation(null, null, 0)` and sets `javascript` to
   * the corresponding code. `previewJavascript`, `html`, and `css` are all set
   * to empty strings, and all the code is removed from local storage.
   * `token-changed` event.
   *
   * @method clearAll
   */
  clearAll: function() {
    this.previewJavascript = this.css = this.html = '';
    this.javascript = 'document.timeline.play(' +
        serializeTimedItem(new Animation(null, null, 0)) + ');';
    ['wat-javascript', 'wat-html', 'wat-css'].forEach(function(i) {
      window.localStorage.removeItem(i);
    });
    this.updatePreview();
  }
});
