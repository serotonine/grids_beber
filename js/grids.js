"use strict";

import DOM from "./classes/Dom.js";
import Dialog from "./classes/Dialog.js";
import Cell from "./classes/Cell.js";
import { fetchImages } from "./fetch.js";
// Nb cells.
let dom, cell, imgHandler;

// SETUP.
function setUp() {
  // FETCH
  fetchImages()
    .then(async (response) => {
      // Dom.
      dom = new DOM();
      const { sections, dialog, figures, menu } = dom.elements;
      // Populate grid.
      cell = new Cell(dom);
      cell.populateGrid();
      //
      imgHandler = new Dialog(dom, response);
      imgHandler.populateDialog();
      
      // HANDLE CELLS
      menu.addEventListener("click", menuHandle);
      // Show/hide dialog.
      dom.elements.dialogBtn.addEventListener("click", (e) => {
        const btn = e.currentTarget;
        dom.elements.dialogContainer.classList.toggle("hidden");
        const spans = btn.querySelectorAll("span");
        spans.forEach((span) => span.classList.toggle("hidden"));
      });
      document.addEventListener("keyup", (e) => {
        if (e.key === "Enter" && e.shiftKey) {
          e.preventDefault();
          cell.mergeCells();
        }
      });
    })
    .catch((error) => {
      console.error("Error: " + error.stack);
    });
} // end setUp.

// Menu Events.
function menuHandle(e) {
  const target = e.target;

  if (target.classList.contains("btn-merge")) {
    cell.mergeCells();
  } else if (target.classList.contains("btn-show-grid")) {
    dom.elements.mainContainer.classList.toggle("rules-visible");
  } else if (target.classList.contains("btn-preview")) {
    dom.elements.body.classList.toggle("preview");
  } else {
    return;
  }
}

// Init.
document.addEventListener("DOMContentLoaded", setUp);
