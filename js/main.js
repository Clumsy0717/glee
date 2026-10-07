/* ============================================================
   SKELETON LOADER
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loading');
});

window.addEventListener('load', () => {
  const loader = document.getElementById('skeleton-loader');
  setTimeout(() => {
    loader.style.transition = 'opacity 0.5s ease';
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
      document.body.classList.remove('loading');
    }, 500);
  }, 600);
});

/* ============================================================
   HERO SCROLL EFFECT
   - Title starts centered
   - On scroll: title shifts left, portrait fades in from right
============================================================ */
function setupHeroScroll() {
  const section    = document.getElementById('hero');
  const centerText = document.getElementById('heroCenterText');
  const portrait   = document.getElementById('heroBgPortrait');
  const hint       = document.querySelector('.hero-scroll-hint');

  if (!section || !centerText || !portrait) return;

  // Add scroll hint
  const hintEl = document.createElement('div');
  hintEl.className = 'hero-scroll-hint';
  hintEl.innerHTML = '<i class="bi bi-chevron-down"></i><span>Scroll</span>';
  section.appendChild(hintEl);

  function onScroll() {
    const sectionTop    = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const scrollY       = window.scrollY;

    // Progress 0 → 1 over the hero section
    const raw      = (scrollY - sectionTop) / (sectionHeight * 0.6);
    const progress = Math.min(Math.max(raw, 0), 1);

    // Text slides left by up to 28% of viewport width
    const shiftX = progress * 28;
    centerText.style.transform    = `translateX(-${shiftX}%)`;
    centerText.style.textAlign    = progress > 0.3 ? 'left' : 'center';
    centerText.style.transition   = 'transform 0.05s linear, text-align 0.3s';

    // Portrait fades + slides in from right
    portrait.style.opacity         = progress.toFixed(3);
    portrait.style.transform       = `translateX(${(1 - progress) * 60}px)`;
    portrait.style.transition      = 'none';

    // Hide scroll hint after scrolling starts
    if (hintEl) hintEl.style.opacity = (1 - progress * 4).toString();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}

/* ============================================================
   NAVBAR SHADOW ON SCROLL
============================================================ */
function setupNavScroll() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 20
      ? '0 2px 20px rgba(0,0,0,0.12)'
      : 'none';
  }, { passive: true });
}

/* ============================================================
   SCROLL REVEAL
============================================================ */
function setupReveal() {
  document.querySelectorAll(
    '.skill-card, .mini-card, .about-heading, .about-body, .about-stat, .about-img-wrapper'
  ).forEach((el, i) => {
    el.classList.add('sr');
    if (i % 3 === 1) el.classList.add('sr-d1');
    if (i % 3 === 2) el.classList.add('sr-d2');
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.sr').forEach(el => obs.observe(el));
}

/* ============================================================
   PROJECT CARDS  — localStorage persistence + infinite marquee
============================================================ */
const STORAGE_KEY = 'glee_projects_v2';

// Default demo projects (shown when storage is empty)
const DEFAULT_PROJECTS = [
  { id: 'demo1', title: 'Hotel Management System', desc: 'A full-featured hotel booking system built with C++ and file I/O.', img: null, color: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { id: 'demo2', title: 'Grocery Inventory App',   desc: 'Python desktop app for tracking grocery inventory with CSV export.', img: null, color: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { id: 'demo3', title: 'Portfolio Website',        desc: 'This portfolio site — built with HTML, CSS, Bootstrap, and vanilla JS.', img: null, color: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
];

function loadProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [...DEFAULT_PROJECTS];
  } catch { return [...DEFAULT_PROJECTS]; }
}

function saveProjects(projects) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(projects)); } catch (e) { console.warn('Storage failed', e); }
}

function deleteProject(id) {
  const projects = loadProjects().filter(p => p.id !== id);
  saveProjects(projects);
  renderMarquee();
}

function buildCard(project) {
  const card = document.createElement('div');
  card.className = 'proj-card';
  card.dataset.id = project.id;

  const thumb = project.img
    ? `<img class="proj-thumb" src="${project.img}" alt="${project.title}" />`
    : `<div class="proj-thumb-placeholder" style="background:${project.color || 'linear-gradient(135deg,#2a2a2a,#3a3a3a)'}"><i class="bi bi-image"></i></div>`;

  card.innerHTML = `
    ${thumb}
    <div class="proj-body">
      <div class="proj-title">${project.title}</div>
      <div class="proj-desc">${project.desc || ''}</div>
      <button class="proj-delete-btn" onclick="deleteProject('${project.id}')">
        <i class="bi bi-trash3"></i> Remove
      </button>
    </div>`;
  return card;
}

