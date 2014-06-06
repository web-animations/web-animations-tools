(function() {
  var BEFORE = 1;
  var AFTER = 2;
  var APPEND = 3;

  Polymer('wat-tree-node', {
    /**
     * The tree view that this node is attached to. Possible values 
     * are wat-tree objects that contains this node.
     *
     * @attribute tree
     * @type wat-tree
     * @default null
     */
    tree: null,

    /**
     * The timedItem it represents in the tree view. Possible values
     * are an animation of a group of animations.
     *
     * @attribute timedItem
     * @type TimedItem
     * @default null
     */
    timedItem: null,
    /**
     * The number of tabs this item is indenting. Possible values are
     * any non-negative integers.
     *
     * @attribute indent
     * @type Number
     * @default 0
     */
    indent: 0,
    dropBefore: false,
    dropAfter: false,
    dropAppend: false,
    observe: {
      'tree.editing': 'editingChanged',
    },
    toggleSubtree: function(e) {
      this.timedItem.collapsed = !this.timedItem.collapsed;
    },
    selectSubtree: function(e) {
      e.stopPropagation();
      if (this.tree.selected === this.timedItem) {
        this.tree.selected = null;
      } else {
        this.tree.selected = this.timedItem;
      }
    },
    startDragging: function(e) {
      e.stopPropagation();
      e.dataTransfer.effectAllowed = 'move';
      this.tree.dragged = this.timedItem;
      this.timedItem.collapsed = true;
    },
    enableHighlight: function(e) {
      e.stopPropagation();
      var dropPos = this.getRelativePosition(e);
      if (!this.isValidDropLocation(dropPos)) {
        return;
      }
      this.dropBefore = this.dropAfter = this.dropAppend = false;
      switch (dropPos) {
        case BEFORE:
          this.dropBefore = true;
          break;
        case AFTER:
          this.dropAfter = true;
          break;
        case APPEND:
          this.dropAppend = true;
          break;
        default: return;
      }

      e.preventDefault();
    },
    disableHighlight: function(e) {
      this.dropBefore = this.dropAfter = this.dropAppend = false;
      e.preventDefault();
    },
    onDrop: function(e) {
      var dropPos = this.getRelativePosition(e);
      if (!this.isValidDropLocation(dropPos)) {
        return;
      }
      var animation = this.tree.dragged;
      if (animation.parent) {
        animation.remove();
      }

      switch (dropPos) {
        case BEFORE:
          this.timedItem.before(animation);
          break;
        case AFTER:
          this.timedItem.after(animation);
          break;
        case APPEND:
          this.timedItem.append(animation);
          break;
        default:
          return;
      }

      this.disableHighlight(e);
      this.tree.dragged = null;
      e.preventDefault();

      this.fire('on-timeline-relayout', null);
    },
    isValidDropLocation: function(dropPos) {
      if (!this.tree.dragged ||
          this.tree.dragged === this.timedItem) {
        return false;
      }

      if (dropPos === APPEND &&
          this.timedItem instanceof Animation) {
        return false;
      }

      if (dropPos === BEFORE &&
        this.tree.timedItem === this.timedItem) {
        return;
      }

      return true;
    },
    getRelativePosition: function(e) {
      e.stopPropagation();
      var boundingBox = this.$['name-container'].getBoundingClientRect();
      var dropAreaHeight = boundingBox.height / 3;
      if (!(this.timedItem instanceof Animation) &&
          e.y > boundingBox.top + dropAreaHeight &&
          e.y < boundingBox.bottom - dropAreaHeight) {
        return APPEND;
      } else if (e.y < boundingBox.top + dropAreaHeight) {
        return BEFORE;
      } else {
        return AFTER;
      }
    },
    showSelectionMenu: function(e) {
      this.$.selection.classList.remove('hidden');
      var mouseX = e.clientX - this.getBoundingClientRect().left;
      var mouseY = e.clientY - this.tree.getBoundingClientRect().top
                             - this.$.node.getBoundingClientRect().height / 2;
      this.$.selection.style.left = mouseX + 'px';
      this.$.selection.style.top = mouseY + 'px';
    },
    hideSelectionMenu: function(e) {
      var children = this.$.selection.childNodes;
      // Prevent hiding menu when moving between menu options.
      for (var i = 0; i < children.length; i++) {
        if (children[i] === e.toElement) {
          return;
        }
      }
      this.$.selection.classList.add('hidden');
    },
    addAnimation: function(e) {
      // When adding an animation to a non-group timedItem,
      // the tool will automatically create a group to contain it.
      if (this.timedItem instanceof Animation) {
        var root = new AnimationGroup([]);

        if (this.timedItem.parent) {
          this.timedItem.before(root);
          this.timedItem.remove();
        } else {
          // The current timedItem is the root
          var player = this.timedItem.player;
          if (player && player.source === this.timedItem) {
            player.source = root;
          }
        }
        root.append(this.timedItem);
        // If changing the root of the animation tree,
        // update the root of wat-tree to reflect the change.
        if (!root.parent) {
          this.tree.timedItem = root;
        }
        this.timedItem = root;
      }
      var newItem;
      switch(e.target.innerHTML) {
        case 'Animation':
          newItem = new Animation(null, null, null);
          break;
        case 'AnimationGroup':
          newItem = new AnimationGroup([], null);
          break;
        case 'AnimationSequence':
          newItem = new AnimationSequence([], null);
          break;
      }
      this.timedItem.append(newItem);
      this.selected = newItem;
      this.$.selection.selectedIndex = 0;

      this.$.selection.classList.add('hidden');
    },
    deleteItem: function() {
      this.timedItem.remove();
    },
    onDoubleClick: function(e) {
      e.stopPropagation();
      if (!this.tree.editing) {
        this.focusSubtree();
        return;
      }

      this.$.name.classList.add('hidden');
      this.$['name-input'].classList.remove('hidden');

      if (!this.timedItem.name) {
        this.timedItem.name = this.$.name.innerHTML.trim();
      }
      this.$['name-input'].value = this.timedItem.name;
      this.$['name-input'].select();
    },
    focusSubtree: function() {
      this.fire('on-timedItem-focus', this.timedItem);
    },
    changeName: function(e) {
      var ENTER_KEYCODE = 13;
      if (e.type == 'keyup' && e.keyCode !== ENTER_KEYCODE) {
        return;
      }
      this.hideNameInput();
      this.timedItem.name = this.$['name-input'].value;
    },
    editingChanged: function() {
      if (this.tree.editing) {
        return;
      }
      this.hideNameInput();
    },
    hideNameInput: function() {
      this.$.name.classList.remove('hidden');
      this.$['name-input'].classList.add('hidden');
    },
  });
})();
