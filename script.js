// script.js

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".site-nav");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelectorAll(".site-nav a[href^='#']");
  const yearEl = document.getElementById("year");

  // 1. Dinaminiai metai footeryje
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 2. Mobile navigacija (hamburgeris)
  if (nav && navToggle) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Uždaryti meniu, kai paspaudžiamas bet kuris linkas
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // 3. Smooth scroll visiems in-page anchor'iams
  const allAnchors = document.querySelectorAll('a[href^="#"]');
  allAnchors.forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // 4. Lengvas header efektas scrollinant 
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 10) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
});

const demoTriggers = document.querySelectorAll("[data-demo-src]");
const gifModal = document.getElementById("gifModal");
const demoVideo = document.getElementById("demoVideo");
const gifClose = document.querySelector(".gif-close");

if (demoTriggers.length && gifModal && demoVideo && gifClose) {
  let previousOverflow;
  let activeTrigger;

  const openDemo = (trigger) => {
    activeTrigger = trigger;
    demoVideo.src = trigger.dataset.demoSrc;
    gifModal.setAttribute("aria-label", trigger.dataset.demoTitle);
    demoVideo.setAttribute("aria-label", trigger.dataset.demoTitle);
    const downloadLink = demoVideo.querySelector("a");
    if (downloadLink) downloadLink.href = trigger.dataset.demoSrc;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    gifModal.style.display = "block";
    gifModal.setAttribute("aria-hidden", "false");
    demoVideo.currentTime = 0;
    demoVideo.play().catch(() => {
      // Native controls remain available if automatic playback is blocked.
    });
    gifClose.focus();
  };

  const closeDemo = () => {
    demoVideo.pause();
    demoVideo.currentTime = 0;
    gifModal.style.display = "none";
    gifModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = previousOverflow;
    activeTrigger?.focus();
  };

  demoTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => openDemo(trigger));
    if (trigger.tagName !== "BUTTON") {
      trigger.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDemo(trigger);
        }
      });
    }
  });
  gifClose.addEventListener("click", closeDemo);

  gifModal.addEventListener("click", (e) => {
    if (e.target === gifModal) closeDemo();
  });
  document.addEventListener("keydown", (e) => {
    if (gifModal.getAttribute("aria-hidden") === "true") return;
    if (e.key === "Escape") closeDemo();
    if (e.key === "Tab") {
      e.preventDefault();
      (document.activeElement === gifClose ? demoVideo : gifClose).focus();
    }
  });
}



  // Reveal on scroll (no dependencies)
  (function () {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("is-visible");
      });
    }, { threshold: 0.12 });

    els.forEach(el => io.observe(el));
  })();



  // downloads page

  (async function loadDownloads() {
  const API_URL = "https://api.github.com/repos/Liudasjan/Rentgen/releases";

  const loadingEl = document.getElementById("downloads-loading");
  const contentEl = document.getElementById("downloads-content");
  const totalEl = document.getElementById("downloads-total");
  const releasesEl = document.getElementById("downloads-releases");

  if (!loadingEl || !releasesEl) return;

  try {
    const res = await fetch(API_URL);
    const releases = await res.json();

    let grandTotal = 0;

    releases.forEach(release => {
      let releaseTotal = 0;

      release.assets.forEach(asset => {
        releaseTotal += asset.download_count;
      });

      grandTotal += releaseTotal;

      const card = document.createElement("div");
      card.className = "release-card";

      card.innerHTML = `
        <h3>${release.name} <span style="opacity:.6">(${release.tag_name})</span></h3>
        <p><strong>${releaseTotal}</strong> downloads</p>

        <table class="assets-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th class="asset-downloads">Downloads</th>
            </tr>
          </thead>
          <tbody>
            ${release.assets.map(a => `
              <tr>
                <td>${a.name}</td>
                <td class="asset-downloads">${a.download_count}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;

      releasesEl.appendChild(card);
    });

    totalEl.textContent = grandTotal.toLocaleString();
    loadingEl.style.display = "none";
    contentEl.style.display = "block";

  } catch (err) {
    loadingEl.textContent = "Failed to load download statistics.";
    console.error(err);
  }
})();
