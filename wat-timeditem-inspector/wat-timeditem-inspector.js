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

Polymer('wat-timeditem-inspector', {
  target: new Animation(null, null, 0),
  easing: 'target.specifed.easing',
  customEasing: '',
  custom: 'custom',
  presetEasings: ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear', 
      'step-start', 'step-middle', 'step-end'],

  observe: {
    'target.specified.easing': 'targetEasingChanged'
  },

  easingChanged: function() {
    if (this.easing != this.custom) {
      this.target.specified.easing = this.easing;
    } else {
      this.customEasing = '';
    }
  },

  customEasingChanged: function() {
    this.target.specified.easing = this.customEasing;
  },

  targetEasingChanged: function() {
    if (this.presetEasings.indexOf(this.target.specified.easing) >= 0) {
      this.easing = this.target.specified.easing;
    } else {
      this.easing = this.custom;
      this.customEasing = this.target.specified.easing;
    }
  }
});