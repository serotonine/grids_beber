"use strict";

import DOM from "./classes/Dom.js";
import Dialog from "./classes/Dialog.js";
import Cell from "./classes/Cell.js";
// Nb cells.
let colNb, rowNb, isDialogSectionActive, dragFigure, dom, cell;
let currentGridArea = [];
const gridAreas = new Map();

// SETUP.
function setUp() {
  dom = new DOM();
  //dialog = new Dialog(dom);
  cell = new Cell(dom);
  const { sections, dialog, figures, merge } = dom.elements;

  // DRAG & DROP.
  figures.forEach((figure) => {
    figure.addEventListener("dragstart", dragStartHandler);
  });
  // Populate grid.
  cell.populateGrid();
  sections.forEach((section) => {
    section.childNodes.forEach((node) => node.nodeType == 3 && node.remove());

    section.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      console.log("section dragover", section);
    });
    section.addEventListener("drop", (e) => {
  e.preventDefault();

  const id = e.dataTransfer.getData("text/plain");
  if (section.dataset.figureId !== id) return;

  section.classList.remove("empty");

  const figure = document.querySelector(`figure[data-id="${CSS.escape(id)}"]`);
  if (!figure) return;

  section.prepend(figure);

  if (cell.dragFromCell) {
    cell.dragFromCell.classList.remove("filled");
    cell.dragFromCell = null;
  }
});
  });

  dialog.addEventListener("click", (e) => {
    const currentSection = e.target.closest("section.dialog-figure");
    if (!currentSection) {
      return;
    }
    sections.forEach((section) => {
      // Clean whitespace text nodes sections.
      section.dataset.figureId === currentSection.dataset.figureId
        ? section.classList.add("active")
        : section.classList.remove("active");
    });
  });
  // HANDLE CELLS
  merge.addEventListener("click", cell.mergeCells);
}

/*
 * @param {xx} xx
 * @return {xx} xx
 */
function dragStartHandler(e) {
  const figure = e.currentTarget;

  const sectionSource = figure.closest("section.dialog-figure");
  const cellSource = figure.closest(".grid-cell.merged");

  if (sectionSource) sectionSource.classList.add("empty");

  cell.dragFromCell = cellSource ?? null; // reset garanti

  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", figure.dataset.id);
}

// Init.
document.addEventListener("DOMContentLoaded", setUp);
