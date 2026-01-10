export default class Cell {
  constructor(dom) {
    this.dom = dom;
    this.grid = dom.elements.grid;
    this.gridAreas = new Map();
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
    // console.log(coords); debugger;
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
    }
    this.setCellListener(cell);

    return cell;
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
      if (target.classList.contains("filled")) {
        return;
      }
      target.classList.add("filled");
      const id = e.dataTransfer.getData("text/plain");
      // const { colId, rowId } = target.dataset;
      const figure = document.querySelector(`figure[data-id="${id}"]`);
      // console.log(figure);
      if (!figure) {
        console.trace("figure could not be dropped, check why...");
        return;
      }
      target.appendChild(figure);
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
    if (cell.classList.contains("filled")) {
      // console.log("already filled");
      return;
    }
    this.selectCell(cell);
    //console.dir(cell.dataset);
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
    const key = Object.values(cell.dataset).join("");
    // Selected.
    const isSelected = cell.classList.toggle("selected");
    isSelected ? this.gridAreas.set(key, coords) : this.gridAreas.delete(key);
  }
  /*
   * @param {xx} xx
   * @return {xx} xx
   */
  mergeCells = (e) => {
    if (this.gridAreas.size <= 1) {
      console.trace("Error : Nothing to merge");
      return;
    }
    // TODO Refactor.
    const values = [...this.gridAreas.values()];

    const minRows = values.map(v => v.rowId ?? v.minRow);
  const maxRows = values.map(v => v.rowId ?? v.maxRow);
  const minCols = values.map(v => v.colId ?? v.minCol);
  const maxCols = values.map(v => v.colId ?? v.maxCol);

  const minRow = Math.min(...minRows);
  const maxRow = Math.max(...maxRows);
  const minCol = Math.min(...minCols);
  const maxCol = Math.max(...maxCols);
    // Check if a merged item is in
    const selectedCells = this.grid.querySelectorAll(".selected.merged");
    selectedCells.forEach(cell => {
      if(!cell.classList.contains("filled")){
        cell.remove();
      }
      else{
        // to handle after.
        throw new Error ("FILLED");
        }
      });

    // Hide base cells.
for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const cell = this.grid.querySelector(
          `.grid-cell[data-row-id="${r}"][data-col-id="${c}"]`
        ); 
        if (cell) {
          cell.classList.remove("selected");
          cell.hidden = true;
      }
    }
  }

    const child = this.createCellElement({ minRow, minCol, maxRow, maxCol });
    child.style.gridArea = `${minRow}/${minCol}/${maxRow + 1}/${maxCol + 1}`;
    this.grid.appendChild(child);
    // Empty Map.
    this.gridAreas.clear();
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
}
