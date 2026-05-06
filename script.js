const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const fileList = document.getElementById("fileList");
const makeBtn = document.getElementById("makeBtn");
const resultBox = document.getElementById("resultBox");
const createdLink = document.getElementById("createdLink");
const savedList = document.getElementById("savedList");
const clearBtn = document.getElementById("clearBtn");

let files = [];

function renderFiles() {
  fileList.innerHTML = "";

  files.forEach((file) => {
    const li = document.createElement("li");
    li.textContent = file.name;
    fileList.appendChild(li);
  });
}

function addFiles(newFiles) {
  files = [...files, ...Array.from(newFiles)];
  renderFiles();
}

fileInput.addEventListener("change", () => {
  addFiles(fileInput.files);
});

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("active");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("active");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("active");
  addFiles(e.dataTransfer.files);
});

makeBtn.addEventListener("click", () => {
  if (files.length === 0) {
    alert("Please upload HTML, CSS, and JavaScript files first.");
    return;
  }

  const indexFile = files.find(file => file.name.toLowerCase() === "index.html");

  if (!indexFile) {
    alert("index.html file is required.");
    return;
  }

  const localUrl = URL.createObjectURL(indexFile);

  const fakeGoogleUrl =
    "https://sites.google.com/view/my-web-" + Date.now();

  createdLink.href = localUrl;
  createdLink.textContent = fakeGoogleUrl;
  resultBox.classList.remove("hidden");

  saveAddress(fakeGoogleUrl, localUrl);
});

function saveAddress(title, url) {
  const saved = JSON.parse(localStorage.getItem("savedLinks")) || [];

  saved.unshift({
    title,
    url,
    date: new Date().toLocaleString()
  });

  localStorage.setItem("savedLinks", JSON.stringify(saved));
  renderSaved();
}

function renderSaved() {
  const saved = JSON.parse(localStorage.getItem("savedLinks")) || [];
  savedList.innerHTML = "";

  if (saved.length === 0) {
    savedList.innerHTML = "<p>No saved addresses.</p>";
    return;
  }

  saved.forEach((item) => {
    const div = document.createElement("div");
    div.className = "saved-item";

    div.innerHTML = `
      <a href="${item.url}" target="_blank">${item.title}</a>
      <p>${item.date}</p>
    `;

    savedList.appendChild(div);
  });
}

clearBtn.addEventListener("click", () => {
  localStorage.removeItem("savedLinks");
  renderSaved();
});

renderSaved();