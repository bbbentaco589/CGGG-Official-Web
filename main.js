const header = document.querySelector("#site-header");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const navLinks = [...document.querySelectorAll(".primary-nav a[href^='#']")];
const sections = [...document.querySelectorAll("main section[id]")];
const revealItems = document.querySelectorAll(".reveal");
const heroVideo = document.querySelector(".hero-video");
const mobileHeroVideoQuery = window.matchMedia("(max-width: 720px)");
const slotValues = document.querySelectorAll("[data-slot-value]");
const programCards = document.querySelectorAll("[data-program-card]");
const programDialog = document.querySelector("#program-dialog");
const partnerVisual = document.querySelector("[data-partner-visual]");
const partnerDialog = document.querySelector("#partner-dialog");

function syncHeroVideoSource(mediaQuery) {
  if (!heroVideo) return;

  const sourceMode = mediaQuery.matches ? "mobile" : "desktop";
  if (heroVideo.dataset.sourceMode === sourceMode) return;

  heroVideo.dataset.sourceMode = sourceMode;

  if (sourceMode === "mobile") {
    heroVideo.src = heroVideo.dataset.mobileSrc;
  } else {
    heroVideo.removeAttribute("src");
  }

  heroVideo.load();
  heroVideo.play().catch(() => {
    // Autoplay가 제한된 환경에서는 poster 이미지를 유지합니다.
  });
}

syncHeroVideoSource(mobileHeroVideoQuery);
mobileHeroVideoQuery.addEventListener("change", (event) => syncHeroVideoSource(event));

function setMenu(open) {
  navigation.classList.toggle("is-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
  document.body.classList.toggle("menu-open", open);
}

menuButton.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

window.addEventListener(
  "scroll",
  () => header.classList.toggle("is-scrolled", window.scrollY > 20),
  { passive: true },
);

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const currentId = entry.target.id;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`);
      });
    });
  },
  { rootMargin: "-35% 0px -58% 0px", threshold: 0 },
);

sections.forEach((section) => sectionObserver.observe(section));

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12 },
);

revealItems.forEach((item) => revealObserver.observe(item));

slotValues.forEach((valueElement, valueIndex) => {
  const value = valueElement.dataset.slotValue;
  valueElement.textContent = "";
  valueElement.setAttribute("aria-label", value);

  [...value].forEach((character, characterIndex) => {
    if (!/\d/.test(character)) {
      const staticCharacter = document.createElement("span");
      staticCharacter.className = "slot-static";
      staticCharacter.textContent = character;
      staticCharacter.setAttribute("aria-hidden", "true");
      valueElement.append(staticCharacter);
      return;
    }

    const windowElement = document.createElement("span");
    const reelElement = document.createElement("span");
    windowElement.className = "slot-window";
    reelElement.className = "slot-reel";
    windowElement.setAttribute("aria-hidden", "true");
    const stopPosition = 20 + Number(character);
    reelElement.style.setProperty("--slot-stop-y", `-${stopPosition}em`);
    reelElement.style.setProperty(
      "--slot-overshoot-y",
      `-${stopPosition + 0.38}em`,
    );
    reelElement.style.setProperty(
      "--slot-rebound-y",
      `-${stopPosition - 0.12}em`,
    );
    reelElement.style.setProperty(
      "--slot-delay",
      `${valueIndex * 150 + characterIndex * 110}ms`,
    );
    reelElement.style.setProperty(
      "--slot-duration",
      `${2100 + characterIndex * 130}ms`,
    );

    for (let cycle = 0; cycle < 3; cycle += 1) {
      for (let digit = 0; digit <= 9; digit += 1) {
        const digitElement = document.createElement("span");
        digitElement.textContent = String(digit);
        reelElement.append(digitElement);
      }
    }

    windowElement.append(reelElement);
    valueElement.append(windowElement);
  });
});

const slotObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove("is-running");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => entry.target.classList.add("is-running"));
      });
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.8 },
);

slotValues.forEach((value) => slotObserver.observe(value));

if (programDialog) {
  const dialogImage = programDialog.querySelector(".program-dialog-image");
  const dialogTag = programDialog.querySelector("#program-dialog-tag");
  const dialogTitle = programDialog.querySelector("#program-dialog-title");
  const dialogDescription = programDialog.querySelector(
    "#program-dialog-description",
  );
  const dialogCloseButton = programDialog.querySelector(".program-dialog-close");
  let lastFocusedProgramCard = null;

  function openProgramDialog(card) {
    const cardImage = card.querySelector("img");
    lastFocusedProgramCard = card;
    dialogImage.src = cardImage.currentSrc || cardImage.src;
    dialogImage.alt = `${card.querySelector("h3").textContent} 프로그램 이미지`;
    dialogTag.textContent = card.querySelector(".program-tag").textContent;
    dialogTitle.textContent = card.querySelector("h3").textContent;
    dialogDescription.textContent = card.querySelector("p").textContent.trim();
    document.body.classList.add("modal-open");
    programDialog.showModal();
  }

  programCards.forEach((card) => {
    card.addEventListener("click", () => openProgramDialog(card));
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openProgramDialog(card);
    });
  });

  dialogCloseButton.addEventListener("click", () => programDialog.close());
  programDialog.addEventListener("click", (event) => {
    if (event.target === programDialog) programDialog.close();
  });
  programDialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    lastFocusedProgramCard?.focus();
  });
}

if (partnerVisual && partnerDialog) {
  const partnerDialogClose = partnerDialog.querySelector(".asset-dialog-close");

  function openPartnerDialog() {
    document.body.classList.add("modal-open");
    partnerDialog.showModal();
  }

  partnerVisual.addEventListener("click", openPartnerDialog);
  partnerVisual.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openPartnerDialog();
  });

  partnerDialogClose.addEventListener("click", () => partnerDialog.close());
  partnerDialog.addEventListener("click", (event) => {
    if (event.target === partnerDialog) partnerDialog.close();
  });
  partnerDialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    partnerVisual.focus();
  });
}

document.querySelector("#current-year").textContent = new Date().getFullYear();
