export default class Cell {
  constructor(dom) {
    this.dom = dom;
    this.grid = dom.elements.grid;
    this.dialog = dom.elements.dialog;
    this.gridAreas = new Map();
    this.dragFromCell = null;
  }

  // CELLS.
  /*
   * @param {xx} xx
   * @return {xx} xx
   */
  populateGrid() {
    const { rowNb, colNb } = this.getRepeats(this.grid);
    // Init Grid cells.
    for (let row = 1; row <= rowNb; row++) {
      for (let col = 1; col <= colNb; col++) {
        this.grid.appendChild(this.createCellElement({ row, col }));
      }
    }
  }

  /*
   * @param {xx} xx
   * @return {xx} xx
   */
  createCellElement(coords) {
    const cell = document.createElement("div");
    cell.className = "grid-cell";
    // Simple cell.
    if (coords?.row && coords?.col) {
      cell.dataset.rowId = coords.row;
      cell.dataset.colId = coords.col;
    }
    // Merged cell.
    if (coords?.minRow && coords?.minCol && coords?.maxRow && coords?.maxCol) {
      cell.classList.add("merged");
      cell.dataset.minCol = coords.minCol;
      cell.dataset.minRow = coords.minRow;
      cell.dataset.maxCol = coords.maxCol;
      cell.dataset.maxRow = coords.maxRow;

      cell.prepend(this.createCellTools());
    }
    this.setCellListener(cell);

    return cell;
  }
  createCellTools() {
    const cellTools = document.createElement("div");
    cellTools.className = "grid-cell--tools";
    cellTools.innerHTML = `
  <button type="button" class="btn-tool" data-action="align-top" title="align top"></button>
  <button type="button" class="btn-tool" data-action="align-bottom" title="align bottom"></button>
  <button type="button" class="btn-tool" data-action="align-left" title="align left"></button>
  <button type="button" class="btn-tool" data-action="align-right" title="align right"></button>
  <button type="button" class="btn-tool" data-action="shrink-top" title="shrink top"></button>
  <button type="button" class="btn-tool" data-action="shrink-bottom" title="shrink bottom"></button>
  <button type="button" class="btn-tool" data-action="shrink-left" title="shrink left"></button>
  <button type="button" class="btn-tool" data-action="shrink-right" title="shrink right"></button>
  <button type="button" class="btn-tool" data-action="delete" title="delete"></button>`;

    return cellTools;
  }

