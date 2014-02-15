(function() {
  var BEFORE = 1;
  var AFTER = 2;
  var APPEND = 3;

  Polymer('wat-tree-node', {
    tree: null,
    timedItem: null,
    indent: 0,
    dropBefore: false,
    dropAfter: false,
    dropAppend: false,
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
  });
})();