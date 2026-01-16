export default class DOM {
  constructor() {}
  get elements() {
    return {
      body: document.querySelector("body"),
      mainContainer: document.getElementById("main-container"),
      grid: document.getElementById("main-container"),
      dialog: document.getElementById("dialog-container"),
      dialogContainer: document.getElementById("dialog-figures"),
      dialogBtn: document.querySelector(".btn-dialog-cta"),
      sections: document.querySelectorAll("section.dialog-figure"),
      figures: document.querySelectorAll("section.dialog-figure > figure"),
      menu: document.querySelector(".main-menu"),
      
      cells: [],
    };
  }
  get cells() {
    return this.elements.grid.querySelectorAll(".grid-cell");
  }
}
