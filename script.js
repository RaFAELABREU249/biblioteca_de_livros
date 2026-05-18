import * as pdfjsLib from
'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc =
'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';

const library =
document.getElementById("library");

const reader =
document.getElementById("reader");

const backBtn =
document.getElementById("backBtn");

const canvas =
document.getElementById("pdfCanvas");

const ctx =
canvas.getContext("2d");

const prevPageBtn =
document.getElementById("prevPage");

const nextPageBtn =
document.getElementById("nextPage");

const pageNum =
document.getElementById("pageNum");

const pageCount =
document.getElementById("pageCount");

let pdfDoc = null;

let currentPage = 1;

let readingMode = "button";

renderLibrary();

function renderLibrary(){

  library.innerHTML = "";

  books.forEach((book, index) => {

    const div =
    document.createElement("div");

    div.className = "book";

    div.innerHTML = `
      <img src="${book.cover}">
      <div class="book-title">
        ${book.title}
      </div>
    `;

    div.addEventListener("click", () => {
      openBook(index);
    });

    library.appendChild(div);
  });
}

async function openBook(index){

  library.style.display = "none";

  reader.style.display = "flex";

  currentPage = 1;

  pdfDoc =
  await pdfjsLib
  .getDocument(books[index].pdf)
  .promise;

  pageCount.textContent =
  pdfDoc.numPages;

  if(readingMode === "button"){

    document
    .querySelector(".controls")
    .style.display = "flex";

    canvas.style.display = "block";

    renderPage(currentPage);

  }else{

    renderAllPages();
  }
}

async function renderPage(num){

  const page =
  await pdfDoc.getPage(num);

  const viewport =
  page.getViewport({

    scale:
    window.innerWidth < 700
    ? 1
    : 1.5
  });

  canvas.height =
  viewport.height;

  canvas.width =
  viewport.width;

  await page.render({

    canvasContext: ctx,
    viewport: viewport

  }).promise;

  pageNum.textContent = num;
}

async function renderAllPages(){

  document
  .querySelector(".controls")
  .style.display = "none";

  canvas.style.display = "none";

  const oldPages =
  document.querySelectorAll(".extra-page");

  oldPages.forEach(p => p.remove());

  for(
    let i = 1;
    i <= pdfDoc.numPages;
    i++
  ){

    const page =
    await pdfDoc.getPage(i);

    const viewport =
    page.getViewport({

      scale:
      window.innerWidth < 700
      ? 1
      : 1.4
    });

    const newCanvas =
    document.createElement("canvas");

    newCanvas.className =
    "extra-page";

    const newCtx =
    newCanvas.getContext("2d");

    newCanvas.width =
    viewport.width;

    newCanvas.height =
    viewport.height;

    reader.appendChild(newCanvas);

    await page.render({

      canvasContext: newCtx,
      viewport: viewport

    }).promise;
  }
}

prevPageBtn
.addEventListener("click", () => {

  if(currentPage <= 1) return;

  currentPage--;

  renderPage(currentPage);
});

nextPageBtn
.addEventListener("click", () => {

  if(currentPage >= pdfDoc.numPages)
  return;

  currentPage++;

  renderPage(currentPage);
});

backBtn
.addEventListener("click", () => {

  reader.style.display = "none";

  library.style.display = "grid";

  canvas.style.display = "block";

  const oldPages =
  document.querySelectorAll(".extra-page");

  oldPages.forEach(p => p.remove());
});

document
.getElementById("buttonMode")
.addEventListener("click", () => {

  readingMode = "button";

  if(pdfDoc){

    canvas.style.display = "block";

    document
    .querySelector(".controls")
    .style.display = "flex";

    const oldPages =
    document.querySelectorAll(".extra-page");

    oldPages.forEach(p => p.remove());

    renderPage(currentPage);
  }
});

document
.getElementById("scrollMode")
.addEventListener("click", () => {

  readingMode = "scroll";

  if(pdfDoc){

    renderAllPages();
  }
});