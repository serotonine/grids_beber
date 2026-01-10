"use strict";

import DOM from "./classes/Dom.js";
import Cell from "./classes/Cell.js";
// Nb cells.
let colNb, rowNb, isDialogSectionActive, dragFigure, dom, cell, cells;
let currentGridArea = [];
const gridAreas = new Map();

// SETUP.
function setUp() {
  dom = new DOM();
  cell = new Cell(dom);
  const { sections, dialog, figures, merge } = dom.elements;
  // Clean whitespace text nodes sections.
  sections.forEach((section) => {
    section.childNodes.forEach((node) => node.nodeType == 3 && node.remove());
  });
  // DRAG & DROP.
  figures.forEach((figure, id) => {
    figure.dataset.id = id;
    figure.addEventListener("dragstart", dragStartHandler);
  });
  // Populate grid.
  cell.populateGrid();

  dialog.addEventListener("click", (e) => {
    const currentSection = e.target.closest("section");
    if (!currentSection || !currentSection?.dataset.id) {
      return;
    }
    sections.forEach((section) => {
      section.dataset.id === currentSection.dataset.id
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
    // Allow only move transfert.
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", figure.dataset.id);

  }


// Init.
document.addEventListener("DOMContentLoaded", setUp);