function renderMarquee() {
  const track = document.getElementById('marqueeTrack');
  if (!track) return;
  track.innerHTML = '';

  const projects = loadProjects();

  if (projects.length === 0) {
    track.innerHTML = `<div class="proj-empty"><i class="bi bi-folder-plus"></i><p>No projects yet. Click "Add Project" to get started!</p></div>`;
    return;
  }

  // Build cards once, then duplicate for seamless loop
  // Need enough copies so total width > viewport × 2
  const copies = Math.max(2, Math.ceil((window.innerWidth * 2.5) / (projects.length * 296)));
  const totalSets = copies + 1; // one extra for seamless wrap

  for (let s = 0; s < totalSets; s++) {
    projects.forEach(p => track.appendChild(buildCard(p)));
  }

  // Adjust animation duration based on count (more cards = slower)
  const duration = Math.max(20, projects.length * 8);
  track.style.animationDuration = duration + 's';
}

/* ============================================================
   UPLOAD MODAL
============================================================ */
let pendingImageBase64 = null;

function openUploadModal() {
  document.getElementById('uploadModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeUploadModal() {
  document.getElementById('uploadModal').classList.remove('active');
  document.body.style.overflow = '';
  resetModal();
}

function resetModal() {
  pendingImageBase64 = null;
  document.getElementById('projectTitle').value = '';
  document.getElementById('projectDesc').value = '';
  document.getElementById('previewWrap').style.display = 'none';
  document.getElementById('dropZone').style.display = 'block';
  document.getElementById('previewImg').src = '';
}

function removePreview() {
  pendingImageBase64 = null;
  document.getElementById('previewWrap').style.display = 'none';
  document.getElementById('dropZone').style.display = 'block';
}

function handleImageSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  processImageFile(file);
}

function processImageFile(file) {
  if (!file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    pendingImageBase64 = e.target.result;
    document.getElementById('previewImg').src = pendingImageBase64;
    document.getElementById('previewWrap').style.display = 'block';
    document.getElementById('dropZone').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function submitProject() {
  const title = document.getElementById('projectTitle').value.trim();
  const desc  = document.getElementById('projectDesc').value.trim();

  if (!title) {
    document.getElementById('projectTitle').focus();
    document.getElementById('projectTitle').style.borderColor = '#f00';
    setTimeout(() => document.getElementById('projectTitle').style.borderColor = '', 1500);
    return;
  }

  const project = {
    id:    'proj_' + Date.now(),
    title,
    desc,
    img:   pendingImageBase64,
    color: null,
  };

  const projects = loadProjects();
  projects.push(project);
  saveProjects(projects);
  renderMarquee();
  closeUploadModal();
  showPopup('Project added!', 'success');
}

// Drag & drop support
function setupDropZone() {
  const zone = document.getElementById('dropZone');
  if (!zone) return;

  zone.addEventListener('click', () => document.getElementById('imageUpload').click());

  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) processImageFile(file);
  });

  // Close modal on overlay click
  document.getElementById('uploadModal').addEventListener('click', function(e) {
    if (e.target === this) closeUploadModal();
  });
}

/* ============================================================
   POPUP NOTIFICATION
============================================================ */
const popupEl = document.getElementById('popup');

function showPopup(text, status) {
  const icon = status === 'success' ? '<i class="bi bi-check-circle-fill"></i>' : '<i class="bi bi-wifi-off"></i>';
  popupEl.innerHTML = `${icon} <span>${text}</span>`;
  popupEl.className = `popup ${status}`;
  setTimeout(() => popupEl.classList.add('show'), 10);
  setTimeout(() => popupEl.classList.remove('show'), 3500);
}

