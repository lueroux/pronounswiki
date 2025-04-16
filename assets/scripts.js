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
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const mainContent = doc.querySelector('main').innerHTML;
        preloadedPages[url] = mainContent;
      })
      .catch(err => console.error('Failed to preload:', err));
  }
}

function updateMainContent(event, url) {
  event.preventDefault();
  if (preloadedPages[url]) {
    document.getElementById('main-content').innerHTML = preloadedPages[url];
    window.history.pushState(null, '', url);
  } else {
    fetch(url)
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        document.getElementById('main-content').innerHTML = doc.querySelector('main').innerHTML;
        window.history.pushState(null, '', url);
      })
      .catch(err => console.error('Failed to load page:', err));
  }
}

// Attach event listeners to internal links
document.querySelectorAll('.internal-link').forEach(link => {
  const url = link.getAttribute('href');
  link.addEventListener('mouseover', () => preloadPage(url));
  link.addEventListener('click', event => updateMainContent(event, url));
});

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
  const url = window.location.pathname;
  if (preloadedPages[url]) {
    document.getElementById('main-content').innerHTML = preloadedPages[url];
  } else {
    fetch(url)
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        document.getElementById('main-content').innerHTML = doc.querySelector('main').innerHTML;
      })
      .catch(err => console.error('Failed to load page:', err));
  }
});

// Performance optimization - Use requestIdleCallback for non-critical operations
const scheduleIdleTask = (callback) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback);
  } else {
    setTimeout(callback, 1);
  }
};

// Lazy loading images
const lazyLoadImages = () => {
  const images = document.querySelectorAll('img[loading="lazy"]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    images.forEach(img => {
      img.src = img.dataset.src;
      img.classList.remove('lazy');
    });
  }
};

// Accessibility Features
const accessibilityFeatures = {
  highContrast: false,
  dyslexicFont: false,
  easyRead: false
};

const toggleAccessibilityPanel = () => {
  const panel = document.getElementById('accessibility-panel');
  panel.classList.toggle('show');
};

const toggleHighContrast = () => {
  accessibilityFeatures.highContrast = !accessibilityFeatures.highContrast;
  document.body.classList.toggle('high-contrast');
  localStorage.setItem('highContrast', accessibilityFeatures.highContrast);
};

const toggleDyslexicFont = () => {
  accessibilityFeatures.dyslexicFont = !accessibilityFeatures.dyslexicFont;
  document.body.classList.toggle('dyslexic-font');
  localStorage.setItem('dyslexicFont', accessibilityFeatures.dyslexicFont);
};

const toggleEasyRead = () => {
  accessibilityFeatures.easyRead = !accessibilityFeatures.easyRead;
  document.body.classList.toggle('easy-read');
  localStorage.setItem('easyRead', accessibilityFeatures.easyRead);
};

// Modal functionality
const modalManager = {
  element: null,
  openButton: null,
  closeButton: null,
  
  init() {
    this.element = document.getElementById('modal');
    this.openButton = document.getElementById('openModalBtn');
    this.closeButton = document.getElementById('closeModalBtn');
    
    if (this.openButton) {
      this.openButton.addEventListener('click', () => this.open());
    }
    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => this.close());
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === this.element) {
        this.close();
      }
    });
    
    // Handle keyboard events
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    });
  },
  
  open() {
    if (this.element) {
      this.element.style.display = 'block';
      this.element.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      
      // Focus management
      const firstFocusable = this.element.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  },
  
  close() {
    if (this.element) {
      this.element.style.display = 'none';
      this.element.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      
      // Return focus to the button that opened the modal
      if (this.openButton) {
        this.openButton.focus();
      }
    }
  }
};

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

// Performance Monitoring
const reportPerformance = () => {
  scheduleIdleTask(() => {
    if ('performance' in window) {
      const pageLoadTime = performance.now();
      const navigationTiming = performance.getEntriesByType('navigation')[0];
      const domLoadTime = navigationTiming ? navigationTiming.domContentLoadedEventEnd - navigationTiming.domContentLoadedEventStart : null;
      
      console.log(`Page Load Time: ${Math.round(pageLoadTime)}ms`);
      if (domLoadTime) {
        console.log(`DOM Load Time: ${Math.round(domLoadTime)}ms`);
      }
    }
  });
};

// Error tracking
window.addEventListener('error', (event) => {
  console.error('Global error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

// Loading state for buttons
const addLoadingState = (button) => {
  button.disabled = true;
  const originalText = button.textContent;
  button.textContent = 'Loading...';
  return () => {
    button.disabled = false;
    button.textContent = originalText;
  };
};

// Initialize everything when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize modal
  modalManager.init();
  
  // Initialize lazy loading
  lazyLoadImages();
  
  // Load accessibility preferences from localStorage
  if (localStorage.getItem('highContrast') === 'true') {
    toggleHighContrast();
  }
  if (localStorage.getItem('dyslexicFont') === 'true') {
    toggleDyslexicFont();
  }
  if (localStorage.getItem('easyRead') === 'true') {
    toggleEasyRead();
  }
  
  // Monitor performance
  reportPerformance();
  
  // Add loading state to all buttons with data-loading attribute
  document.querySelectorAll('button[data-loading]').forEach(button => {
    button.addEventListener('click', () => {
      const removeLoading = addLoadingState(button);
      // Simulate async operation
      setTimeout(removeLoading, 1000);
    });
  });
});
