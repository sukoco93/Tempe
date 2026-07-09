window.AppWatch = {
  menu() {
    this.resetAndLoad();
  },
  filter(newVal) {
    if (newVal !== 'range') {
      this.rangeStart = Utils.today();
      this.rangeEnd = Utils.today();
    }
    this.resetAndLoad();
  },
  rangeStart() {
    if (this.filter === 'range') this.resetAndLoad();
  },
  rangeEnd() {
    if (this.filter === 'range') this.resetAndLoad();
  }
};