/* ============================================================
   OFFLINE / ONLINE DETECTION
============================================================ */
const offlineScreen = document.getElementById('offline-screen');
function handleNetworkChange() {
  if (navigator.onLine) {
    offlineScreen.style.display = 'none';
    document.body.style.overflow = 'auto';
  } else {
    offlineScreen.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}
window.addEventListener('online',  () => { handleNetworkChange(); showPopup('You are back online!', 'success'); });
window.addEventListener('offline', () => { handleNetworkChange(); });
document.addEventListener('DOMContentLoaded', handleNetworkChange);

/* ============================================================
   AI CHAT
============================================================ */
function toggleChat() {
  const chat = document.getElementById('aiChatWindow');
  chat.style.display = (chat.style.display === 'flex') ? 'none' : 'flex';
}
function handleEnter(event) { if (event.key === 'Enter') sendMessage(); }
function sendMessage() {
  const input = document.getElementById('userInput');
  const message = input.value.trim();
  if (!message) return;
  addMessage(message, 'user');
  input.value = '';
  setTimeout(() => addMessage(getAIResponse(message.toLowerCase()), 'bot'), 600);
}
function addMessage(text, sender) {
  const body = document.getElementById('chatBody');
  const div = document.createElement('div');
  div.className = `ai-msg ${sender}`;
  div.innerText = text;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}
function getAIResponse(input) {
  // Common keywords
  const query = input.toLowerCase();

  // Greetings
  if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
    return "Hello! I'm Gunther's AI Assistant. You can ask me about his projects, skills, or how to contact him. What's on your mind?";
  }

  // Social Links & Accounts
  if (query.includes('github') || query.includes('git')) {
    return 'Check out my code here: <a href="https://github.com/Clumsy0717" target="_blank" style="color: #9b59c7; text-decoration: underline;">github.com/Clumsy0717</a>';
  }
  
  if (query.includes('facebook') || query.includes('fb')) {
    return 'Let\'s connect on Facebook: <a href="https://www.facebook.com/glee.ordinario" target="_blank" style="color: #9b59c7; text-decoration: underline;">fb.com/glee.ordinario </a>';
  }

  if (query.includes('linkedin')) {
    return 'Connect with Gunther on LinkedIn: <a href="https://www.linkedin.com/in/your-profile" target="_blank" style="color: #9b59c7; text-decoration: underline;">linkedin.com/in/your-profile</a>';
  }

  // Contact Information
  if (query.includes('phone') || query.includes('number') || query.includes('call')) {
    return 'You can call or text me at: <a href="tel:+639948902152" style="color: inherit; font-weight: bold;">+63 994 890 2152</a>';
  }

  if (query.includes('contact') || query.includes('email') || query.includes('reach')) {
    return 'You can reach me via email at <a href="mailto:guntherlee17@gmail.com">guntherlee17@gmail.com</a> or call me at <a href="tel:+639948902152">+63 994 890 2152</a>.';
  }

  // Projects & Portfolio
  if (query.includes('project') || query.includes('work') || query.includes('portfolio')) {
    return "Gunther has built a variety of apps, including a Hotel Management System (C++), a Grocery Inventory App (Python), and a Logic Quiz Game. You can scroll to the 'Projects' section to see them in action!";
  }

  // Skills & Tech Stack
  if (query.includes('skill') || query.includes('language') || query.includes('code') || query.includes('tech')) {
    return "Gunther specializes in IT Development. His core tech stack includes PHP, Python, and C++. He is also highly skilled in Database Management and Responsive Web Design.";
  }

  // About Gunther
  if (query.includes('who') || query.includes('gunther') || query.includes('about')) {
    return "Gunther Lee Ordinario is an IT student and developer based in the Philippines. He focuses on creating simple, logical, and beautiful digital solutions.";
  }

  // Default Fallback
  return "That's an interesting question! If you'd like to work with Gunther or see his resume, the best way is to contact him via Email or LinkedIn. Anything else I can help you with?";
}

function addMessage(text, sender) {
  const body = document.getElementById('chatBody');
  const div = document.createElement('div');
  div.className = `ai-msg ${sender}`;
  
  // CHANGE THIS LINE:
  // div.innerText = text;  <-- Delete this
  div.innerHTML = text;     // <-- Use this instead
  
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}

/* ============================================================
   INIT
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  setupNavScroll();
  setupHeroScroll();
  setupReveal();
  renderMarquee();
  setupDropZone();
});

window.addEventListener('load', () => {
  const loader = document.getElementById('skeleton-loader');
  
  // 1. Hide the skeleton loader
  setTimeout(() => {
    loader.style.transition = 'opacity 0.6s ease';
    loader.style.opacity = '0';
    
    setTimeout(() => {
      loader.style.display = 'none';
      document.body.classList.remove('loading');
      
      // 2. Trigger the "Appear" effect for hero elements
      triggerHeroAppear();
    }, 600);
  }, 500);
});

function triggerHeroAppear() {
  const elements = document.querySelectorAll('.appear-element');
  elements.forEach(el => {
    el.classList.add('visible');
  });
}

const observerOptions = {
  threshold: 0.2
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal');
    }
  });
}, observerOptions);

// Select the about section to watch
document.addEventListener('DOMContentLoaded', () => {
  const aboutSection = document.querySelector('.about-section');
  if (aboutSection) observer.observe(aboutSection);
});