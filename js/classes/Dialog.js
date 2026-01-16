
import Cell from "./Cell.js"
export default class Dialog {

  constructor(dom, data, cell) {
    this.dom = dom;
    this.dialog = dom.elements.dialog;
    this.data = data;
    this.cell = new Cell(dom);
  }

  populateDialog() {
      this.data.forEach((item) => {
      const {
        mid: [mid = null] = [],
        name: [name = null] = [],
        thumbnail: [thumbnail = null] = [],
      } = item ?? {};
      const cleanData = {
        id: mid?.value,
        name: name?.value,
        url: thumbnail?.url,
        alt: thumbnail?.alt,
        title: thumbnail?.title,
      };

      const currentSection = this.createSectionElement(cleanData);
      // Remove textNodes.
      currentSection.childNodes.forEach(
        (node) => node.nodeType == 3 && node.remove()
      );
      // Add in the container.
      this.dialog.appendChild(currentSection);
      // DRAG & DROP FIGURE.
      const currentFigure = currentSection.querySelector("figure");
      currentFigure.addEventListener("dragstart", (e)=> this.dragStartHandler(e));
      // DRAG & DROP SECTION.
      currentSection.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      });
      currentSection.addEventListener("drop", (e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");
        if (currentSection.dataset.figureId !== id) return;
        const figure = document.querySelector(
          `figure[data-id="${CSS.escape(id)}"]`
        );
        if (!figure) return;
        currentSection.classList.remove("empty");
        currentSection.prepend(figure);

        if (this.cell.dragFromCell) {
          this.cell.dragFromCell.classList.remove("filled");
          this.cell.dragFromCell = null;
        }
      });
    });
  }

  /*
   *
   * @param {object} the data {id,name,url,title}.
   * @return {HTMLElement} section.dialog-figure.
   *
   */
  createSectionElement(data) {
    const section = document.createElement("section");
    section.className = "dialog-figure";
    section.dataset.figureId = data.id;
    const figure = document.createElement("figure");
    figure.dataset.id = data.id;
    figure.draggable = true;
    const img = new Image();
    img.src = data.url ?? "";
    img.alt = data.alt ?? "";
    img.loading = "lazy";
    img.decoding = "async";
    img.draggable = false;
    const figCaption = document.createElement("figcaption");
    figCaption.textContent = data.alt ?? "";
    figure.append(img, figCaption);
    section.appendChild(figure);
    section.insertAdjacentHTML(
      "beforeend",
      `<p class="dialog-figure--info"><small>${this.cleanCaption(
        data.name
      )}</small></p>`
    );

    return section;
  }

  /*
   * @param {xx} xx
   * @return {xx} xx
   */
  dragStartHandler(e) {
    const figure = e.currentTarget;
    const cellSource = figure.closest(".grid-cell.merged");
    // Reset.
    this.cell.dragFromCell = cellSource ?? null;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", figure.dataset.id);
  }

  /*
   * @param {string} the data.name (name of the picture).
   * @return {string} the name without extension and underscore.
   *
   */
  cleanCaption(text) {
    const extensionId = text.indexOf(".");
    if (extensionId >= 0) {
      text = text.substring(0, extensionId);
    }
    return text.replaceAll("_", " ");
  }
}
