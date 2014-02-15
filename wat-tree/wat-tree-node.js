Polymer('wat-tree-node', {
  tree: null,
  timedItem: null,
  expanded: false,
  toggleSubtree: function(e) {
    this.expanded = !this.expanded;
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
    this.expanded = false;
  },
  enableHighlight: function(e) {
    if (!this.isValidDropLocation(e)) {
      return;
    }

    e.target.classList.add('highlight');
    e.preventDefault();
  },
  disableHighlight: function(e) {
    if (!this.isValidDropLocation(e)) {
      return;
    }
    e.target.classList.remove('highlight');
    e.preventDefault();
  },
  onDrop: function(e) {
    if (!this.isValidDropLocation(e)) {
      return;
    }
    var animation = this.tree.dragged;
    if (animation.parent) {
      animation.remove();
    }

    var action = e.target.dataset['action'];
    if (action === 'insertAfter') {
      this.timedItem.after(animation);
    } else if (action === 'prepend') {
      this.timedItem.prepend(animation);
    }

    this.disableHighlight(e);
    this.tree.dragged = null;
    e.preventDefault();
  },
  isValidDropLocation: function(e) {
    return this.tree.dragged &&
        this.tree.dragged !== this.timedItem &&
        (e.target.dataset['action'] !== 'insertAfter' || this.timedItem.parent);
  }
});