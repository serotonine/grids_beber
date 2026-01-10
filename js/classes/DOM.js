export default class DOM {
  constructor() {}
  get elements() {
    return {
      grid: document.getElementById("main-container"),
      dialog: document.getElementById("dialog-container"),
      sections: document.querySelectorAll("section.dialog-figure"),
      figures: document.querySelectorAll("section.dialog-figure > figure"),
      merge: document.querySelector(".btn-merge"),
      cells: [],
    };
  }
  get cells() {
    return this.elements.grid.querySelectorAll(".grid-cell");
  }
}