  /*
   * @param {xx} xx
   * @return {xx} xx
   */
  setCellListener(cell) {
    // Select || deselect the cell.
    cell.addEventListener("click", this.cellClickHandler);
    // DRAG & DROP.
    // Cancel dragover so that drop can fire.
    cell.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });
    //
    // Drop Event.
    cell.addEventListener("drop", (e) => {
      e.preventDefault();
      const target = e.currentTarget;
      if (
        target.classList.contains("filled") ||
        !target.classList.contains("merged")
      ) {
        return;
      }
      target.classList.add("filled");
      const id = e.dataTransfer.getData("text/plain");
      // Set empty for dialog section.
      const dialogSectionSource = this.dialog.querySelector(
        `section[data-figure-id="${id}"]`
      );
      if (dialogSectionSource) {
        dialogSectionSource.classList.add("empty");
      }
      const figure = document.querySelector(`figure[data-id="${id}"]`);
      if (!figure) {
        console.trace("figure could not be dropped, check why...");
        return;
      }
      const tools = target.querySelector(".grid-cell--tools");
      tools.insertAdjacentElement("afterend", figure);
      if (this.dragFromCell && this.dragFromCell !== target) {
        this.dragFromCell.classList.remove("filled");
      }
      this.dragFromCell = null;
    });
  }

  //// Events handlers ////

  /*
   * @param {xx} xx
   * @return {xx} xx
   * Use arrow function to preserve global this.
   */
  cellClickHandler = (e) => {
    const cell = e.currentTarget;
    if (e.target.className === "btn-tool") {
      e.preventDefault();
      e.stopPropagation();
      const action = e.target.dataset.action;

      if (action === "delete") {
        this.deleteCell(cell);
        this.gridAreas.clear();
        this.clearSelectedUI();
      }
      const actionType = action.split("-");
      if (actionType[0] === "shrink") {
        this.shrinkCell(cell, action);
      }
      if (actionType[0] === "align") {
        this.alignCell(cell, action);
      }

      return;
    }
    this.selectCell(cell);
  };
  /*
   * @param {xx} xx
   * @return {xx} xx
   */
  selectCell(cell) {
    // Current cell coords.
    const coords = {};
    Object.entries(cell.dataset).forEach(([key, value]) => {
      coords[key] = Number(value);
    });
    const key = Object.values(cell.dataset).join(",");
    // Selected.
    const isSelected = cell.classList.toggle("selected");
    isSelected ? this.gridAreas.set(key, coords) : this.gridAreas.delete(key);
  }

  /*
   * @param {xx} xx
   * @return {xx} xx
   */
  deleteCell(cell) {
    if (cell.classList.contains("filled")) {
      const figure = cell.querySelector("figure");
      if (figure) {
        const section = this.dom.elements.dialog.querySelector(
          `section[data-figure-id="${figure.dataset.id}"]`
        );
        if (section) {
          section.classList.remove("empty");
          section.prepend(figure);
        }
      }
    }
    cell.remove();
    // Base cells to show.
    const { minRow, maxRow, minCol, maxCol } = cell.dataset;
    for (let r = Number(minRow); r <= Number(maxRow); r++) {
      for (let c = Number(minCol); c <= Number(maxCol); c++) {
        const baseCell = this.grid.querySelector(
          `.grid-cell[data-row-id="${r}"][data-col-id="${c}"]`
        );
        baseCell.hidden = false;
      }
    }
  }

  /*
   * @param {xx} xx
   * @return {xx} xx
   */
  shrinkCell(cell, action) {
    let minRow = Number(cell.dataset.minRow);
    let maxRow = Number(cell.dataset.maxRow);
    let minCol = Number(cell.dataset.minCol);
    let maxCol = Number(cell.dataset.maxCol);

    const prev = { minRow, maxRow, minCol, maxCol };

    // Do not shrink under 1 cell.
    switch (action) {
      case "shrink-top":
        if (minRow < maxRow) minRow += 1;
        break;
      case "shrink-bottom":
        if (maxRow > minRow) maxRow -= 1;
        break;
      case "shrink-left":
        if (minCol < maxCol) minCol += 1;
        break;
      case "shrink-right":
        if (maxCol > minCol) maxCol -= 1;
        break;
      default:
        return;
    }

    // No change.
    if (
      minRow === prev.minRow &&
      maxRow === prev.maxRow &&
      minCol === prev.minCol &&
      maxCol === prev.maxCol
    ) {
      return;
    }

    // 1) Ré-afficher les base cells qui sortent de l’ancienne zone
    this.showBaseCells(prev, { minRow, maxRow, minCol, maxCol });

    // 2) Update dataset
    cell.dataset.minRow = minRow;
    cell.dataset.maxRow = maxRow;
    cell.dataset.minCol = minCol;
    cell.dataset.maxCol = maxCol;

    // 3) Update grid-area (end exclusif => +1)
    cell.style.gridArea = `${minRow}/${minCol}/${maxRow + 1}/${maxCol + 1}`;
  }
  /*
   * @param {xx} xx
   * @return {xx} xx
   */
  alignCell(cell, action) {
    const image = cell.querySelector("img");

    if (!image) {
      return;
    }
    const computedStyle = window.getComputedStyle(image, null);
    switch (action) {
      case "align-top":
        image.style.removeProperty("margin-top");
        break;
      case "align-bottom":
        image.style.marginTop = "auto";
        break;
      case "align-left":
        image.style.removeProperty("margin-left");
        image.style.marginRight = "auto";

        break;
      case "align-right":
        image.style.removeProperty("margin-right");
        image.style.marginLeft = "auto";
        break;
    }
  }

  /*
   * @param {xx} xx
   * @return {xx} xx
   */
  mergeCells = () => {
    if (this.gridAreas.size <= 1) {
      console.trace("Error : Nothing to merge");
      return;
    }

    // 1) Calcul des boundaries à partir de la sélection
    const cb = this.getMergedBoundaries(this.gridAreas);

    // 2) Récupère toutes les merged cells sélectionnées
    const selectedMergedCells = [
      ...this.grid.querySelectorAll(".selected.merged"),
    ];

    // 3) Récupère les figures présentes dans les merged cells sélectionnées
    const figuresFound = selectedMergedCells
      .map((c) => c.querySelector("figure"))
      .filter(Boolean);

    // Si tu veux tolérer 0 ou 1 figure (cas normal)
    if (figuresFound.length > 1) {
      console.error(
        "Merge aborted: more than one figure in selected merged cells.",
        figuresFound
      );
      return;
    }
    const carriedFigure = figuresFound[0] ?? null;

    // 4) Supprime les merged cells sélectionnées (on a déjà "détaché" la figure via carriedFigure)
    //    Note: carriedFigure est un node DOM, il survivra au remove() du parent.
    selectedMergedCells.forEach((c) => c.remove());

    // 5) Hide les base cells dans la zone fusionnée
    for (let r = cb.minRow; r <= cb.maxRow; r++) {
      for (let c = cb.minCol; c <= cb.maxCol; c++) {
        const baseCell = this.grid.querySelector(
          `.grid-cell[data-row-id="${r}"][data-col-id="${c}"]`
        );
        if (baseCell) {
          baseCell.classList.remove("selected");
          baseCell.hidden = true;
        }
      }
    }

    // 6) Crée la nouvelle merged cell
    const child = this.createCellElement(cb);
    child.style.gridArea = `${cb.minRow}/${cb.minCol}/${cb.maxRow + 1}/${
      cb.maxCol + 1
    }`;

    // 7) Si on a une figure, on la remet dans la nouvelle merged cell + filled
    if (carriedFigure) {
      const tools = child.querySelector(".grid-cell--tools");
      tools.insertAdjacentElement("afterend", carriedFigure);
      child.classList.add("filled");
    }

    this.grid.appendChild(child);

    // 8) Reset état sélection
    this.gridAreas.clear();
    this.clearSelectedUI();
  };

  // Utilities.
  /*
   * @param {HTMLElement} grid
   * @return {object} { number of rows , number of columns }
   */
  getRepeats(el) {
    const computedStyle = getComputedStyle(el);
    const colNb = computedStyle
      .getPropertyValue("grid-template-columns")
      .split(" ").length;
    const rowNb = computedStyle
      .getPropertyValue("grid-template-rows")
      .split(" ").length;
    return { rowNb, colNb };
  }

  clearSelectedUI() {
    this.grid
      .querySelectorAll(".grid-cell.selected")
      .forEach((c) => c.classList.remove("selected"));
  }
  showBaseCells(prev, next) {
    for (let r = prev.minRow; r <= prev.maxRow; r++) {
      for (let c = prev.minCol; c <= prev.maxCol; c++) {
        const insideNext =
          r >= next.minRow &&
          r <= next.maxRow &&
          c >= next.minCol &&
          c <= next.maxCol;

        if (insideNext) continue;
        const baseCell = this.grid.querySelector(
          `.grid-cell[data-row-id="${r}"][data-col-id="${c}"]`
        );
        if (baseCell) baseCell.hidden = false;
      }
    }
  }

  /*
   * @param {Map} gridAreas (this.gridAreas with the expected values)
   * @return {object} { number of rows , number of columns }
   */
  getMergedBoundaries(gridAreas) {
    const values = [...gridAreas.values()];

    const minRows = values.map((v) => v.rowId ?? v.minRow);
    const maxRows = values.map((v) => v.rowId ?? v.maxRow);
    const minCols = values.map((v) => v.colId ?? v.minCol);
    const maxCols = values.map((v) => v.colId ?? v.maxCol);

    return {
      minRow: Math.min(...minRows),
      maxRow: Math.max(...maxRows),
      minCol: Math.min(...minCols),
      maxCol: Math.max(...maxCols),
    };
  }
}
