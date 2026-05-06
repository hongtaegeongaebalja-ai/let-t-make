const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const fileList = document.getElementById("fileList");
const makeBtn = document.getElementById("makeBtn");
const resultBox = document.getElementById("resultBox");
const createdLink = document.getElementById("createdLink");
const savedList = document.getElementById("savedList");
const clearBtn = document.getElementById("clearBtn");

let files = [];

function addFiles(newFiles) {
  files = Array.from(newFiles).filter(file => {
    const name = file.name.toLowerCase();
    return name.endsWith(".html") || name.endsWith(".css") || name.endsWith(".js");
  });

  renderFiles();
}

function renderFiles() {
  fileList.innerHTML = "";

  if (files.length === 0) {
    fileList.innerHTML = "<li>No files selected</li>";
    return;
  }

  files.forEach(file => {
    const li = document.createElement("li");
    li.textContent = `${file.name} - ${file.size} bytes`;
    fileList.appendChild(li);
  });
}

fileInput.addEventListener("change", () => {
  addFiles(fileInput.files);
});

dropZone.addEventListener("dragover", e => {
  e.preventDefault();
  dropZone.classList.add("active");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("active");
});

dropZone.addEventListener("drop", e => {
  e.preventDefault();
  dropZone.classList.remove("active");
  addFiles(e.dataTransfer.files);
});

function readFileText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve({
        name: file.name,
        text: reader.result
      });
    };

    reader.onerror = () => {
      reject(new Error(file.name + " read failed"));
    };

    reader.readAsText(file);
  });
}

makeBtn.addEventListener("click", async () => {
  if (files.length === 0) {
    alert("Upload at least one HTML, CSS, or JS file.");
    return;
  }

  makeBtn.disabled = true;
  makeBtn.textContent = "Creating...";

  try {
    const uploadFiles = await Promise.all(files.map(readFileText));

    const response = await fetch("/api/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ files: uploadFiles })
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("API not working. Check api/create.js and Redeploy.");
    }

    if (!response.ok) {
      throw new Error(data.error || "Address creation failed.");
    }

    createdLink.href = data.url;
    createdLink.textContent = data.url;
    resultBox.classList.remove("hidden");

    saveAddress(data.url);
  } catch (error) {
    alert("Error: " + error.message);
  } finally {
    makeBtn.disabled = false;
    makeBtn.textContent = "Create Address";
  }
});

function saveAddress(url) {
  const saved = JSON.parse(localStorage.getItem("savedLinks")) || [];

  saved.unshift({
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

  saved.forEach(item => {
    const div = document.createElement("div");
    div.className = "saved-item";
    div.innerHTML = `
      <a href="${item.url}" target="_blank">${item.url}</a>
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
