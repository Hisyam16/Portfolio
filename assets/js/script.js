'use strict';



// ==========================================================
// language toggle (EN / ID)
// ==========================================================
(function initLangToggle() {
  const STORAGE_KEY = 'site-lang';
  const toggleBtn = document.getElementById('langToggle');
  let currentLang = localStorage.getItem(STORAGE_KEY) || 'en';

  window.getCurrentLang = function () { return currentLang; };

  window.setLang = function (lang) {
    if (lang !== 'en' && lang !== 'id') lang = 'en';
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-lang]').forEach(function (el) {
      if (el.getAttribute('data-lang') === lang) {
        el.removeAttribute('hidden');
      } else {
        el.setAttribute('hidden', '');
      }
    });

    if (toggleBtn) {
      toggleBtn.querySelectorAll('[data-lang-option]').forEach(function (opt) {
        opt.classList.toggle('active', opt.getAttribute('data-lang-option') === lang);
      });
    }

    // if a project modal is currently open, refresh its text to the new language
    if (typeof window.refreshOpenProjectModal === 'function') {
      window.refreshOpenProjectModal();
    }
  };

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      window.setLang(currentLang === 'en' ? 'id' : 'en');
    });
  }

  // apply immediately so there's no flash of the wrong language
  window.setLang(currentLang);
})();



// preloader — cycles greetings in multiple languages, then reveals the page
(function initPreloader() {
  const preloader = document.getElementById('preloader');
  const wordEl = document.getElementById('preloaderWord');
  const fillEl = document.getElementById('preloaderFill');
  if (!preloader || !wordEl) return;

  const greetings = [
    'Hello', 'Halo', 'こんにちは', '안녕하세요', '你好',
    'مرحبا', 'Hola', 'Bonjour', 'Hallo', 'Olá'
  ];

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function finishPreloader() {
    preloader.classList.add('preloader-exit');
    document.body.classList.remove('is-loading');
    preloader.addEventListener('transitionend', () => {
      preloader.classList.add('preloader-hidden');
    }, { once: true });
  }

  if (prefersReduced) {
    wordEl.textContent = 'Halo';
    setTimeout(finishPreloader, 300);
    return;
  }

  let i = 0;
  const stepDuration = 260; // ms per word
  const totalDuration = greetings.length * stepDuration;

  const interval = setInterval(() => {
    i++;
    if (i >= greetings.length) {
      clearInterval(interval);
      return;
    }
    wordEl.style.animation = 'none';
    void wordEl.offsetWidth; // reflow to restart animation
    wordEl.style.animation = '';
    wordEl.textContent = greetings[i];
  }, stepDuration);

  // progress bar in sync with the word cycling
  let elapsed = 0;
  const progressInterval = setInterval(() => {
    elapsed += 40;
    const pct = Math.min(100, (elapsed / totalDuration) * 100);
    fillEl.style.width = pct + '%';
    if (pct >= 100) clearInterval(progressInterval);
  }, 40);

  // once the page has loaded AND the cycle has finished, reveal the page
  window.addEventListener('load', () => {
    setTimeout(finishPreloader, totalDuration + 150);
  });

  // fallback in case 'load' takes too long or already fired
  setTimeout(() => {
    if (!preloader.classList.contains('preloader-exit')) finishPreloader();
  }, totalDuration + 2500);
})();



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });



// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {

  testimonialsItem[i].addEventListener("click", function () {

    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;

    testimonialsModalFunc();

  });

}

// add event to modal close button
modalCloseBtn.addEventListener("click", testimonialsModalFunc);
overlay.addEventListener("click", testimonialsModalFunc);



// project detail modal variables
const projectItems = document.querySelectorAll("[data-project-item]");
const projectModalContainer = document.querySelector("[data-project-modal-container]");
const projectModalCloseBtn = document.querySelector("[data-project-modal-close-btn]");
const projectOverlay = document.querySelector("[data-project-overlay]");

const projectModalImg = document.querySelector("[data-project-modal-img]");
const projectModalTitle = document.querySelector("[data-project-modal-title]");
const projectModalCategory = document.querySelector("[data-project-modal-category]");
const projectModalTech = document.querySelector("[data-project-modal-tech]");
const projectModalText = document.querySelector("[data-project-modal-text]");
const projectModalActions = document.querySelector("[data-project-modal-actions]");
const projectModalLink = document.querySelector("[data-project-modal-link]");
const projectModalLinkLabel = document.querySelector("[data-project-modal-link-label]");

// project modal toggle function
const projectModalFunc = function () {
  projectModalContainer.classList.toggle("active");
  projectOverlay.classList.toggle("active");
}

// pick the dataset value for the current language, falling back to a
// language-neutral field (e.g. data-title) when no *-en/*-id pair exists
const pickLangField = function (item, base) {
  const lang = (typeof window.getCurrentLang === 'function') ? window.getCurrentLang() : 'en';
  const langKey = base + (lang === 'id' ? 'Id' : 'En'); // e.g. "titleEn" / "titleId"
  return item.dataset[langKey] || item.dataset[base] || "";
}

// currently open project item, so we can refresh its text on language switch
let currentModalItem = null;

// open the project modal with this item's data
const openProjectModal = function (item) {

  currentModalItem = item;

  projectModalImg.src = item.dataset.img;
  const title = pickLangField(item, "title");
  projectModalImg.alt = title;
  projectModalTitle.innerHTML = title;
  projectModalCategory.innerHTML = pickLangField(item, "category");
  projectModalText.innerHTML = `<p>${pickLangField(item, "desc")}</p>`;

  // tech badges
  projectModalTech.innerHTML = "";
  if (item.dataset.tech) {
    const techList = item.dataset.tech.split(",");
    for (let i = 0; i < techList.length; i++) {
      const badge = document.createElement("span");
      badge.className = "project-modal-tech-item";
      badge.innerHTML = techList[i].trim();
      projectModalTech.appendChild(badge);
    }
  }

  // external link (live demo / video), only shown when provided
  if (item.dataset.link) {
    projectModalLink.href = item.dataset.link;
    projectModalLinkLabel.innerHTML = pickLangField(item, "linkLabel") || "Visit";
    projectModalActions.style.display = "flex";
  } else {
    projectModalActions.style.display = "none";
  }

  projectModalFunc();

}

// re-render the open modal's text when the language is switched
window.refreshOpenProjectModal = function () {
  if (currentModalItem && projectModalContainer.classList.contains("active")) {
    const title = pickLangField(currentModalItem, "title");
    projectModalImg.alt = title;
    projectModalTitle.innerHTML = title;
    projectModalCategory.innerHTML = pickLangField(currentModalItem, "category");
    projectModalText.innerHTML = `<p>${pickLangField(currentModalItem, "desc")}</p>`;
    if (currentModalItem.dataset.link) {
      projectModalLinkLabel.innerHTML = pickLangField(currentModalItem, "linkLabel") || "Visit";
    }
  }
}

// add click + keyboard event to all project items
for (let i = 0; i < projectItems.length; i++) {

  projectItems[i].addEventListener("click", function () {
    openProjectModal(this);
  });

  projectItems[i].addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openProjectModal(this);
    }
  });

}

// add event to project modal close button
projectModalCloseBtn.addEventListener("click", projectModalFunc);
projectOverlay.addEventListener("click", projectModalFunc);



// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

if (select) {
  select.addEventListener("click", function () { elementToggleFunc(this); });
}

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    if (selectValue) selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);

  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    if (selectValue) selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;

  });

}



// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });
}



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    const target = this.dataset.pageTarget;

    for (let i = 0; i < pages.length; i++) {
      if (target === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }

  });
}