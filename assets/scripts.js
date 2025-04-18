// Get modal elements
const modal = document.getElementById("myModal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModal = document.getElementsByClassName("close")[0];
const iframeContent = document.getElementById("iframeContent");

// Function to open modal
openModalBtn.onclick = function () {
  modal.style.display = "flex";
  iframeContent.src = "https://pronouns.wiki/email-signature"; // Load page into iframe
};

// Function to close modal
closeModal.onclick = function () {
  modal.style.display = "none";
  iframeContent.src = "about:blank"; // Clear iframe
};

// Close modal when clicking outside the content
window.onclick = function (event) {
  if (event.target === modal) {
    modal.style.display = "none";
    iframeContent.src = "about:blank"; // Clear iframe
  }
};

// Accessibility and UI functions
function toggleAccessibilityPanel() {
  document.querySelector(".accessibility-panel").classList.toggle("show");
}

function toggleHighContrast() {
  document.body.classList.toggle("high-contrast");
}

function applyColorScheme(e) {
  document.body.classList.remove("scheme1", "scheme2");
  document.body.classList.add("scheme" + e);
}

function toggleBoldText() {
  document.body.classList.toggle("bold-text");
}

function toggleDyslexiaFriendlyFont() {
  document.body.classList.toggle("dyslexia-friendly-font");
}

function resetDefaults() {
  document.body.classList.remove("high-contrast", "scheme1", "scheme2", "bold-text", "dyslexia-friendly-font");
}

// Preloading and updating content
const preloadedPages = {};

function preloadPage(url) {
  if (!preloadedPages[url]) {
    fetch(url)
      .then((response) => response.text())
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const mainContent = doc.querySelector("main").innerHTML;
        preloadedPages[url] = mainContent;
      })
      .catch((err) => console.error("Failed to preload:", err));
  }
}

function updateMainContent(event, url) {
  event.preventDefault();
  if (preloadedPages[url]) {
    document.getElementById("main-content").innerHTML = preloadedPages[url];
    window.history.pushState(null, "", url);
  } else {
    fetch(url)
      .then((response) => response.text())
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        document.getElementById("main-content").innerHTML = doc.querySelector("main").innerHTML;
        window.history.pushState(null, "", url);
      })
      .catch((err) => console.error("Failed to load page:", err));
  }
}

// Attach event listeners to internal links
document.querySelectorAll(".internal-link").forEach((link) => {
  const url = link.getAttribute("href");
  link.addEventListener("mouseover", () => preloadPage(url));
  link.addEventListener("click", (event) => updateMainContent(event, url));
});

document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu-content');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) {
                navMenu.classList.remove('active');
            }
        });
    }
});
