/* ============================================================
   Mastouri Studio — Interactions
   ------------------------------------------------------------
   - Intro loader (MASTOURI)
   - Mobile menu
   - Hero name 3D parallax on mouse
   - Word-by-word scroll reveal (studio bio)
   - Clip-path image reveal on scroll
   - Menu hover character wave
   - Nav hide on scroll down / show on scroll up
   - Showreel autoplay in view
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  // Mark JS as enabled so CSS can hide elements for animation
  document.body.classList.add("js-enabled");
  document.documentElement.classList.add("js");

  // Run each init in its own try/catch so one failure doesn't break the rest
  const inits = [
    initIntroLoader,
    initMenu,
    initHeroParallax,
    initWaveReveal,
    initImageReveal,
    initSelectedProjects,
    initMenuHoverChars,
    initNavScroll,
    initExperience,
    initCertificates,
    initOutsideFrame,
    initUpsideDown,
    initScrollReveal,
    initMetaReveal,
    initShowreelAutoplay,
    initContactForm,
    initCaseVideos,
    initCaseFlows,
  ];
  inits.forEach((fn) => {
    try {
      fn();
    } catch (err) {
      console.warn("Animation init failed:", fn.name, err);
    }
  });
});

/* ============================================================
   1. Intro loader (MASTOURI)
   ============================================================ */
function initIntroLoader() {
  const loader = document.querySelector("[data-intro]");
  const chip = document.querySelector("[data-intro-chip]");
  const chipImg = document.querySelector("[data-intro-img]");

  if (!loader) return;

  // Skip the intro for reduced-motion users and on repeat visits in the same session
  let seen = false;
  try {
    seen = sessionStorage.getItem("introSeen") === "1";
    sessionStorage.setItem("introSeen", "1");
  } catch (err) {}
  if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    loader.remove();
    return;
  }

  setTimeout(() => chip?.classList.add("is-open"), 1180);

  const introImages = [
    "images/intro/intro-1.webp",
    "images/intro/intro-2.webp",
    "images/intro/intro-3.webp",
    "images/intro/intro-4.webp",
  ];
  let idx = 0;
  const swapImage = () => {
    idx = (idx + 1) % introImages.length;
    if (chipImg) chipImg.src = introImages[idx];
  };
  const imageInterval = setInterval(swapImage, 180);

  const hideLoader = () => {
    clearInterval(imageInterval);
    loader.classList.add("is-hidden");
    setTimeout(() => loader.remove(), 500);
  };
  setTimeout(hideLoader, 3000);
}

/* ============================================================
   3. Mobile menu
   ============================================================ */
function initMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");
  const scrim = document.querySelector("[data-menu-scrim]");
  const links = document.querySelectorAll("[data-menu-link]");

  if (!toggle || !menu) return;

  const openMenu = () => {
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    scrim?.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    document.body.style.overflow = "hidden";
  };

  const closeMenu = () => {
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    scrim?.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
  };

  toggle.addEventListener("click", () => {
    menu.classList.contains("is-open") ? closeMenu() : openMenu();
  });

  scrim?.addEventListener("click", closeMenu);
  links.forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());
}

/* ============================================================
   4. Hero name 3D parallax on mouse move
   ============================================================ */
function initHeroParallax() {
  const hero = document.querySelector(".hero");
  const lines = document.querySelectorAll("[data-parallax-line]");
  if (!hero || !lines.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let raf = null;
  hero.addEventListener("pointermove", (e) => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      lines.forEach((line, i) => {
        const depth = (i + 1) * 10;
        line.style.transform = `translate3d(${x * depth}px, ${y * depth}px, 0)`;
      });
    });
  });

  hero.addEventListener("pointerleave", () => {
    lines.forEach((line) => (line.style.transform = "translate3d(0,0,0)"));
  });
}

/* ============================================================
   6. Word-by-word scroll reveal (studio bio)
   Words "light up" as the section scrolls into view.
   ============================================================ */
function initWaveReveal() {
  const wave = document.querySelector("[data-wave]");
  const track = document.querySelector("[data-wave-track]");
  const stickyContent = track?.querySelector(".studio-wave-content");
  if (!wave) return;
  const words = wave.querySelectorAll(".wave-word");
  if (!words.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    words.forEach((w) => w.classList.add("is-lit"));
    return;
  }

  let last = 0;
  let raf = null;

  const update = () => {
    raf = null;
    const rect = (track || wave).getBoundingClientRect();
    const contentHeight = stickyContent?.getBoundingClientRect().height ?? wave.getBoundingClientRect().height;
    const vh = window.innerHeight;
    // Pin the block (incl. the showreel) vertically centred, keeping it on screen
    const stickyTop = Math.max(32, Math.min((vh - contentHeight) / 2 + 24, vh - contentHeight - 24));
    if (stickyContent) stickyContent.style.top = `${stickyTop}px`;
    const scrollRange = Math.max(1, rect.height - contentHeight);
    const progress = Math.max(0, Math.min(1, (stickyTop - rect.top) / scrollRange));
    const litCount = Math.floor(progress * words.length);

    if (litCount !== last) {
      if (litCount > last) {
        for (let i = last; i < litCount; i++) words[i]?.classList.add("is-lit");
      } else {
        for (let i = litCount; i < last; i++) words[i]?.classList.remove("is-lit");
      }
      last = litCount;
    }
  };

  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
}

/* ============================================================
   7. Clip-path image reveal on scroll
   ============================================================ */
function initImageReveal() {
  const imgs = document.querySelectorAll("[data-reveal-img]");
  if (!imgs.length) return;
  if (!("IntersectionObserver" in window)) {
    imgs.forEach((img) => img.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  imgs.forEach((img) => observer.observe(img));
}

/* ============================================================
   8. Menu / button hover: split text into character spans
   so the whole word does a little bounce on hover.
   ============================================================ */
function initMenuHoverChars() {
  const hwTexts = document.querySelectorAll("[data-hw-text]");
  hwTexts.forEach((el) => {
    const text = el.textContent;
    el.innerHTML = "";
    text.split("").forEach((char) => {
      const span = document.createElement("span");
      span.textContent = char === " " ? "\u00A0" : char;
      span.style.display = "inline-block";
      el.appendChild(span);
    });
  });

  // Stagger the character transform on hover
  document.querySelectorAll("[data-hw]").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      const spans = el.querySelectorAll(".hw-text span");
      spans.forEach((span, i) => {
        span.style.transitionDelay = `${i * 22}ms`;
      });
    });
    el.addEventListener("mouseleave", () => {
      const spans = el.querySelectorAll(".hw-text span");
      spans.forEach((span) => {
        span.style.transitionDelay = "";
      });
    });
  });
}

/* ============================================================
   9. Nav hide on scroll down, show on scroll up
   ============================================================ */
function initNavScroll() {
  const nav = document.querySelector(".site-nav");
  if (!nav) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Small scroll jitters (trackpads, momentum) no longer flip the nav:
  // it hides after 12px of downward travel and returns after 40px upward.
  let lastY = window.scrollY;
  let travel = 0;
  let raf = null;

  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      nav.classList.toggle("is-scrolled", y > 40);
      if (y <= 80) {
        nav.classList.remove("is-hidden");
        travel = 0;
        return;
      }
      if (Math.sign(dy) !== Math.sign(travel)) travel = 0;
      travel += dy;
      if (travel > 12) nav.classList.add("is-hidden");
      else if (travel < -40) nav.classList.remove("is-hidden");
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ============================================================
   10. Scroll reveal for section heads & cards
   ============================================================ */
function initScrollReveal() {
  const reveals = document.querySelectorAll(".section-head, .art-card, .xp-role, .cs-reveal");
  const checkVisible = () => {
    reveals.forEach((el) => {
      if (el.classList.contains("is-visible")) return;
      const rect = el.getBoundingClientRect();
      const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      if (visibleHeight / rect.height >= 0.15) el.classList.add("is-visible");
    });
  };

  if (!("IntersectionObserver" in window)) {
    checkVisible();
    window.addEventListener("scroll", checkVisible, { passive: true });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
      checkVisible();
    },
    { threshold: 0.15 }
  );

  reveals.forEach((el) => observer.observe(el));
  checkVisible();
  window.addEventListener("scroll", checkVisible, { passive: true });
}

/* ============================================================
   10b. Case-study meta row (Role / Timeline / Year / Team):
        masked slide-up, staggered per column, label then value
   ============================================================ */
function initMetaReveal() {
  const rows = document.querySelectorAll(".cs-meta");
  if (!rows.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const COLUMN_STAGGER = 100; // ms between columns
  const LINE_STAGGER = 60;    // ms between a label and its value

  rows.forEach((row) => {
    [...row.children].forEach((col, colIndex) => {
      col.querySelectorAll("dt, dd").forEach((cell, lineIndex) => {
        const mask = document.createElement("span");
        const line = document.createElement("span");
        mask.className = "cs-meta__mask";
        line.className = "cs-meta__line";
        line.style.setProperty("--d", `${colIndex * COLUMN_STAGGER + lineIndex * LINE_STAGGER}ms`);
        line.append(...cell.childNodes);
        mask.append(line);
        cell.append(mask);
      });
    });
    row.classList.add("cs-meta--masked");
  });

  // Same belt-and-braces approach as initScrollReveal: observer + scroll check
  const checkVisible = () => {
    rows.forEach((row) => {
      if (row.classList.contains("is-visible")) return;
      const rect = row.getBoundingClientRect();
      const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      if (visibleHeight / rect.height >= 0.4) row.classList.add("is-visible");
    });
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    rows.forEach((row) => observer.observe(row));
  }

  requestAnimationFrame(checkVisible);
  window.addEventListener("scroll", checkVisible, { passive: true });
}

/* ============================================================
   11. Auto-play showreel when in view
   ============================================================ */
function initShowreelAutoplay() {
  const video = document.querySelector(".studio-reel video");
  if (!video) return;
  if (!("IntersectionObserver" in window)) {
    video.play().catch(() => {});
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      });
    },
    { threshold: 0.5 }
  );
  observer.observe(video);
}

/* ============================================================
   13. Contact form (validated here, delivered by Web3Forms)
   ============================================================ */
function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;
  const note = form.querySelector("[data-form-note]");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.querySelector("[name=name]").value.trim();
    const email = form.querySelector("[name=email]").value.trim();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!name || !emailValid) {
      note.textContent = "Please enter your name and a valid email.";
      note.classList.add("is-error");
      note.classList.remove("is-success");
      return;
    }

    // Send through Web3Forms, which emails the submission
    const button = form.querySelector("[type=submit]");
    button.disabled = true;
    note.textContent = "Sending…";
    note.classList.remove("is-error", "is-success");

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) throw new Error(data.message);
        note.textContent = "Thanks! Your message was sent. I'll get back to you soon.";
        note.classList.add("is-success");
        form.reset();
      })
      .catch(() => {
        note.textContent = "Something went wrong. Please email me at contactmastourid@gmail.com.";
        note.classList.add("is-error");
      })
      .finally(() => {
        button.disabled = false;
      });
  });
}

/* ============================================================
   14b. Case-study videos: play only while on screen
   ============================================================ */
function initCaseVideos() {
  const videos = document.querySelectorAll("video[data-case-video]");
  if (!videos.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    videos.forEach((video) => {
      video.removeAttribute("autoplay");
      video.controls = true;
      video.pause();
    });
    return;
  }
  if (!("IntersectionObserver" in window)) {
    videos.forEach((video) => video.play().catch(() => {}));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.play().catch(() => {});
        else entry.target.pause();
      });
    },
    { threshold: 0.2 }
  );
  videos.forEach((video) => observer.observe(video));
}

/* ============================================================
   14c. Case-study flow steppers: numbered steps drive a phone
   screen. Inside [data-flow-scroll] the scroll position picks
   the step; otherwise steps auto-advance while visible.
   ============================================================ */
function initCaseFlows() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-flow]").forEach((flow) => {
    const steps = Array.from(flow.querySelectorAll(".cs-flow__step"));
    const screens = Array.from(flow.querySelectorAll(".cs-flow__screens img"));
    if (!steps.length || steps.length !== screens.length) return;
    const track = flow.closest("[data-flow-scroll]");
    if (track) {
      initScrollFlow(flow, track, steps, screens);
      return;
    }
    const delay = 3800;
    flow.style.setProperty("--flow-ms", `${delay}ms`);
    let index = 0;
    let timer = null;
    let visible = false;
    let hovering = false;

    // Compact caption for small screens, where steps collapse to numbered chips.
    const caption = document.createElement("p");
    caption.className = "cs-flow__caption";
    caption.setAttribute("aria-hidden", "true");
    flow.querySelector(".cs-flow__steps").after(caption);

    const show = (i) => {
      index = (i + steps.length) % steps.length;
      steps.forEach((step, n) => {
        step.classList.toggle("is-active", n === index);
        step.setAttribute("aria-current", n === index ? "step" : "false");
      });
      screens.forEach((img, n) => img.classList.toggle("is-active", n === index));
      const title = steps[index].querySelector("b");
      const text = steps[index].querySelector("small");
      caption.innerHTML = "";
      if (title) caption.append(title.cloneNode(true));
      if (text) caption.append(text.cloneNode(true));
    };

    const schedule = () => {
      clearTimeout(timer);
      const playing = !reducedMotion && visible && !hovering;
      flow.classList.toggle("is-playing", playing);
      if (playing) timer = setTimeout(() => { show(index + 1); restartBar(); schedule(); }, delay);
    };

    // Re-trigger the CSS progress-bar animation on the active step.
    const restartBar = () => {
      const bar = steps[index].querySelector(".cs-flow__bar");
      if (!bar) return;
      bar.style.animation = "none";
      void bar.offsetWidth;
      bar.style.animation = "";
    };

    steps.forEach((step, n) => {
      step.addEventListener("click", () => { show(n); restartBar(); schedule(); });
    });
    flow.addEventListener("pointerenter", () => { hovering = true; schedule(); });
    flow.addEventListener("pointerleave", () => { hovering = false; restartBar(); schedule(); });
    flow.addEventListener("focusin", () => { hovering = true; schedule(); });
    flow.addEventListener("focusout", () => { hovering = false; schedule(); });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        if (visible) restartBar();
        schedule();
      }, { threshold: 0.35 }).observe(flow);
    }
    show(0);
  });
}

function initScrollFlow(flow, track, steps, screens) {
  flow.classList.add("is-scroll");
  track.style.setProperty("--steps", steps.length);

  const caption = document.createElement("p");
  caption.className = "cs-flow__caption";
  caption.setAttribute("aria-hidden", "true");
  flow.querySelector(".cs-flow__steps").after(caption);

  let index = -1;
  const show = (i) => {
    if (i === index) return;
    index = i;
    steps.forEach((step, n) => {
      step.classList.toggle("is-active", n === index);
      step.classList.toggle("is-done", n < index);
      step.setAttribute("aria-current", n === index ? "step" : "false");
    });
    screens.forEach((img, n) => img.classList.toggle("is-active", n === index));
    caption.innerHTML = "";
    const title = steps[index].querySelector("b");
    const text = steps[index].querySelector("small");
    if (title) caption.append(title.cloneNode(true));
    if (text) caption.append(text.cloneNode(true));
  };

  // 0 → 1 across the scrollable length of the track.
  const progress = () => {
    const rect = track.getBoundingClientRect();
    const range = rect.height - window.innerHeight;
    return range > 0 ? Math.min(1, Math.max(0, -rect.top / range)) : 0;
  };

  let raf = null;
  const update = () => {
    raf = null;
    const scaled = progress() * steps.length;
    const i = Math.min(steps.length - 1, Math.floor(scaled));
    show(i);
    steps[i].style.setProperty("--p", Math.min(1, scaled - i).toFixed(3));
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  // Clicking a step scrolls to the middle of that step's segment.
  steps.forEach((step, n) => {
    step.addEventListener("click", () => {
      const range = track.offsetHeight - window.innerHeight;
      const top = track.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + range * ((n + 0.5) / steps.length), behavior: "smooth" });
    });
  });

  update();
}

/* ============================================================
   15. Selected Projects prototype interactions & animations:
   - Character splitting & staggered wave hover sweep
   - Scroll entrance reveal via IntersectionObserver
   - Card hover & focus interactions
   ============================================================ */
function initSelectedProjects() {
  const cards = document.querySelectorAll(".project-card");
  if (!cards.length) return;
  const projects = cards[0].closest(".projects");
  if (!projects) return;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Split titles and metadata into accessible word spans for the red wave.
  document.querySelectorAll(".project-card [data-wave], .project-card__detail dt, .project-card__detail dd").forEach((text) => {
    const label = text.textContent.trim();
    const visualLabel = document.createElement("span");
    visualLabel.setAttribute("aria-hidden", "true");
    let wordIndex = 0;
    label.split(/(\s+)/).filter(Boolean).forEach((part) => {
      if (/^\s+$/.test(part)) {
        visualLabel.append(document.createTextNode(part));
        return;
      }
      const word = document.createElement("span");
      word.className = "project-wave-word";
      word.style.setProperty("--word-index", wordIndex++);
      word.textContent = part;
      visualLabel.append(word);
    });
    if (text.matches("[data-wave]")) {
      text.setAttribute("aria-label", label);
      text.replaceChildren(visualLabel);
    } else {
      const accessibleLabel = document.createElement("span");
      accessibleLabel.className = "sr-only";
      accessibleLabel.textContent = label;
      text.replaceChildren(visualLabel, accessibleLabel);
    }
  });

  // Entrance transition via IntersectionObserver
  if (!reducedMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js");
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
            // Drop the entrance stagger once revealed so hover dimming isn't delayed
            window.setTimeout(() => { entry.target.style.transitionDelay = "0ms"; }, 900);
          }
        });
      },
      { threshold: 0.12 }
    );
    cards.forEach((card, index) => {
      card.style.transitionDelay = `${Math.min(index * 70, 210)}ms`;
      observer.observe(card);
    });
  } else {
    cards.forEach((card) => card.classList.add("is-visible"));
  }

  // Expanding/collapsing is animated as a height tween (measure before/after the
  // class swap) so the rows never jump under the cursor.
  let currentCard = null;
  let resizing = false;
  let resizeTimeout;
  let intentTimeout;
  const RESIZE_MS = 520;

  const setActiveCard = (activeCard, animate = true) => {
    if (activeCard === currentCard) return;
    currentCard = activeCard;
    const shouldAnimate = animate && !reducedMotion && typeof Element.prototype.animate === "function";
    const before = shouldAnimate ? [...cards].map((card) => card.getBoundingClientRect().height) : null;

    projects.classList.add("has-active-project");
    cards.forEach((card) => {
      card.heightAnimation?.cancel();
      card.classList.toggle("is-active", card === activeCard);
      if (card !== activeCard) {
        card.classList.remove("is-media-active");
        delete card.dataset.waveOn;
      }
    });
    if (!before) return;

    resizing = true;
    cards.forEach((card, i) => {
      const after = card.getBoundingClientRect().height;
      if (Math.abs(after - before[i]) < 1) return;
      card.classList.add("is-resizing");
      card.heightAnimation = card.animate(
        [{ height: `${before[i]}px` }, { height: `${after}px` }],
        { duration: RESIZE_MS, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
      );
      card.heightAnimation.onfinish = () => card.classList.remove("is-resizing");
      card.heightAnimation.oncancel = () => card.classList.remove("is-resizing");
    });

    // Pointer events fired by the layout moving are ignored; once it settles,
    // open whichever card the cursor actually rests on.
    window.clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
      resizing = false;
      const hovered = projects.querySelector(".project-card:hover");
      if (hovered && hovered !== currentCard) hovered.dispatchEvent(new Event("project:activate"));
    }, RESIZE_MS);
  };

  const initialCard = projects.querySelector(".project-card.is-active") || cards[0];
  setActiveCard(initialCard, false);

  // Selecting a project keeps it open until a different project is selected.
  cards.forEach((card) => {
    let waveTimeout;
    const playWave = () => {
      if (reducedMotion || card.dataset.waveOn === "true") return;
      window.clearTimeout(waveTimeout);
      delete card.dataset.waveOn;
      void card.offsetWidth;
      card.dataset.waveOn = "true";
      waveTimeout = window.setTimeout(() => {
        delete card.dataset.waveOn;
      }, 2100);
    };
    const activateCard = () => {
      setActiveCard(card);
      card.classList.add("is-title-visited");
      playWave();
    };
    // Short hover intent so sweeping the cursor across the list doesn't open every row
    card.addEventListener("pointerenter", (e) => {
      window.clearTimeout(intentTimeout);
      if (resizing) return;
      if (e.pointerType === "touch") { activateCard(); return; }
      intentTimeout = window.setTimeout(activateCard, 90);
    });
    card.addEventListener("pointerleave", () => window.clearTimeout(intentTimeout));
    card.addEventListener("project:activate", activateCard);
    card.addEventListener("focusin", activateCard);

    const media = card.querySelector(".project-card__media");
    media?.addEventListener("pointerenter", () => {
      setActiveCard(card);
      card.classList.add("is-title-visited");
      card.classList.add("is-media-active");
      playWave();
    });
    media?.addEventListener("pointerleave", () => {
      card.classList.remove("is-media-active");
    });
  });
}

/* ============================================================
   16. Experience: split heading/company text for the staggered
       entrance (CSS-driven off .is-visible) and drive the
       case-card screen parallax from scroll position
   ============================================================ */
function initExperience() {
  const section = document.querySelector(".xp");
  if (!section) return;

  // Heading -> per-letter spans, with the real text kept for screen readers
  const heading = section.querySelector(".xp-heading");
  if (heading) {
    const label = heading.textContent.trim();
    const visual = document.createElement("span");
    visual.setAttribute("aria-hidden", "true");
    [...label].forEach((ch, i) => {
      const char = document.createElement("span");
      char.className = "xp-char";
      char.style.setProperty("--i", i);
      char.textContent = ch;
      visual.append(char);
    });
    const accessible = document.createElement("span");
    accessible.className = "sr-only";
    accessible.textContent = label;
    heading.replaceChildren(visual, accessible);
  }

  // Company names slide up out of a mask
  section.querySelectorAll(".xp-role__company").forEach((el) => {
    const mask = document.createElement("span");
    mask.className = "xp-mask";
    const inner = document.createElement("span");
    inner.className = "xp-mask__inner";
    inner.append(...el.childNodes);
    mask.append(inner);
    el.append(mask);
  });

  // Stagger indexes for bullet points and stack chips
  section.querySelectorAll(".xp-role__points, .xp-role__stack").forEach((list) => {
    [...list.children].forEach((li, i) => li.style.setProperty("--i", i));
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const media = [...section.querySelectorAll(".xp-case__media")];
  let raf = null;
  const update = () => {
    raf = null;
    const vh = window.innerHeight;
    media.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      // 1 when the card enters at the bottom, 0 from the middle of the viewport up,
      // so the screens settle into their designed layout and never drift past it
      const p = ((rect.top + rect.height / 2) / vh) * 2 - 1;
      el.style.setProperty("--xp-par", Math.max(0, Math.min(1, p)).toFixed(3));
    });
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
}

/* ============================================================
   17. Certificates: rows slide in from the right one after
       another as the list scrolls up (rules draw from the right),
       and on desktop a preview image trails the cursor
   ============================================================ */
function initCertificates() {
  const list = document.querySelector("[data-certs]");
  if (!list) return;
  const items = [...list.querySelectorAll(".cert")];
  if (!items.length) return;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reducedMotion) {
    const rows = items.map((li) => li.querySelector(".cert__row"));
    const rules = items.map((li) => li.querySelector(".cert__rule"));
    let raf = null;
    const update = () => {
      raf = null;
      const vh = window.innerHeight;
      // Each row runs its own 0 -> 1 as it travels from the bottom edge to ~70% of the viewport
      // (the <li> isn't transformed, so its rect is a stable measure)
      items.forEach((li, i) => {
        const top = li.getBoundingClientRect().top;
        const p = Math.min(1, Math.max(0, (vh * 0.98 - top) / (vh * 0.28)));
        const e = 1 - Math.pow(1 - p, 3);
        rows[i].style.transform = `translate3d(${((1 - e) * 28).toFixed(2)}%, 0, 0)`;
        rows[i].style.opacity = String(e);
        if (rules[i]) {
          rules[i].style.transform = `scaleX(${e.toFixed(3)})`;
          rules[i].style.transformOrigin = "right";
        }
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  // Hover: dim the other rows; show that certificate's preview by the cursor
  if (!window.matchMedia("(hover: hover) and (min-width: 1024px)").matches) return;
  const preview = document.querySelector("[data-certs-preview]");
  const imgs = items.map((li) => {
    const src = li.dataset.preview;
    if (!src || !preview) return null;
    const img = document.createElement("img");
    img.className = "certs-preview__img";
    img.src = src;
    img.alt = "";
    img.loading = "lazy";
    preview.append(img);
    return img;
  });

  const target = { x: 0, y: 0 };
  const pos = { x: 0, y: 0 };
  let started = false;
  let loop = null;
  const follow = () => {
    pos.x += (target.x - pos.x) * 0.22;
    pos.y += (target.y - pos.y) * 0.22;
    const tilt = reducedMotion ? 0 : Math.max(-8, Math.min(8, (target.x - pos.x) * 0.22));
    preview.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${tilt}deg)`;
    loop = requestAnimationFrame(follow);
  };

  const setActive = (index) => {
    list.classList.toggle("is-hovering", index !== null);
    items.forEach((li, i) => {
      li.classList.toggle("is-active", i === index);
      imgs[i]?.classList.toggle("is-active", i === index);
    });
  };

  list.addEventListener("mousemove", (e) => {
    target.x = e.clientX;
    target.y = e.clientY;
    if (!started) { pos.x = target.x; pos.y = target.y; started = true; }
    if (preview && !loop) loop = requestAnimationFrame(follow);
  });
  list.addEventListener("mouseleave", () => {
    setActive(null);
    started = false;
    cancelAnimationFrame(loop);
    loop = null;
  });
  items.forEach((li, i) => li.addEventListener("mouseenter", () => setActive(i)));
}

/* ============================================================
   18. Outside the Frame: a black mirror. The stage pins while
       scrolling; a web of cracks spreads with the scroll, one crack
       at a time, then the glass breaks (once: it stays broken until
       a reload), red light leaks through, the title ignites and the
       beating red hole dissolves everything into red, into the
       Outside page. The crack comes from a fixed seed, so it is the same
       pattern every visit. The song fades in as the section gets
       close; the glass and hum sounds are synthesised.
   ============================================================ */
function otfRandom(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Points from p to q with a little sideways jitter (q included, p not)
function otfJag(r, p, q, step, amp) {
  const dx = q[0] - p[0];
  const dy = q[1] - p[1];
  const L = Math.hypot(dx, dy) || 1;
  const m = Math.max(1, Math.round(L / step));
  const out = [];
  for (let j = 1; j <= m; j++) {
    const t = j / m;
    const o = j < m ? (r() - 0.5) * (L / m) * amp : 0;
    out.push([p[0] + dx * t - (dy / L) * o, p[1] + dy * t + (dx / L) * o]);
  }
  return out;
}

// The broken glass: a hole at the impact, a ring of crushed glass,
// long cracks out to the edges and the panes between them (cells)
function otfBuildMirror(W, H, mobile) {
  const r = otfRandom(2011);
  const TAU = Math.PI * 2;
  const s = Math.min(W, H);
  const cx = W * 0.5;
  const cy = H * 0.64;
  const R = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) * 1.05;
  const r0 = Math.max(s * 0.13, 92);
  const r1 = r0 * 1.9;
  const radii = [r0, r1, r1 * 1.45, r1 * 2.1, r1 * 3, r1 * 4.1].filter((v) => v < R * 0.95);
  radii.push(R);
  const last = radii.length - 1;
  const n = mobile ? 18 : 24;
  const jag = (p, q, step, amp) => otfJag(r, p, q, step, amp);

  const ang = [];
  for (let i = 0; i < n; i++) ang.push((i / n) * TAU + (r() - 0.5) * (TAU / n) * 0.75);
  const pts = ang.map((a) =>
    radii.map((rad, k) => {
      const rr = k === last ? rad : rad * (1 + (r() - 0.5) * (k === 0 ? 0.1 : 0.2));
      const aa = k === last ? a : a + (r() - 0.5) * 0.05;
      return [cx + Math.cos(aa) * rr, cy + Math.sin(aa) * rr];
    })
  );

  const hole = [pts[0][0]];
  for (let i = 1; i <= n; i++) hole.push(...jag(pts[i - 1][0], pts[i % n][0], 14, 0.5));

  const rays = pts.map((row) => {
    const line = [row[0]];
    for (let k = 1; k <= last; k++) line.push(...jag(row[k - 1], row[k], 45, 0.3));
    return { pts: line, w: 0.7 + r() * 0.8, o: 0.6 + r() * 0.4 };
  });

  const rings = [];
  for (let k = 1; k < last; k++) {
    for (let i = 0; i < n; i++) {
      if (!(k === 1 ? r() < 0.5 : r() < 0.25)) continue;
      const p = pts[i][k];
      const q = pts[(i + 1) % n][k];
      const mx = (p[0] + q[0]) / 2;
      const my = (p[1] + q[1]) / 2;
      rings.push({ k, p, q, c: [mx + (cx - mx) * 0.06, my + (cy - my) * 0.06] });
    }
  }

  const forks = [];
  for (let i = 0; i < n; i++) {
    for (let k = 2; k < Math.min(last, 5); k++) {
      if (r() >= 0.32) continue;
      const b = pts[i][k];
      const a = ang[i] + (r() < 0.5 ? -1 : 1) * (0.25 + r() * 0.45);
      const len = (radii[k + 1] - radii[k]) * (0.4 + r() * 0.8);
      forks.push([b, ...jag(b, [b[0] + Math.cos(a) * len, b[1] + Math.sin(a) * len], 40, 0.3)]);
    }
  }

  // A few long cracks that cross the glass on their own
  const chords = [];
  for (let i = 0; i < (mobile ? 4 : 7); i++) {
    const px = r() * W;
    const py = r() * H;
    const a = r() * TAU;
    const p0 = [px - Math.cos(a) * R * 2, py - Math.sin(a) * R * 2];
    const p1 = [px + Math.cos(a) * R * 2, py + Math.sin(a) * R * 2];
    chords.push([p0, ...jag(p0, p1, 70, 0.12)]);
  }

  // The crushed ring: micro cracks, fragments and glints
  const inRing = (bias) => {
    const a = r() * TAU;
    const t = Math.pow(r(), bias);
    const rr = r0 + (r1 - r0) * t * 1.06;
    return { a, t, x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr };
  };
  const micro = [];
  for (let i = 0; i < (mobile ? 260 : 460); i++) {
    const p = inRing(1.3);
    const dir = p.a + (r() < 0.6 ? (r() - 0.5) * 0.6 : Math.PI / 2 + (r() - 0.5) * 0.8);
    const len = 5 + r() * 28;
    micro.push({ x: p.x, y: p.y, x2: p.x + Math.cos(dir) * len, y2: p.y + Math.sin(dir) * len, o: (0.25 + r() * 0.55) * (1 - p.t * 0.5) });
  }
  const frags = [];
  for (let i = 0; i < (mobile ? 700 : 1500); i++) {
    const p = inRing(1.7);
    const sz = 2 + r() * 12 * (1 - p.t * 0.5);
    const tri = [];
    for (let v = 0; v < 3; v++) {
      const av = r() * TAU;
      const d = sz * (0.4 + r() * 0.6);
      tri.push([p.x + Math.cos(av) * d, p.y + Math.sin(av) * d]);
    }
    frags.push({ pts: tri, x: p.x, y: p.y, o: (0.95 - p.t * 0.7) * (0.2 + r() * 0.8), lit: r() });
  }
  const glints = [];
  for (let i = 0; i < (mobile ? 40 : 80); i++) {
    const p = inRing(2.2);
    glints.push({ x: p.x, y: p.y, s: 2 + r() * 6, o: 0.4 + r() * 0.6, hue: r() });
  }
  const specks = [];
  for (let i = 0; i < (mobile ? 110 : 220); i++) {
    let x;
    let y;
    if (r() < 0.55) {
      const a = r() * TAU;
      const d = r1 + Math.pow(r(), 1.5) * s * 0.5;
      x = cx + Math.cos(a) * d;
      y = cy + Math.sin(a) * d;
    } else {
      x = r() * W;
      y = r() * H;
    }
    specks.push({ x, y, s: 0.4 + r() * 1.4, o: 0.15 + r() * 0.6 });
  }

  // The panes between the long cracks and the rings
  const cells = [];
  for (let k = 0; k < last; k++) {
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const quad = [pts[i][k], pts[i][k + 1], pts[j][k + 1], pts[j][k]];
      const gx = (quad[0][0] + quad[1][0] + quad[2][0] + quad[3][0]) / 4;
      const gy = (quad[0][1] + quad[1][1] + quad[2][1] + quad[3][1]) / 4;
      cells.push({ pts: quad, gx, gy, dist: Math.hypot(gx - cx, gy - cy) / R, tint: r() < 0.5 ? r() * 0.03 : 0, rnd: [r(), r(), r(), r(), r(), r()] });
    }
  }

  // The web that spreads with the scroll, before the hit: spokes out
  // from the centre one by one (from the top, going round), then the
  // rings and forks from the inside out, the long cracks last.
  // start/dur are in steps; webEnd is the last one. (Built last so the
  // seeded pattern above stays the same.)
  const web = [];
  const top = Math.round(n * 0.75);
  for (let j = 0; j < n; j++) {
    const ray = rays[(top + j) % n];
    web.push({ pts: [[cx, cy], ...jag([cx, cy], ray.pts[0], 18, 0.35), ...ray.pts.slice(1)], w: ray.w, o: ray.o, start: j * 0.5, dur: 1.8 });
  }
  const curve = (g) => Array.from({ length: 9 }, (_, j) => {
    const t = j / 8;
    const u = 1 - t;
    return [u * u * g.p[0] + 2 * u * t * g.c[0] + t * t * g.q[0], u * u * g.p[1] + 2 * u * t * g.c[1] + t * t * g.q[1]];
  });
  const threads = [
    ...rings.map((g) => ({ pts: curve(g), w: g.k === 1 ? 0.9 : 0.7, o: g.k === 1 ? 0.4 : 0.24 })),
    ...forks.map((pts) => ({ pts, w: 0.6, o: 0.38 })),
  ].map((s) => ({ ...s, d: Math.hypot(s.pts[0][0] - cx, s.pts[0][1] - cy) + r() * s * 0.08 }));
  threads.sort((a, b) => a.d - b.d);
  const t0 = n * 0.5 + 0.6;
  threads.forEach((s, j) => web.push({ pts: s.pts, w: s.w, o: s.o, start: t0 + j * 0.16, dur: 0.7 }));
  const t1 = t0 + threads.length * 0.16 + 0.4;
  chords.forEach((pts, j) => web.push({ pts, w: 0.6, o: 0.2, start: t1 + j * 0.55, dur: 1.4 }));
  web.forEach((s, j) => { s.seed = j * 2.37; });
  const webEnd = Math.max(...web.map((s) => s.start + s.dur));

  return { W, H, cx, cy, R, r0, r1, hole, rays, rings, forks, chords, micro, frags, glints, specks, cells, web, webEnd };
}

// Another hole, punched wherever the broken glass is clicked: a smaller
// hit (hole, crushed ring, short cracks that stop where they like),
// shaped like the mirror so the same draw functions take it
function otfBuildHole(cx, cy, r0, seed, mobile) {
  const r = otfRandom(seed);
  const TAU = Math.PI * 2;
  const jag = (p, q, step, amp) => otfJag(r, p, q, step, amp);
  const r1 = r0 * 1.9;
  const R = r0 * 5;
  const radii = [r0, r1, r1 * 1.5, r1 * 2.1, R];
  const n = mobile ? 11 : 14;

  const ang = [];
  for (let i = 0; i < n; i++) ang.push((i / n) * TAU + (r() - 0.5) * (TAU / n) * 0.75);
  const pts = ang.map((a) =>
    radii.map((rad, k) => {
      const rr = rad * (1 + (r() - 0.5) * (k === 0 ? 0.1 : 0.25));
      const aa = a + (r() - 0.5) * 0.08;
      return [cx + Math.cos(aa) * rr, cy + Math.sin(aa) * rr];
    })
  );
  const reach = pts.map(() => 2 + Math.floor(r() * 3));

  const hole = [pts[0][0]];
  for (let i = 1; i <= n; i++) hole.push(...jag(pts[i - 1][0], pts[i % n][0], 10, 0.5));

  const rays = pts.map((row, i) => {
    const line = [row[0]];
    for (let k = 1; k <= reach[i]; k++) line.push(...jag(row[k - 1], row[k], 30, 0.3));
    return { pts: line, w: 0.6 + r() * 0.7, o: 0.5 + r() * 0.4 };
  });

  const rings = [];
  for (let k = 1; k <= 2; k++) {
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      if (reach[i] < k || reach[j] < k || r() >= (k === 1 ? 0.55 : 0.3)) continue;
      const p = pts[i][k];
      const q = pts[j][k];
      const mx = (p[0] + q[0]) / 2;
      const my = (p[1] + q[1]) / 2;
      rings.push({ k, p, q, c: [mx + (cx - mx) * 0.06, my + (cy - my) * 0.06] });
    }
  }

  const forks = [];
  for (let i = 0; i < n; i++) {
    if (reach[i] < 3 || r() >= 0.4) continue;
    const b = pts[i][2];
    const a = ang[i] + (r() < 0.5 ? -1 : 1) * (0.25 + r() * 0.45);
    const len = (radii[3] - radii[2]) * (0.4 + r() * 0.7);
    forks.push([b, ...jag(b, [b[0] + Math.cos(a) * len, b[1] + Math.sin(a) * len], 28, 0.3)]);
  }

  const inRing = (bias) => {
    const a = r() * TAU;
    const t = Math.pow(r(), bias);
    const rr = r0 + (r1 - r0) * t * 1.06;
    return { a, t, x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr };
  };
  const micro = [];
  for (let i = 0; i < (mobile ? 70 : 130); i++) {
    const p = inRing(1.3);
    const dir = p.a + (r() < 0.6 ? (r() - 0.5) * 0.6 : Math.PI / 2 + (r() - 0.5) * 0.8);
    const len = 4 + r() * 14;
    micro.push({ x: p.x, y: p.y, x2: p.x + Math.cos(dir) * len, y2: p.y + Math.sin(dir) * len, o: (0.25 + r() * 0.55) * (1 - p.t * 0.5) });
  }
  const frags = [];
  for (let i = 0; i < (mobile ? 200 : 380); i++) {
    const p = inRing(1.7);
    const sz = 1.5 + r() * 7 * (1 - p.t * 0.5);
    const tri = [];
    for (let v = 0; v < 3; v++) {
      const av = r() * TAU;
      const d = sz * (0.4 + r() * 0.6);
      tri.push([p.x + Math.cos(av) * d, p.y + Math.sin(av) * d]);
    }
    frags.push({ pts: tri, x: p.x, y: p.y, o: (0.95 - p.t * 0.7) * (0.2 + r() * 0.8), lit: r() });
  }
  const glints = [];
  for (let i = 0; i < (mobile ? 10 : 20); i++) {
    const p = inRing(2.2);
    glints.push({ x: p.x, y: p.y, s: 2 + r() * 4, o: 0.4 + r() * 0.6, hue: r() });
  }
  const specks = [];
  for (let i = 0; i < 40; i++) {
    const a = r() * TAU;
    const d = r1 + Math.pow(r(), 1.5) * r0 * 3;
    specks.push({ x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, s: 0.4 + r() * 1.1, o: 0.15 + r() * 0.5 });
  }

  return { cx, cy, R, r0, r1, hole, rays, rings, forks, chords: [], cells: [], micro, frags, glints, specks };
}

function otfPath(ctx, pts, close) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if (close) ctx.closePath();
}

// The first f (0 -> 1) of a line, by length
function otfPartial(pts, f) {
  if (f >= 1) return pts;
  let left = 0;
  for (let i = 1; i < pts.length; i++) left += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  left *= f;
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const d = Math.hypot(x1 - x0, y1 - y0);
    if (d >= left) {
      const t = d ? left / d : 0;
      out.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]);
      break;
    }
    out.push(pts[i]);
    left -= d;
  }
  return out;
}

// A crack: soft halo, a dark bevel just below, then a bright edge
// whose brightness changes along its length as it catches the light
function otfCrack(ctx, m, pts, w, o, seed) {
  const s = seed === undefined ? pts[0][0] * 0.13 : seed;
  otfPath(ctx, pts);
  ctx.strokeStyle = `rgba(200, 215, 255, ${o * 0.1})`;
  ctx.lineWidth = w * 4;
  ctx.stroke();
  ctx.save();
  ctx.translate(0.8, 0.9);
  otfPath(ctx, pts);
  ctx.strokeStyle = "rgba(0, 0, 0, .55)";
  ctx.lineWidth = w;
  ctx.stroke();
  ctx.restore();
  ctx.lineWidth = w;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - m.cx, pts[i][1] - m.cy) / m.R;
    const shimmer = 0.55 + 0.45 * Math.abs(Math.sin(i * 1.7 + s));
    ctx.beginPath();
    ctx.moveTo(pts[i - 1][0], pts[i - 1][1]);
    ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.strokeStyle = `rgba(255, 255, 255, ${o * shimmer * (1 - 0.35 * Math.min(1, d))})`;
    ctx.stroke();
  }
}

// The long cracks after the hit, drawn once into an offscreen layer
function otfDrawWeb(ctx, m) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Each pane sits at a slightly different angle
  m.cells.forEach((c) => {
    if (!c.tint) return;
    otfPath(ctx, c.pts, true);
    ctx.fillStyle = `rgba(190, 205, 255, ${c.tint})`;
    ctx.fill();
  });

  m.chords.forEach((pts) => otfCrack(ctx, m, pts, 0.6, 0.2));
  m.forks.forEach((pts) => otfCrack(ctx, m, pts, 0.6, 0.38));
  m.rings.forEach((g) => {
    const o = g.k === 1 ? 0.4 : 0.24;
    ctx.beginPath();
    ctx.moveTo(g.p[0], g.p[1]);
    ctx.quadraticCurveTo(g.c[0], g.c[1], g.q[0], g.q[1]);
    ctx.strokeStyle = `rgba(255, 255, 255, ${o})`;
    ctx.lineWidth = g.k === 1 ? 0.9 : 0.7;
    ctx.stroke();
  });
  m.rays.forEach((ray) => otfCrack(ctx, m, ray.pts, ray.w, ray.o));
}

// The hit itself: the hole, the crushed ring and the dust, its own layer
function otfDrawImpact(ctx, m) {
  const TAU = Math.PI * 2;
  const path = (pts, close) => otfPath(ctx, pts, close);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Through the hole: dark, so the red behind glows deep, not dusty
  path(m.hole, true);
  ctx.fillStyle = "rgba(3, 1, 3, .94)";
  ctx.fill();

  // Frosted, pulverised glass in the ring
  const frost = ctx.createRadialGradient(m.cx, m.cy, m.r0, m.cx, m.cy, m.r1 * 1.12);
  frost.addColorStop(0, "rgba(235, 240, 255, .34)");
  frost.addColorStop(0.35, "rgba(220, 228, 255, .14)");
  frost.addColorStop(1, "rgba(220, 228, 255, 0)");
  ctx.fillStyle = frost;
  ctx.beginPath();
  ctx.arc(m.cx, m.cy, m.r1 * 1.12, 0, TAU);
  ctx.moveTo(m.hole[0][0], m.hole[0][1]);
  for (let i = 1; i < m.hole.length; i++) ctx.lineTo(m.hole[i][0], m.hole[i][1]);
  ctx.closePath();
  ctx.fill("evenodd");

  // Crushed glass
  ctx.lineWidth = 0.7;
  m.micro.forEach((l) => {
    ctx.beginPath();
    ctx.moveTo(l.x, l.y);
    ctx.lineTo(l.x2, l.y2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${l.o})`;
    ctx.stroke();
  });
  ctx.lineWidth = 0.5;
  m.frags.forEach((f) => {
    path(f.pts, true);
    if (f.lit > 0.82) {
      // A facet turned to the light: bright on one side, dark on the other
      const g = ctx.createLinearGradient(f.pts[0][0], f.pts[0][1], f.pts[2][0], f.pts[2][1]);
      g.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, f.o + 0.3)})`);
      g.addColorStop(1, "rgba(150, 165, 200, .05)");
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = `rgba(235, 240, 255, ${f.o * 0.85})`;
    }
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, f.o + 0.3)})`;
    ctx.stroke();
  });

  // Edge of the hole
  path(m.hole, true);
  ctx.strokeStyle = "rgba(0, 0, 0, .6)";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 255, 255, .8)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Glints, a few with a prismatic tint
  ctx.save();
  ctx.shadowBlur = 8;
  m.glints.forEach((g) => {
    const tint = g.hue < 0.15 ? "190, 225, 255" : g.hue < 0.25 ? "255, 205, 240" : "255, 255, 255";
    ctx.shadowColor = `rgba(${tint}, 1)`;
    ctx.strokeStyle = `rgba(${tint}, ${g.o})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(g.x - g.s, g.y);
    ctx.lineTo(g.x + g.s, g.y);
    ctx.moveTo(g.x, g.y - g.s);
    ctx.lineTo(g.x, g.y + g.s);
    ctx.stroke();
    ctx.fillStyle = `rgba(${tint}, ${g.o})`;
    ctx.beginPath();
    ctx.arc(g.x, g.y, 1.1, 0, TAU);
    ctx.fill();
  });
  ctx.restore();

  m.specks.forEach((p) => {
    ctx.fillStyle = `rgba(255, 255, 255, ${p.o})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.s, 0, TAU);
    ctx.fill();
  });
}

// Painted textures for the Upside Down look (images/otf), filled in as
// they load; initOutsideFrame redraws the glow when one arrives.
// vines: a ring of glowing roots, its ring at OTF_VINE_R of its width
const otfTex = { vines: null, tissue: null };
const OTF_VINE_R = 0.284;

// Only the vine ring, done once at load: its dark middle cut out (the
// hole's own light shows there) and its outside faded to nothing
function otfMaskVines(img) {
  const n = img.naturalWidth;
  const c = document.createElement("canvas");
  c.width = c.height = n;
  const x = c.getContext("2d");
  x.drawImage(img, 0, 0);
  x.globalCompositeOperation = "destination-in";
  const g = x.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n * 0.5);
  g.addColorStop(0.44, "rgba(0, 0, 0, 0)");
  g.addColorStop(0.52, "#000");
  g.addColorStop(0.6, "#000");
  g.addColorStop(1, "rgba(0, 0, 0, 0)");
  x.fillStyle = g;
  x.fillRect(0, 0, n, n);
  return c;
}

// The hole's own jagged outline as a CSS polygon, relative to its link
// (a square of --ir * 2.2 centred on the hole), so the gate inside fills
// it edge to edge instead of sitting in a circle
function otfHoleClip(m) {
  const side = m.r0 * 0.98 * 2.2;
  const pt = ([x, y]) => `${(50 + ((x - m.cx) / side) * 100).toFixed(2)}% ${(50 + ((y - m.cy) / side) * 100).toFixed(2)}%`;
  return `polygon(${m.hole.map(pt).join(", ")})`;
}

// Corners cut twice (Chaikin): a glass crack becomes a living line
function otfSoften(pts) {
  let p = pts;
  for (let k = 0; k < 2; k++) {
    const out = [p[0]];
    for (let i = 0; i < p.length - 1; i++) {
      const [x0, y0] = p[i];
      const [x1, y1] = p[i + 1];
      out.push([x0 * 0.75 + x1 * 0.25, y0 * 0.75 + y1 * 0.25], [x0 * 0.25 + x1 * 0.75, y0 * 0.25 + y1 * 0.75]);
    }
    out.push(p[p.length - 1]);
    p = out;
  }
  return p;
}

// The red light behind the glass, showing through the hole and cracks:
// Vecna's vines gripping the hole, veins of tissue growing out along
// the cracks, thick at the hole and thinning to a thread
function otfDrawGlow(ctx, m) {
  const TAU = Math.PI * 2;
  const path = (pts, close) => {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    if (close) ctx.closePath();
  };
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // A deep, dim opening, not a lit disc: the gate inside is half-seen
  const hole = ctx.createRadialGradient(m.cx, m.cy, 0, m.cx, m.cy, m.r0 * 1.05);
  hole.addColorStop(0, "rgba(150, 22, 24, .7)");
  hole.addColorStop(0.5, "rgba(80, 8, 12, .6)");
  hole.addColorStop(1, "rgba(30, 2, 4, .5)");
  path(m.hole, true);
  ctx.fillStyle = hole;
  ctx.fill();

  const ring = ctx.createRadialGradient(m.cx, m.cy, m.r0, m.cx, m.cy, m.r1 * 1.6);
  ring.addColorStop(0, "rgba(255, 60, 45, .38)");
  ring.addColorStop(0.4, "rgba(220, 30, 35, .16)");
  ring.addColorStop(1, "rgba(200, 20, 30, 0)");
  ctx.fillStyle = ring;
  ctx.beginPath();
  ctx.arc(m.cx, m.cy, m.r1 * 1.6, 0, TAU);
  ctx.fill();

  // The vines, their glowing ring just outside the hole's edge
  if (otfTex.vines) {
    const s = (m.r0 * 1.14) / OTF_VINE_R;
    ctx.drawImage(otfTex.vines, m.cx - s / 2, m.cy - s / 2, s, s);
  }

  // Veins, each one filled shape (no overlapping strokes, so no beads):
  // a red bloom, the tissue, then a hot core that cools away from the hole
  const tissue = otfTex.tissue ? ctx.createPattern(otfTex.tissue, "repeat") : null;
  const fade = (a0, a1, rgb) => {
    const g = ctx.createRadialGradient(m.cx, m.cy, m.r0, m.cx, m.cy, m.R * 0.9);
    g.addColorStop(0, `rgba(${rgb}, ${a0})`);
    g.addColorStop(1, `rgba(${rgb}, ${a1})`);
    return g;
  };
  const bloom = fade(0.7, 0.1, "165, 14, 22");
  const core = fade(0.85, 0.08, "255, 100, 70");
  const ribbon = (pts, nrm, ws, k) => {
    ctx.beginPath();
    pts.forEach(([x, y], i) => ctx.lineTo(x + nrm[i][0] * ws[i] * k, y + nrm[i][1] * ws[i] * k));
    for (let i = pts.length - 1; i >= 0; i--) ctx.lineTo(pts[i][0] - nrm[i][0] * ws[i] * k, pts[i][1] - nrm[i][1] * ws[i] * k);
    ctx.closePath();
    ctx.fill();
  };
  const vein = (raw, w0, wander, phase, tip = 0.5) => {
    let pts = otfSoften(raw);
    const at = [0];
    for (let i = 1; i < pts.length; i++) at.push(at[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const total = at[at.length - 1] || 1;
    const normal = (p, i) => {
      const a = p[Math.max(0, i - 1)];
      const b = p[Math.min(p.length - 1, i + 1)];
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      return [-(b[1] - a[1]) / l, (b[0] - a[0]) / l];
    };
    // Off the straight crack: it snakes, more the further it grows
    if (wander) {
      const nrm0 = pts.map((_, i) => normal(pts, i));
      pts = pts.map(([x, y], i) => {
        const d = at[i];
        const o = Math.sin(d / wander.period + phase) * wander.amp * Math.min(1, d / (m.r0 * 1.5));
        return [x + nrm0[i][0] * o, y + nrm0[i][1] * o];
      });
    }
    const nrm = pts.map((_, i) => normal(pts, i));
    const ws = at.map((d) => w0 * Math.pow(1 - d / total, 1.5) + tip);
    ctx.shadowBlur = 12;
    ctx.fillStyle = bloom;
    ribbon(pts, nrm, ws.map((w) => w + 3), 0.5);
    ctx.shadowBlur = 0;
    ctx.fillStyle = tissue || "rgba(110, 14, 20, .9)";
    ribbon(pts, nrm, ws, 0.5);
    ctx.fillStyle = core;
    ribbon(pts, nrm, ws, 0.14);
    return { pts, at, total, ws };
  };

  ctx.save();
  ctx.shadowColor = "rgba(255, 30, 25, .85)";
  const r = otfRandom(Math.round(m.cx * 7 + m.cy * 13));
  const w0 = Math.max(3, m.r0 * 0.17);
  const thin = [];
  m.rays.forEach((ray) => {
    // Not every crack carries a vein, and no two are the same thickness
    if (r() < 0.3) { thin.push(ray); return; }
    const wander = { amp: m.r0 * (0.06 + r() * 0.12), period: m.r0 * (0.5 + r() * 0.7) };
    const v = vein(ray.pts, w0 * (0.4 + r() * 0.9), wander, r() * TAU);
    // A tendril or two curling off, near the hole
    for (let b = 0; b < 2; b++) {
      if (b && r() < 0.5) break;
      const t = 0.1 + r() * 0.4;
      const i = Math.max(1, v.at.findIndex((d) => d >= t * v.total));
      const [x0, y0] = v.pts[i - 1];
      const [x1, y1] = v.pts[i];
      const side = r() < 0.5 ? -1 : 1;
      const base = Math.atan2(y1 - y0, x1 - x0);
      const dev = 0.6 + r() * 0.5;
      const a = base + side * dev;
      const len = m.r0 * (0.35 + r() * 0.7);
      // Hooks back toward the vein's line, like a root feeling for a grip,
      // but never past it, so it can't cross back over its own vein
      const bend = base + side * dev * (0.15 + r() * 0.35);
      const c = [x1 + Math.cos(a) * len * 0.6, y1 + Math.sin(a) * len * 0.6];
      const e = [c[0] + Math.cos(bend) * len * 0.55, c[1] + Math.sin(bend) * len * 0.55];
      const curl = Array.from({ length: 9 }, (_, j) => {
        const u = j / 8;
        const k = 1 - u;
        return [k * k * x1 + 2 * k * u * c[0] + u * u * e[0], k * k * y1 + 2 * k * u * c[1] + u * u * e[1]];
      });
      vein(curl, v.ws[i] * 0.55, null, 0, 0.15);
    }
  });

  ctx.shadowColor = "rgba(255, 40, 30, .9)";
  ctx.shadowBlur = 9;
  ctx.lineWidth = 1.1;
  // The cracks without a vein just let the red light through
  ctx.strokeStyle = "rgba(255, 60, 45, .42)";
  thin.forEach((ray) => {
    path(ray.pts);
    ctx.stroke();
  });
  ctx.strokeStyle = "rgba(255, 60, 45, .26)";
  m.rings.forEach((g) => {
    if (g.k !== 1) return;
    ctx.beginPath();
    ctx.moveTo(g.p[0], g.p[1]);
    ctx.quadraticCurveTo(g.c[0], g.c[1], g.q[0], g.q[1]);
    ctx.stroke();
  });
  ctx.shadowBlur = 18;
  ctx.strokeStyle = "rgba(255, 90, 70, .3)";
  ctx.lineWidth = 2;
  path(m.hole, true);
  ctx.stroke();
  ctx.restore();
}

// Broken glass still in the frame around a hole: rings of shards between
// short spokes, reaching out unevenly so the edge is ragged, not a ring.
// t is how far out the shard sits (0 at the hole), a/b pick its look
function otfShardRing(m, seed) {
  const r = otfRandom(seed);
  const TAU = Math.PI * 2;
  const n = Math.max(14, Math.round(m.r0 / 3.5));
  const bands = [0.88, 1.1, 1.34, 1.6, 1.92, 2.3];
  const ang = Array.from({ length: n }, (_, i) => (i / n) * TAU + (r() - 0.5) * (TAU / n) * 0.6);
  const reach = ang.map(() => 2 + Math.floor(r() * 4));
  const P = ang.map((a) => bands.map((b, k) => {
    const rr = m.r0 * b * (k ? 1 + (r() - 0.5) * 0.18 : 1);
    const aa = a + (r() - 0.5) * 0.14;
    return [m.cx + Math.cos(aa) * rr, m.cy + Math.sin(aa) * rr];
  }));
  const shards = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const top = Math.min(reach[i], reach[j]);
    for (let k = 0; k < top; k++) {
      const q = [P[i][k], P[i][k + 1], P[j][k + 1], P[j][k]];
      // Most panes split once more, corner to corner
      const parts = r() < 0.6
        ? (r() < 0.5 ? [[q[0], q[1], q[2]], [q[0], q[2], q[3]]] : [[q[0], q[1], q[3]], [q[1], q[2], q[3]]])
        : [q];
      parts.forEach((pts) => shards.push({ pts, t: k / (bands.length - 2), a: r(), b: r() }));
    }
  }
  return shards;
}

// The shards over the hole's rim: red light in the gaps between them,
// each one smoked glass with a facet catching white or red, a cut edge,
// fading out toward the clear glass
function otfDrawShards(ctx, m, seed) {
  const shards = otfShardRing(m, seed);
  ctx.lineJoin = "round";
  ctx.save();
  ctx.shadowColor = "rgba(255, 40, 30, .9)";
  ctx.shadowBlur = 6;
  ctx.strokeStyle = "rgba(255, 70, 50, .6)";
  ctx.lineWidth = 1.6;
  shards.forEach((s) => {
    ctx.globalAlpha = 1 - s.t * 0.7;
    otfPath(ctx, s.pts, true);
    ctx.stroke();
  });
  ctx.restore();

  shards.forEach((s) => {
    const gx = s.pts.reduce((v, p) => v + p[0], 0) / s.pts.length;
    const gy = s.pts.reduce((v, p) => v + p[1], 0) / s.pts.length;
    const pts = s.pts.map(([x, y]) => [x + (gx - x) * 0.06, y + (gy - y) * 0.06]);
    const fade = 1 - s.t * 0.75;
    otfPath(ctx, pts, true);
    ctx.fillStyle = `rgba(10, 12, 20, ${(0.84 * fade).toFixed(3)})`;
    ctx.fill();
    const [p0, p1] = [pts[0], pts[pts.length - 1 - (s.b < 0.5 ? 0 : 1)]];
    const g = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
    const tint = s.a > 0.78 ? `255, 255, 255, ${0.22 * fade}` : s.a > 0.42 ? `255, 60, 45, ${0.22 * fade}` : `220, 228, 255, ${0.06 * fade}`;
    g.addColorStop(0, `rgba(${tint})`);
    g.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 255, 255, ${((0.3 + s.b * 0.4) * fade).toFixed(3)})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  });

  // The broken edge right at the hole, lit from inside
  otfPath(ctx, m.hole, true);
  ctx.save();
  ctx.shadowColor = "rgba(255, 50, 35, .9)";
  ctx.shadowBlur = 10;
  ctx.strokeStyle = "rgba(255, 130, 110, .7)";
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();
}

/* ---------- The rift: the section's second take ----------
   Picked at random on load instead of the mirror. A photograph of a
   burning tear in the ground (images/otf/rift-close.webp): it heats up
   with the scroll (--heat, styles.css), erupts, embers rise off it, and
   its white-hot core is the way in. */

// The tear on the photograph, as shares of it (top to bottom), and its
// white-hot core (the way in). Keep in step if the photograph changes
const OTF_RIFT = {
  crack: [[0.48, 0], [0.49, 0.15], [0.47, 0.25], [0.49, 0.38], [0.5, 0.5], [0.5, 0.6], [0.49, 0.7], [0.52, 0.8], [0.52, 0.9], [0.49, 1]],
  core: [0.505, 0.53],
};

// Shaped like the mirror where the shared code reads it (cx, cy, r0,
// r1, R, hole); crack is the tear on screen. The photograph is square
// and drawn "cover", so it is mapped through the same crop
function otfBuildRift(W, H) {
  const k = Math.max(W, H);
  const map = ([u, v]) => [W / 2 + (u - 0.5) * k, H / 2 + (v - 0.5) * k];
  const [cx, cy] = map(OTF_RIFT.core);
  const r0 = Math.max(Math.min(W, H) * 0.13, 92);
  const hole = [[cx, cy - r0 * 0.9], [cx + r0 * 0.3, cy], [cx, cy + r0 * 0.9], [cx - r0 * 0.3, cy]];
  return { W, H, cx, cy, r0, r1: r0 * 1.9, R: Math.hypot(W, H), hole, crack: OTF_RIFT.crack.map(map), rift: true };
}

// A point somewhere along the tear, more often near the core
function otfOnCrack(m) {
  const c = m.crack;
  const t = Math.random() < 0.6 ? (Math.random() + Math.random()) / 2 : Math.random();
  const f = t * (c.length - 1);
  const i = Math.min(c.length - 2, Math.floor(f));
  const u = f - i;
  return [c[i][0] + (c[i + 1][0] - c[i][0]) * u, c[i][1] + (c[i + 1][1] - c[i][1]) * u];
}

// The song on a crossfaded loop: a second copy starts under the last
// held note and takes over, so the seam never dips or cuts. Stands in
// for an Audio element (play, pause, paused, volume, muted, currentTime);
// the mix updates whenever the volume is set, i.e. every frame
function otfLooper(src, onError) {
  const XF = 2.5;
  const tracks = [0, 1].map(() => {
    const a = new Audio();
    a.preload = "auto";
    if (onError) a.addEventListener("error", onError);
    a.src = src;
    return a;
  });
  let cur = 0;
  let level = 0;
  let paused = true;
  let primed = false;
  let seeking = null;

  const mix = () => {
    let a = tracks[cur];
    let b = tracks[1 - cur];
    let x = 1;
    const d = a.duration;
    if (!paused && d && Number.isFinite(d)) {
      let left = d - a.currentTime;
      if (a.ended || left < 0.05) {
        a.pause();
        if (b.paused) {
          // The second copy never got going (autoplay rules): plain loop
          a.currentTime = 0;
          a.play().catch(() => {});
        } else {
          cur = 1 - cur;
          [a, b] = [b, a];
        }
        left = d - a.currentTime;
      } else if (left < XF && b.paused) {
        b.currentTime = XF - left;
        b.play().catch(() => {});
      }
      if (!b.paused) x = Math.max(0, Math.min(1, left / XF));
    }
    // Equal power, so the overlap doesn't swell or sag
    a.volume = level * Math.sin((x * Math.PI) / 2);
    b.volume = level * Math.cos((x * Math.PI) / 2);
  };
  tracks.forEach((t) => t.addEventListener("ended", mix));

  return {
    get paused() { return paused; },
    get currentTime() { return tracks[cur].currentTime; },
    set currentTime(t) {
      const a = tracks[cur];
      const seek = () => { a.currentTime = t % a.duration; };
      if (a.readyState >= 1) seek();
      else seeking = new Promise((res) => a.addEventListener("loadedmetadata", () => { seek(); seeking = null; res(); }, { once: true }));
    },
    get volume() { return level; },
    set volume(v) { level = v; mix(); },
    set muted(m) { tracks.forEach((t) => { t.muted = m; }); },
    play() {
      paused = false;
      const b = tracks[1 - cur];
      // iOS lets an element play later only if it played inside a gesture,
      // so wake the second copy too and park it straight away
      if (!primed) {
        primed = true;
        b.muted = true;
        b.play().then(() => { b.pause(); b.muted = tracks[cur].muted; }).catch(() => { b.muted = tracks[cur].muted; });
      }
      // Start only once a pending seek lands, so the opening bar never
      // blips out first (play stays synchronous otherwise, for iOS)
      // (and not at all if it was paused while waiting)
      const go = () => (paused ? Promise.resolve() : tracks[cur].play().then(mix));
      return seeking ? seeking.then(go) : go();
    },
    pause() {
      paused = true;
      tracks.forEach((t) => t.pause());
    },
  };
}

// Synthesised glass and hum (no audio files needed)
function otfSynth(ac) {
  const out = ac.createGain();
  out.gain.value = 0.8;
  out.connect(ac.destination);
  const noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  const burst = (at, dur, freq, type, gain) => {
    const src = ac.createBufferSource();
    src.buffer = noise;
    const f = ac.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const g = ac.createGain();
    g.gain.setValueAtTime(gain, at);
    g.gain.exponentialRampToValueAtTime(0.001, at + dur);
    src.connect(f).connect(g).connect(out);
    src.start(at);
    src.stop(at + dur);
  };
  const thump = (at, gain) => {
    const o = ac.createOscillator();
    o.frequency.setValueAtTime(72, at);
    o.frequency.exponentialRampToValueAtTime(30, at + 0.6);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(gain, at + 0.008);
    g.gain.exponentialRampToValueAtTime(0.001, at + 0.75);
    o.connect(g).connect(out);
    o.start(at);
    o.stop(at + 0.8);
  };
  const tinkles = (at, count, spread) => {
    for (let i = 0; i < count; i++) {
      const t = at + Math.pow(Math.random(), 1.6) * spread;
      const o = ac.createOscillator();
      o.frequency.value = 2800 + Math.random() * 5200;
      const g = ac.createGain();
      const dur = 0.05 + Math.random() * 0.2;
      g.gain.setValueAtTime(0.03 + Math.random() * 0.08, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + dur);
    }
  };

  let hum = null;
  return {
    // One crack running through the glass, while the web spreads
    tick() {
      const t = ac.currentTime;
      burst(t, 0.05, 3000 + Math.random() * 2600, "bandpass", 0.12);
      tinkles(t + 0.01, 2, 0.08);
    },
    impact() {
      const t = ac.currentTime;
      thump(t, 0.9);
      burst(t, 0.22, 1800, "highpass", 0.7);
      burst(t + 0.01, 0.12, 4200, "bandpass", 0.5);
      tinkles(t + 0.04, 18, 0.7);
    },
    // A smaller hit: another hole punched in the broken glass
    knock() {
      const t = ac.currentTime;
      thump(t, 0.45);
      burst(t, 0.14, 2200, "highpass", 0.4);
      burst(t + 0.01, 0.08, 4600, "bandpass", 0.25);
      tinkles(t + 0.03, 8, 0.4);
    },
    // The rift: earth giving way as the tear runs, then the ground splits
    grind() {
      const t = ac.currentTime;
      burst(t, 0.09, 260 + Math.random() * 300, "bandpass", 0.35);
      burst(t + 0.02, 0.05, 1400 + Math.random() * 800, "bandpass", 0.06);
    },
    quake() {
      const t = ac.currentTime;
      thump(t, 1);
      thump(t + 0.09, 0.6);
      burst(t, 1.8, 140, "lowpass", 0.9);
      burst(t, 0.3, 700, "bandpass", 0.4);
    },
    // Whoosh into the red, as you step inside
    whoosh() {
      const t = ac.currentTime;
      const src = ac.createBufferSource();
      src.buffer = noise;
      src.loop = true;
      const f = ac.createBiquadFilter();
      f.type = "lowpass";
      // ...then settles into a low rumble that carries through the red
      f.frequency.setValueAtTime(180, t);
      f.frequency.exponentialRampToValueAtTime(4200, t + 1.1);
      f.frequency.exponentialRampToValueAtTime(320, t + 3.2);
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.5, t + 1);
      g.gain.exponentialRampToValueAtTime(0.14, t + 2.2);
      g.gain.exponentialRampToValueAtTime(0.001, t + 3.3);
      src.connect(f).connect(g).connect(out);
      src.start(t);
      src.stop(t + 3.35);
    },
    // Low electrical hum while the neon is on; level follows proximity
    hum(level) {
      if (!hum) {
        if (level <= 0) return;
        const g = ac.createGain();
        g.gain.value = 0;
        const f = ac.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.value = 380;
        [55, 110.4].forEach((hz) => {
          const o = ac.createOscillator();
          o.type = "sawtooth";
          o.frequency.value = hz;
          o.connect(f);
          o.start();
        });
        f.connect(g).connect(out);
        hum = g;
      }
      hum.gain.setTargetAtTime(level, ac.currentTime, 0.15);
    },
    // A slice of a recorded sound, faded out over its last 1.5s
    clip(buf, from, dur, gain) {
      const t = ac.currentTime;
      const src = ac.createBufferSource();
      src.buffer = buf;
      const g = ac.createGain();
      g.gain.setValueAtTime(gain, t);
      g.gain.setValueAtTime(gain, t + dur - 1.5);
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      src.connect(g).connect(out);
      src.start(t, from, dur);
    },
    // Lub-dub of the red hole, in time with its CSS heartbeat
    heartbeat(level, gap) {
      const t = ac.currentTime;
      [[0, 1], [gap, 0.7]].forEach(([d, k]) => {
        const at = t + d;
        const o = ac.createOscillator();
        o.frequency.setValueAtTime(62, at);
        o.frequency.exponentialRampToValueAtTime(36, at + 0.16);
        const g = ac.createGain();
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, level * k), at + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);
        o.connect(g).connect(out);
        o.start(at);
        o.stop(at + 0.25);
      });
    },
  };
}

function initOutsideFrame() {
  const root = document.querySelector("[data-otf]");
  if (!root) return;
  const stage = root.querySelector("[data-otf-stage]");
  const scene = root.querySelector("[data-otf-scene]");
  const crackCanvas = root.querySelector("[data-otf-cracks]");
  const glowCanvas = root.querySelector("[data-otf-glow]");
  const fxCanvas = root.querySelector("[data-otf-fx]");
  const shardCanvas = root.querySelector("[data-otf-shards]");
  const glitchBox = root.querySelector("[data-otf-glitch]");
  const title = root.querySelector("[data-otf-title]");
  const cta = root.querySelector("[data-otf-cta]");
  const flash = root.querySelector(".otf-flash");
  const portal = root.querySelector("[data-otf-portal]");
  const soundBtn = root.querySelector("[data-otf-sound]");
  const soundLabel = root.querySelector("[data-otf-sound-label]");
  if (!stage || !crackCanvas || !shardCanvas || !crackCanvas.getContext) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;
  const TAU = Math.PI * 2;
  const store = (fn) => { try { return fn(); } catch (e) { return null; } };

  // Title letters, each with its own ignition delay
  if (title) {
    const rnd = otfRandom(7);
    title.innerHTML = title.textContent.trim().split(/\s+/).map((word) =>
      `<span class="w" aria-hidden="true">${[...word].map((ch) => `<span class="l" style="--d:${(rnd() * 0.9).toFixed(2)}s">${ch}</span>`).join("")}</span>`
    ).join(" ");
  }

  // Broken stays broken: after "back" from the Outside page the glass is
  // still cracked; a reload or a fresh visit starts clean
  const nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  const cameBack = nav && nav.type === "back_forward";
  if (!cameBack) store(() => { sessionStorage.removeItem("otf-broken"); sessionStorage.removeItem("otf-holes"); });
  const startBroken = reducedMotion || (cameBack && store(() => sessionStorage.getItem("otf-broken")) === "1");

  // Two takes, one picked at random each load: the mirror or the rift.
  // "Back" from the Outside page keeps the one you went through
  // (?take=rift or ?take=mirror in the URL forces one, for a preview)
  const asked = new URLSearchParams(window.location.search).get("take");
  const kept = asked === "rift" || asked === "mirror" ? asked : cameBack ? store(() => sessionStorage.getItem("otf-take")) : null;
  const rift = kept ? kept === "rift" : Math.random() < 0.5;
  store(() => sessionStorage.setItem("otf-take", rift ? "rift" : "mirror"));
  if (rift) root.classList.add("otf--rift");
  const buildScene = rift ? otfBuildRift : otfBuildMirror;

  if (!reducedMotion) root.classList.add("otf--live");

  /* ---------- Geometry and layers ---------- */
  let W = 0;
  let H = 0;
  let dpr = 1;
  let mirror = null;
  let webLayer = null;
  let impactLayer = null;
  let holesLayer = null;
  let webQ = -1;
  const ctxCrack = crackCanvas.getContext("2d");
  const ctxGlow = glowCanvas.getContext("2d");
  const ctxFx = fxCanvas.getContext("2d");
  const ctxShards = shardCanvas.getContext("2d");

  const layer = (draw) => {
    const c = document.createElement("canvas");
    c.width = Math.round(W * dpr);
    c.height = Math.round(H * dpr);
    const x = c.getContext("2d");
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(x);
    return c;
  };

  const drawGlow = () => {
    ctxGlow.setTransform(1, 0, 0, 1, 0, 0);
    ctxGlow.clearRect(0, 0, glowCanvas.width, glowCanvas.height);
    ctxGlow.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (rift) return;
    otfDrawGlow(ctxGlow, mirror);
    holes.forEach((h) => otfDrawGlow(ctxGlow, h.m));
  };

  // The broken glass over every hole's rim, above the red light
  const drawShards = () => {
    ctxShards.setTransform(1, 0, 0, 1, 0, 0);
    ctxShards.clearRect(0, 0, shardCanvas.width, shardCanvas.height);
    ctxShards.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (rift) return;
    otfDrawShards(ctxShards, mirror, 4242);
    holes.forEach((h) => otfDrawShards(ctxShards, h.m, h.seed + 1));
  };

  // The painted vines and tissue: the glow takes them as they arrive
  const texDir = root.dataset.otfTex;
  if (texDir && !rift) {
    [["vines", "gate-vines.webp", otfMaskVines], ["tissue", "tissue.webp", (img) => img]].forEach(([key, file, prep]) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        otfTex[key] = prep(img);
        if (mirror) drawGlow();
      };
      img.src = texDir + file;
    });
  }

  const build = () => {
    W = stage.clientWidth;
    H = stage.clientHeight;
    const mobile = W < 768;
    dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
    mirror = buildScene(W, H, mobile);
    [crackCanvas, glowCanvas, fxCanvas, shardCanvas].forEach((c) => {
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
    });
    // (the rift is a photograph: nothing drawn on it)
    webLayer = layer((x) => { if (!rift) otfDrawWeb(x, mirror); });
    impactLayer = layer((x) => { if (!rift) otfDrawImpact(x, mirror); });
    // The extra holes, at the same share of the new size
    holesLayer = layer((x) => holes.forEach((h) => {
      shapeHole(h);
      h.patch = null;
      paintHole(x, h);
    }));
    webQ = -1;
    drawGlow();
    drawShards();
    root.style.setProperty("--ix", `${((mirror.cx / W) * 100).toFixed(2)}%`);
    root.style.setProperty("--iy", `${((mirror.cy / H) * 100).toFixed(2)}%`);
    root.style.setProperty("--ir", `${(mirror.r0 * 0.98).toFixed(1)}px`);
    root.style.setProperty("--hole-clip", otfHoleClip(mirror));

    // RGB glitch lines
    const rnd = otfRandom(77);
    const cols = ["#ff2a3d", "#2bff8f", "#3b7bff"];
    glitchBox.innerHTML = Array.from({ length: mobile ? 6 : 11 }, () =>
      `<i style="--x:${(rnd() * 100).toFixed(1)}%;--y:${(rnd() * 70).toFixed(1)}%;--w:${(1 + rnd() * 1.5).toFixed(1)}px;--h:${(20 + rnd() * 120).toFixed(0)}px;--c:${cols[Math.floor(rnd() * 3)]};--o:${(0.2 + rnd() * 0.3).toFixed(2)};--t:${(3 + rnd() * 5).toFixed(1)}s;--d:${(rnd() * 4).toFixed(1)}s"></i>`
    ).join("");
  };

  // Before the hit: the web spreads with the scroll (q: 0 -> 1). Each
  // crack runs out from where it starts, a spark at its tip
  let webCount = 0;
  let lastTick = 0;
  const drawWeb = (q) => {
    if (Math.abs(q - webQ) < 0.0002) return;
    webQ = q;
    // The rift just heats up (styles.css), the ground grinding as it does
    if (rift) {
      root.style.setProperty("--heat", q.toFixed(4));
      const count = Math.floor(q * 9);
      if (count > webCount) sfx("tick");
      webCount = count;
      return;
    }
    ctxCrack.setTransform(1, 0, 0, 1, 0, 0);
    ctxCrack.clearRect(0, 0, crackCanvas.width, crackCanvas.height);
    ctxCrack.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctxCrack.lineCap = "round";
    ctxCrack.lineJoin = "round";
    const step = q * mirror.webEnd;
    let count = 0;
    mirror.web.forEach((s) => {
      const f = Math.min(1, (step - s.start) / s.dur);
      if (f <= 0) return;
      count++;
      const pts = otfPartial(s.pts, 1 - (1 - f) * (1 - f));
      if (pts.length < 2) return;
      otfCrack(ctxCrack, mirror, pts, s.w, s.o, s.seed);
      if (f < 1) {
        const [x, y] = pts[pts.length - 1];
        const g = ctxCrack.createRadialGradient(x, y, 0, x, y, 7);
        g.addColorStop(0, "rgba(255, 255, 255, .9)");
        g.addColorStop(1, "rgba(200, 215, 255, 0)");
        ctxCrack.fillStyle = g;
        ctxCrack.beginPath();
        ctxCrack.arc(x, y, 7, 0, TAU);
        ctxCrack.fill();
      }
    });
    // A tick for each new crack (going forward only)
    const now = performance.now();
    if (count > webCount && now - lastTick > 70) {
      lastTick = now;
      sfx("tick");
    }
    webCount = count;
  };

  /* ---------- More holes: click anywhere on the broken glass ---------- */
  // Each one is kept as where it was hit (fx/fy, a share of the stage)
  // and its size (k, a share of the main hole), so a resize redraws it
  // in place. Settled holes live in holesLayer; a fresh one keeps its
  // own small canvas (patch) while it opens, then is baked in
  const holes = [];
  const MAX_HOLES = 24;
  const HOLE_MS = 520;
  let opening = false;

  const shapeHole = (h) => {
    h.m = otfBuildHole(h.fx * W, h.fy * H, mirror.r0 * h.k, h.seed, W < 768);
    h.link.style.setProperty("--ix", `${(h.fx * 100).toFixed(2)}%`);
    h.link.style.setProperty("--iy", `${(h.fy * 100).toFixed(2)}%`);
    h.link.style.setProperty("--ir", `${(h.m.r0 * 0.98).toFixed(1)}px`);
    h.link.style.setProperty("--hole-clip", otfHoleClip(h.m));
  };
  const paintHole = (x, h) => {
    otfDrawWeb(x, h.m);
    otfDrawImpact(x, h.m);
  };
  const patchHole = (h) => {
    const pad = h.m.R * 1.25 + 10;
    const x0 = Math.floor(h.m.cx - pad);
    const y0 = Math.floor(h.m.cy - pad);
    const c = document.createElement("canvas");
    c.width = c.height = Math.ceil(pad * 2 * dpr);
    const x = c.getContext("2d");
    x.setTransform(dpr, 0, 0, dpr, -x0 * dpr, -y0 * dpr);
    paintHole(x, h);
    return { c, x0, y0 };
  };

  // The holes onto the crack canvas, a fresh one revealed out from where
  // it was hit. True while one is still opening
  const drawHoles = (now) => {
    ctxCrack.drawImage(holesLayer, 0, 0);
    let still = false;
    holes.forEach((h) => {
      if (!h.patch) return;
      const t = Math.min(1, (now - h.born) / HOLE_MS);
      ctxCrack.save();
      if (t < 1) {
        const e = 1 - Math.pow(2, -10 * t);
        ctxCrack.beginPath();
        ctxCrack.arc(h.m.cx * dpr, h.m.cy * dpr, (h.m.r0 * 0.6 + (h.m.R * 1.25 - h.m.r0 * 0.6) * e) * dpr, 0, TAU);
        ctxCrack.clip();
        still = true;
      }
      ctxCrack.drawImage(h.patch.c, h.patch.x0 * dpr, h.patch.y0 * dpr);
      ctxCrack.restore();
      if (t >= 1) {
        paintHole(holesLayer.getContext("2d"), h);
        h.patch = null;
      }
    });
    return still;
  };

  // After the hit: the long cracks at once, the crushed glass revealed
  // out from the impact (t: 0 -> 1). True while a new hole is opening
  const reveal = (t, now = performance.now()) => {
    ctxCrack.setTransform(1, 0, 0, 1, 0, 0);
    ctxCrack.clearRect(0, 0, crackCanvas.width, crackCanvas.height);
    ctxCrack.drawImage(webLayer, 0, 0);
    if (t >= 1) {
      ctxCrack.drawImage(impactLayer, 0, 0);
    } else {
      const e = 1 - Math.pow(2, -10 * t);
      const rad = (mirror.r0 * 0.6 + (mirror.R - mirror.r0 * 0.6) * e) * dpr;
      ctxCrack.save();
      ctxCrack.beginPath();
      ctxCrack.arc(mirror.cx * dpr, mirror.cy * dpr, rad, 0, TAU);
      ctxCrack.clip();
      ctxCrack.drawImage(impactLayer, 0, 0);
      ctxCrack.restore();
    }
    return drawHoles(now);
  };

  /* ---------- Sound ---------- */
  const songSrc = root.dataset.otfSong;
  let soundOn = reducedMotion ? false : store(() => localStorage.getItem("otf-sound")) !== "off";
  let unlocked = false;
  let unlockedAt = 0;
  let ac = null;
  let synth = null;
  let music = null;
  let musicFailed = false;
  let playPending = false;
  let vol = 0;
  let near = false;
  // The recorded crack (Black Mirror's hit starts 9.48s into the file)
  const fxSrc = root.dataset.otfFx;
  const FX_HIT = 9.48;
  let fxBuf = null;
  let duckAt = -1e9;

  const getMusic = () => {
    if (!songSrc || musicFailed) return null;
    if (!music) {
      music = otfLooper(songSrc, () => {
        if (music) music.pause();
        musicFailed = true;
        music = null;
        updateSoundBtn();
      });
    }
    return music;
  };

  // The ask just before the section (outside root, same switch)
  const gate = document.querySelector("[data-otf-gate]");
  const gateOn = gate && gate.querySelector("[data-otf-gate-on]");
  const gateOff = gate && gate.querySelector("[data-otf-gate-off]");
  const gateLabel = gate && gate.querySelector("[data-otf-gate-label]");
  const gateText = gate && gate.querySelector("[data-otf-gate-text]");
  let gateAnswered = false;

  const updateSoundBtn = () => {
    const playing = soundOn && unlocked;
    if (gateOn) {
      gateOn.classList.toggle("is-on", playing);
      gateOn.setAttribute("aria-pressed", String(playing));
      gateOff.setAttribute("aria-pressed", String(gateAnswered && !soundOn));
      gateLabel.textContent = playing ? "Sound on" : "Turn sound on";
      if (gateAnswered) {
        gateText.textContent = soundOn
          ? "Keep scrolling. The music fades in as you get close."
          : "No problem. You can turn it on any time, bottom left of the next screen.";
      }
    }
    if (!soundBtn) return;
    soundBtn.classList.toggle("is-locked", soundOn && !unlocked);
    soundBtn.classList.toggle("is-playing", playing && ((music && !music.paused) || root.classList.contains("is-leaking")));
    soundBtn.setAttribute("aria-pressed", String(playing));
    soundLabel.textContent = !soundOn ? "Sound off" : unlocked ? "Sound on" : "Tap for sound";
  };

  // iOS only lets a media element play later if it played inside a gesture
  const prime = () => {
    const m = getMusic();
    if (m && m.paused) {
      m.muted = true;
      m.play().then(() => { m.muted = false; if (vol < 0.01) m.pause(); }).catch(() => { m.muted = false; });
    }
  };

  // The audio engine is slow to start (it can stall a frame for a good
  // while), so it is made ahead while the page is idle and sits
  // suspended; the first click only resumes it
  const wakeAudio = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC || ac) return;
    ac = new AC();
    synth = otfSynth(ac);
    if (fxSrc && !rift) {
      fetch(fxSrc)
        .then((r) => r.arrayBuffer())
        // Callback form: older Safari has no promise version
        .then((b) => new Promise((res, rej) => ac.decodeAudioData(b, res, rej)))
        .then((buf) => { fxBuf = buf; })
        .catch(() => {});
    }
  };

  const unlock = () => {
    if (unlocked) return;
    unlocked = true;
    unlockedAt = performance.now();
    wakeAudio();
    if (ac && ac.state === "suspended") ac.resume();
    if (near) prime();
    updateSoundBtn();
  };
  ["pointerdown", "keydown", "touchend"].forEach((ev) => document.addEventListener(ev, unlock, { once: true, passive: true }));

  if (soundBtn) {
    soundBtn.hidden = false;
    soundBtn.addEventListener("click", () => {
      // The press that unlocked audio also lands here: that one turns sound on
      if (!unlocked || performance.now() - unlockedAt < 800) {
        unlock();
        soundOn = true;
      } else {
        soundOn = !soundOn;
      }
      store(() => localStorage.setItem("otf-sound", soundOn ? "on" : "off"));
      updateSoundBtn();
    });
    updateSoundBtn();
  }

  if (gateOn && gateOff) {
    gate.hidden = false;
    const answer = (on) => {
      unlock();
      soundOn = on;
      gateAnswered = true;
      if (on) prime();
      store(() => localStorage.setItem("otf-sound", on ? "on" : "off"));
      updateSoundBtn();
    };
    // Once answered it works as a switch: on, then off again
    gateOn.addEventListener("click", () => answer(!(gateAnswered && soundOn)));
    gateOff.addEventListener("click", () => answer(false));
    updateSoundBtn();
  }

  // The big moments get the recorded crack once it has loaded (and the
  // song ducks under it); synthesised glass until then
  // (the rift has earth for glass: a grind per tear, a quake when it opens)
  const sfx = (name) => {
    if (!synth || !soundOn || !unlocked) return;
    if (rift) {
      synth[{ tick: "grind", impact: "quake" }[name] || name]();
    } else if (fxBuf && name === "impact") {
      synth.clip(fxBuf, FX_HIT, 5, 1);
      duckAt = performance.now();
    } else {
      synth[name]();
    }
  };

  // Song level under the crack: down at once, back up over 1.5s
  const duck = () => {
    const s = (performance.now() - duckAt) / 1000;
    return s < 0.5 ? 0.3 : s < 2 ? 0.3 + 0.7 * ((s - 0.5) / 1.5) : 1;
  };

  // Music follows how close the section is: silent 40% of a screen away,
  // full while the stage is pinned
  const updateAudio = () => {
    // Stepping inside nothing moves: skip the measuring, which would
    // force a full style and layout pass on the shatter's busy frames
    if (!shattering) {
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      const gap = rect.top > vh ? rect.top - vh : rect.bottom < 0 ? -rect.bottom : 0;
      const cover = Math.max(0, Math.min(1, (Math.min(rect.bottom, vh) - Math.max(rect.top, 0)) / vh));
      const target = gap > 0 ? 0.15 * Math.max(0, 1 - gap / (vh * 0.4)) : 0.15 + 0.85 * cover;
      vol += (target - vol) * 0.06;
    }
    // The song keeps going through the shatter and the portal: the
    // Outside page picks it up from the exact spot (handOff)
    const on = soundOn && unlocked;
    const m = getMusic();
    if (m) {
      const v = on ? vol * 0.75 : 0;
      m.volume = Math.max(0, Math.min(1, v * duck()));
      if (v > 0.01 && m.paused && !playPending) {
        playPending = true;
        m.play().then(updateSoundBtn).catch(() => {}).finally(() => { playPending = false; });
      } else if (v < 0.004 && !m.paused) {
        m.pause();
        updateSoundBtn();
      }
    }
    if (synth) synth.hum(on && !shattering && root.classList.contains("is-leaking") ? vol * 0.035 : 0);
  };

  // Where the song is, how loud, and when: read by the Outside page
  const handOff = () => {
    if (!music || music.paused) return;
    const song = { t: music.currentTime, v: music.volume, at: Date.now() };
    store(() => sessionStorage.setItem("otf-music", JSON.stringify(song)));
  };

  /* ---------- The sequence ---------- */
  let broken = false;
  let revealStart = 0;
  // The red creeping out over the glass from the hole's edge to the far
  // corners (--grow on .otf-glow, in px, with a soft --feather front)
  const glowBox = root.querySelector(".otf-glow");
  const GROW_MS = 4600;
  let growStart = 0;
  let shattering = false;
  const timers = [];
  const later = (ms, fn) => timers.push(setTimeout(fn, ms));

  // Once the glass is broken, have the Outside page ready in the background
  // (prerendered where supported) so stepping through is instant
  const prepareOutside = () => {
    if (!cta) return;
    const href = cta.getAttribute("href");
    if (window.HTMLScriptElement && HTMLScriptElement.supports && HTMLScriptElement.supports("speculationrules")) {
      const rules = document.createElement("script");
      rules.type = "speculationrules";
      rules.textContent = JSON.stringify({ prerender: [{ source: "list", urls: [href] }] });
      document.head.appendChild(rules);
    } else {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = href;
      document.head.appendChild(link);
    }
  };

  const breakGlass = (instant) => {
    if (broken) return;
    broken = true;
    store(() => sessionStorage.setItem("otf-broken", "1"));
    prepareOutside();
    if (!mirror) build();
    root.classList.add("is-broken");
    if (rift) root.style.setProperty("--heat", "1");
    if (instant) {
      reveal(1);
      revealStart = 0;
      root.classList.add("is-leaking", "is-lit", "is-ready");
      updateSoundBtn();
      return;
    }
    revealStart = performance.now();
    scene.classList.remove("is-shaking");
    void scene.offsetWidth;
    scene.classList.add("is-shaking");
    flash.classList.add("is-on");
    later(420, () => { scene.classList.remove("is-shaking"); flash.classList.remove("is-on"); });
    sfx("impact");
    if (rift) emberBurst = W < 768 ? 30 : 55;
    // The hole lights up first, then the veins creep out from its edge
    // as the crack's rumble comes in
    later(400, () => root.classList.add("is-ready"));
    later(1000, () => { growStart = performance.now(); root.classList.add("is-leaking"); updateSoundBtn(); });
    later(2800, () => root.classList.add("is-lit"));
  };

  /* ---------- Spores drifting out through the cracks ---------- */
  const spores = [];
  let lastT = 0;
  const updateSpores = (now) => {
    const dt = Math.min(0.05, (now - lastT) / 1000 || 0);
    lastT = now;
    if (rift) {
      updateEmbers(dt);
      return;
    }
    const max = W < 768 ? 28 : 56;
    if (spores.length < max && Math.random() < dt * (14 + holes.length * 3)) {
      // Out of the main hole, or now and then one of the punched ones
      const from = holes.length && Math.random() < holes.length / (holes.length + 3) ? holes[Math.floor(Math.random() * holes.length)].m : mirror;
      const a = Math.random() * TAU;
      const d = from.r0 * (0.8 + Math.random() * 1.6);
      spores.push({
        x: from.cx + Math.cos(a) * d,
        y: from.cy + Math.sin(a) * d,
        vx: (Math.random() - 0.5) * 12,
        vy: -(8 + Math.random() * 22),
        r: 0.6 + Math.random() * 1.6,
        age: 0,
        life: 4 + Math.random() * 5,
      });
    }
    ctxFx.setTransform(1, 0, 0, 1, 0, 0);
    ctxFx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
    ctxFx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (let i = spores.length - 1; i >= 0; i--) {
      const p = spores[i];
      p.age += dt;
      if (p.age > p.life) { spores.splice(i, 1); continue; }
      p.vx += Math.sin(p.age * 1.3 + i) * dt * 4;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      ctxFx.fillStyle = `rgba(255, 185, 172, ${Math.sin((p.age / p.life) * Math.PI) * 0.55})`;
      ctxFx.beginPath();
      ctxFx.arc(p.x, p.y, p.r, 0, TAU);
      ctxFx.fill();
    }
  };

  /* ---------- Embers rising off the rift ---------- */
  // Born white-hot on the tear, they cool to orange and a deep red as
  // they rise, flickering, pushed about by the heat. A few while it
  // heats up, a steady stream once it is open, a burst when it erupts
  let emberBurst = 0;
  const updateEmbers = (dt) => {
    const max = W < 768 ? 60 : 110;
    const rate = broken ? 30 : 30 * Math.max(0, webS - 0.15) * 0.5;
    let n = emberBurst + (Math.random() < dt * rate ? 1 : 0);
    emberBurst = 0;
    while (n-- > 0 && spores.length < max) {
      const [x, y] = otfOnCrack(mirror);
      const fast = Math.random() < 0.25;
      spores.push({
        x: x + (Math.random() - 0.5) * 14,
        y: y + (Math.random() - 0.5) * 14,
        vx: (Math.random() - 0.5) * (fast ? 90 : 26),
        vy: -(fast ? 70 + Math.random() * 90 : 18 + Math.random() * 40),
        r: 0.6 + Math.random() * (fast ? 1 : 1.8),
        age: 0,
        life: fast ? 0.8 + Math.random() * 1.2 : 2.5 + Math.random() * 3.5,
        seed: Math.random() * TAU,
      });
    }
    ctxFx.setTransform(1, 0, 0, 1, 0, 0);
    ctxFx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
    ctxFx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctxFx.globalCompositeOperation = "lighter";
    for (let i = spores.length - 1; i >= 0; i--) {
      const p = spores[i];
      p.age += dt;
      const t = p.age / p.life;
      if (t >= 1) { spores.splice(i, 1); continue; }
      p.vx += Math.sin(p.age * 2.1 + p.seed) * dt * 30;
      p.vy *= 1 - dt * 0.35;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const flicker = 0.6 + 0.4 * Math.sin(p.age * 23 + p.seed * 7);
      const a = flicker * Math.pow(1 - t, 0.8) * Math.min(1, p.age * 8);
      const g = Math.round(235 - 175 * t);
      const b = Math.round(170 - 160 * t);
      ctxFx.fillStyle = `rgba(255, ${g}, ${b}, ${(a * 0.18).toFixed(3)})`;
      ctxFx.beginPath();
      ctxFx.arc(p.x, p.y, p.r * 3.5, 0, TAU);
      ctxFx.fill();
      ctxFx.fillStyle = `rgba(255, ${g}, ${b}, ${a.toFixed(3)})`;
      ctxFx.beginPath();
      ctxFx.arc(p.x, p.y, p.r, 0, TAU);
      ctxFx.fill();
    }
    ctxFx.globalCompositeOperation = "source-over";
  };

  /* ---------- Step inside: everything dissolves into red ---------- */
  // The clicked hole swells toward you, the glass melts into the red
  // behind it and the portal settles on the Outside page's first frame
  // (.is-shattering and .otf-portal in styles.css)
  const startShatter = (href, link) => {
    shattering = true;
    timers.forEach(clearTimeout);
    root.classList.add("is-broken", "is-leaking", "is-lit", "is-ready");
    reveal(1);
    if (link) link.classList.add("is-entering");
    root.classList.add("is-shattering");
    if (synth && soundOn && unlocked) synth.whoosh();
    store(() => sessionStorage.setItem("otf-portal", "1"));
    // The rift: the drone dives into the tear (otf-dive in styles.css),
    // the red rushes up, and a white-hot cut lands on the red
    if (rift) {
      sfx("impact");
      later(1900, () => portal.classList.add("is-on", "is-cut"));
      later(2600, () => { handOff(); window.location.href = href; });
      return;
    }
    later(700, () => portal.classList.add("is-on"));
    later(1800, () => { handOff(); window.location.href = href; });
  };

  // Any hole, the first or a punched one, is the way in
  const stepInside = (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (shattering) { e.preventDefault(); return; }
    e.preventDefault();
    // Waking the audio is slow the first time: let that frame pass before
    // the dissolve starts, so it doesn't stutter on its first frames
    const first = !unlocked;
    unlock();
    const link = e.currentTarget;
    const href = link.href;
    if (reducedMotion || !mirror) {
      store(() => sessionStorage.setItem("otf-portal", "1"));
      portal.classList.add("is-on");
      setTimeout(() => { handOff(); window.location.href = href; }, 550);
      return;
    }
    if (first) {
      shattering = true;
      requestAnimationFrame(() => requestAnimationFrame(() => startShatter(href, link)));
    } else {
      startShatter(href, link);
    }
  };

  const saveHoles = () => store(() => sessionStorage.setItem("otf-holes", JSON.stringify(holes.map(({ fx, fy, k, seed }) => ({ fx, fy, k, seed })))));

  // A hole and its link (a copy of the main one, kept out of the tab
  // order and from screen readers: the main link already says it)
  const addHole = (spec, animate) => {
    const link = document.createElement("a");
    link.className = "otf-cta otf-cta--more";
    link.href = cta.getAttribute("href");
    link.tabIndex = -1;
    link.setAttribute("aria-hidden", "true");
    link.addEventListener("click", stepInside);
    scene.insertBefore(link, cta.nextSibling);
    const h = { fx: spec.fx, fy: spec.fy, k: spec.k, seed: spec.seed, link, born: animate ? performance.now() : -Infinity };
    shapeHole(h);
    h.patch = patchHole(h);
    otfDrawGlow(ctxGlow, h.m);
    otfDrawShards(ctxShards, h.m, h.seed + 1);
    holes.push(h);
    opening = true;
  };

  // Clear of the main hole's crushed ring and of the other holes
  let knockTimer = null;
  const punch = (x, y) => {
    if (holes.length >= MAX_HOLES) return;
    const k = 0.4 + Math.random() * 0.2;
    const r0 = mirror.r0 * k;
    if (Math.hypot(x - mirror.cx, y - mirror.cy) < mirror.r1 + r0) return;
    if (holes.some((h) => Math.hypot(x - h.m.cx, y - h.m.cy) < (h.m.r0 + r0) * 1.5)) return;
    addHole({ fx: x / W, fy: y / H, k, seed: Math.floor(Math.random() * 1e9) }, !reducedMotion);
    saveHoles();
    sfx("knock");
    if (reducedMotion) return;
    // A smaller knock: a quick white flash at the spot, a light jolt
    flash.style.setProperty("--ix", `${((x / W) * 100).toFixed(2)}%`);
    flash.style.setProperty("--iy", `${((y / H) * 100).toFixed(2)}%`);
    flash.classList.remove("is-knock");
    scene.classList.remove("is-knocked");
    void scene.offsetWidth;
    flash.classList.add("is-knock");
    scene.classList.add("is-knocked");
    clearTimeout(knockTimer);
    knockTimer = setTimeout(() => {
      flash.classList.remove("is-knock");
      flash.style.removeProperty("--ix");
      flash.style.removeProperty("--iy");
      scene.classList.remove("is-knocked");
    }, 320);
  };

  if (cta) {
    // A thump on every heartbeat of the hole (its ::before animation)
    cta.addEventListener("animationiteration", (e) => {
      if (e.animationName !== "otf-heart" || shattering || !root.classList.contains("is-ready")) return;
      if (synth && soundOn && unlocked) {
        const beat = parseFloat(getComputedStyle(cta).getPropertyValue("--beat")) || 1.15;
        synth.heartbeat(Math.min(0.5, vol * 0.5), beat * 0.16);
      }
    });

    cta.addEventListener("click", stepInside);

    // Clicking anywhere else on the broken glass punches another hole
    // there, and every hole beats and leads the same way in (glass only)
    if (!rift) {
      stage.addEventListener("click", (e) => {
        if (!broken || shattering || !mirror || e.button !== 0 || e.target.closest("a, button")) return;
        const r = stage.getBoundingClientRect();
        punch(((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H);
      });
      root.classList.add("otf--punch");
    }
  }

  // The punched holes, restored after "back" from the Outside page
  const saved = startBroken && !rift && store(() => JSON.parse(sessionStorage.getItem("otf-holes")));
  const restored = Array.isArray(saved) ? saved.filter((h) => h && [h.fx, h.fy, h.k, h.seed].every(Number.isFinite)).slice(0, MAX_HOLES) : [];

  // Back from the Outside page via the browser cache: show the broken glass
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted || !shattering) return;
    shattering = false;
    root.classList.remove("is-shattering");
    portal.classList.remove("is-on", "is-cut");
    root.querySelectorAll(".is-entering").forEach((a) => a.classList.remove("is-entering"));
  });

  /* ---------- Loop ---------- */
  // Scroll through the pinned stage (0 -> 1): the web spreads from
  // WEB_FROM to WEB_TO, holds a moment, and the glass breaks at BREAK_AT
  const WEB_FROM = 0.02;
  const WEB_TO = 0.5;
  const BREAK_AT = 0.58;
  let webS = 0;
  let raf = null;
  const mouse = { x: 0, y: 0 };
  const sheen = { x: 0, y: 0 };
  if (canHover) {
    stage.addEventListener("mousemove", (e) => {
      const r = stage.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width - 0.5;
      mouse.y = (e.clientY - r.top) / r.height - 0.5;
    });
    stage.addEventListener("mouseleave", () => { mouse.x = 0; mouse.y = 0; });
  }

  // Entrance: eased as the section rises from the bottom of the screen
  // to the top. Follows the scroll directly (no lag) and is set before
  // the first paint, so the panel never jumps from full bleed to inset.
  let enter = -1;
  let enterQueued = false;
  const updateEnter = () => {
    enterQueued = false;
    const raw = Math.max(0, Math.min(1, 1 - root.getBoundingClientRect().top / window.innerHeight));
    const next = 1 - Math.pow(1 - raw, 3);
    if (Math.abs(next - enter) < 0.0005) return;
    enter = next;
    stage.style.setProperty("--otf-in", enter.toFixed(4));
  };
  if (!reducedMotion) {
    updateEnter();
    const queueEnter = () => {
      if (enterQueued) return;
      enterQueued = true;
      requestAnimationFrame(updateEnter);
    };
    window.addEventListener("scroll", queueEnter, { passive: true });
    window.addEventListener("resize", queueEnter);
  }

  const frame = (now) => {
    updateAudio();

    if (!reducedMotion && !broken && mirror) {
      const rect = root.getBoundingClientRect();
      const travel = rect.height - stage.clientHeight;
      const p = travel > 0 ? -rect.top / travel : 1;
      // Eased toward the scroll so a wheel notch still spreads smoothly
      const target = Math.max(0, Math.min(1, (p - WEB_FROM) / (WEB_TO - WEB_FROM)));
      webS += (target - webS) * 0.12;
      if (Math.abs(target - webS) < 0.0005) webS = target;
      drawWeb(webS);
      if (p >= BREAK_AT && p <= 1.05) breakGlass(false);
    }

    if (revealStart || opening) {
      const t = revealStart ? Math.min(1, (now - revealStart) / 520) : 1;
      opening = reveal(t, now);
      if (t >= 1) revealStart = 0;
    }

    if (growStart && glowBox) {
      const t = Math.min(1, (now - growStart) / GROW_MS);
      if (t >= 1) {
        growStart = 0;
        glowBox.style.removeProperty("--grow");
        glowBox.style.removeProperty("--feather");
      } else {
        // Eased in and out: it starts creeping, spreads, then settles
        const e = 0.5 - Math.cos(t * Math.PI) / 2;
        const feather = mirror.r0 * 1.8;
        const from = mirror.r0 * 0.9;
        const to = mirror.R * 1.05 + feather;
        glowBox.style.setProperty("--feather", `${feather.toFixed(1)}px`);
        glowBox.style.setProperty("--grow", `${(from + (to - from) * e).toFixed(1)}px`);
      }
    }

    if (canHover && !reducedMotion) {
      sheen.x += (mouse.x - sheen.x) * 0.06;
      sheen.y += (mouse.y - sheen.y) * 0.06;
      stage.style.setProperty("--mx", sheen.x.toFixed(3));
      stage.style.setProperty("--my", sheen.y.toFixed(3));
    }

    if (!reducedMotion && (root.classList.contains("is-leaking") || (rift && webS > 0.15))) updateSpores(now);
    raf = requestAnimationFrame(frame);
  };

  const begin = () => {
    if (!mirror) build();
    if (startBroken && !broken) {
      if (cta) restored.forEach((spec) => addHole(spec, false));
      breakGlass(true);
    }
    if (!raf) raf = requestAnimationFrame(frame);
  };

  // Draw the glass ahead of time, while the browser is idle, so nothing
  // heavy happens at the moment the section scrolls into view
  const prebuild = () => {
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
    idle(() => { if (!mirror) build(); }, { timeout: 2500 });
    if (!reducedMotion) idle(wakeAudio, { timeout: 4000 });
  };
  if (document.readyState === "complete") prebuild();
  else window.addEventListener("load", prebuild, { once: true });

  // Run only while the section is near (the song starts fading in here)
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        near = entry.isIntersecting;
        if (near) {
          begin();
        } else if (raf && !shattering) {
          cancelAnimationFrame(raf);
          raf = null;
          vol = 0;
          if (music && !music.paused) music.pause();
          if (synth) synth.hum(0);
          updateSoundBtn();
        }
      });
    }, { rootMargin: "50% 0px" }).observe(root);
  } else {
    near = true;
    begin();
  }

  // Redraw the glass for the new size (same pattern, same seed)
  let resizeTimer = null;
  let lastW = 0;
  let lastH = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!mirror || shattering) return;
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (w === lastW && Math.abs(h - lastH) < 80) return;
      lastW = w;
      lastH = h;
      build();
      if (broken) reveal(1);
    }, 150);
  });
}

/* ============================================================
   19. The Outside page as the Upside Down: spores drifting in the
       air, a flicker as the page "powers on" when you arrive
       through the portal, and the song carrying over from the
       home page (it fades as you scroll, and stops for previews).
   ============================================================ */
function initUpsideDown() {
  const body = document.body;
  if (!body.hasAttribute("data-upside")) return;
  // Prerendered from the home page: wait until it is actually shown
  if (document.prerendering) {
    document.addEventListener("prerenderingchange", initUpsideDown, { once: true });
    return;
  }
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = (fn) => { try { return fn(); } catch (e) { return null; } };

  // Open on the portal's red (the head script already did this unless prerendered)
  const viaPortal = store(() => sessionStorage.getItem("otf-portal")) === "1";
  store(() => sessionStorage.removeItem("otf-portal"));
  if (viaPortal) {
    const html = document.documentElement;
    html.classList.add("from-portal");
    setTimeout(() => html.classList.remove("from-portal"), 2000);
  }

  // The song, picked up where the home page left it: same spot (plus the
  // time the page took to load) and same loudness, so it never breaks
  const songSrc = body.dataset.otfSong;
  const handed = store(() => JSON.parse(sessionStorage.getItem("otf-music")));
  store(() => sessionStorage.removeItem("otf-music"));
  const soundOff = store(() => localStorage.getItem("otf-sound")) === "off";
  if (viaPortal && songSrc && !soundOff && handed && Number.isFinite(handed.t)) {
    const song = otfLooper(songSrc);
    let level = Math.max(0, Math.min(1, handed.v || 0));
    song.volume = level;
    song.currentTime = handed.t + Math.max(0, Date.now() - handed.at) / 1000;
    let stopped = false; // for good: faded out, or a preview took over
    let off = false; // switched off with the button (can come back on)
    let playing = false;

    // The same sound switch as on the home page, bottom left
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "otf-sound upside-sound";
    btn.innerHTML = '<span class="otf-sound__bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span></span>';
    const label = btn.lastElementChild;
    const show = () => {
      btn.hidden = stopped;
      btn.classList.toggle("is-playing", playing);
      btn.setAttribute("aria-pressed", String(playing));
      label.textContent = playing ? "Sound on" : off ? "Sound off" : "Tap for sound";
    };
    body.appendChild(btn);
    show();

    const pause = () => {
      song.pause();
      playing = false;
      show();
    };
    const tick = () => {
      if (stopped || off) return;
      const fadeOut = Math.max(0, 1 - window.scrollY / (window.innerHeight * 1.2));
      const target = 0.45 * fadeOut;
      level = Math.max(0, Math.min(1, level + (target - level) * 0.04));
      song.volume = level;
      if (target <= 0 && level < 0.01) { stopped = true; pause(); return; }
      requestAnimationFrame(tick);
    };
    const start = () => song.play().then(() => {
      if (off || stopped) return;
      playing = true;
      show();
      tick();
    });

    btn.addEventListener("click", () => {
      off = playing;
      store(() => localStorage.setItem("otf-sound", off ? "off" : "on"));
      if (off) pause();
      else start().catch(() => {});
    });

    start().catch(() => {
      // This browser wants a fresh tap on every page (Safari, Firefox):
      // carry on from the first one (a tap on the switch is its own)
      const resume = (e) => {
        if (btn.contains(e.target)) return;
        ["pointerdown", "keydown", "touchend"].forEach((ev) => document.removeEventListener(ev, resume));
        if (!stopped && !off) start().catch(() => {});
      };
      ["pointerdown", "keydown", "touchend"].forEach((ev) => document.addEventListener(ev, resume, { passive: true }));
    });
    document.addEventListener("click", (e) => {
      if (e.target.closest(".of-song:not(:disabled)")) { stopped = true; pause(); }
    });
  }

  // Back to the home page: flicker red, wash out to its cream, then go
  const exit = document.createElement("div");
  exit.className = "upside-exit";
  exit.setAttribute("aria-hidden", "true");
  body.appendChild(exit);
  const home = new URL("../index.html", location.href).pathname;
  const homeDir = home.replace(/index\.html$/, "");
  let leaving = false;
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link || leaving || e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || link.target === "_blank") return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || (url.pathname !== home && url.pathname !== homeDir)) return;
    e.preventDefault();
    leaving = true;
    store(() => sessionStorage.setItem("otf-return", "1"));
    exit.classList.add("is-on");
    setTimeout(() => { location.href = url.href; }, reducedMotion ? 400 : 1300);
  });
  // Coming back with the browser's Back button: clear the overlay
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    leaving = false;
    exit.classList.remove("is-on");
  });

  if (reducedMotion) return;

  // Spores
  const canvas = document.createElement("canvas");
  canvas.className = "upside-spores";
  canvas.setAttribute("aria-hidden", "true");
  body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  let W = 0;
  let H = 0;
  let dpr = 1;
  const size = () => {
    W = window.innerWidth;
    H = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
  };
  size();
  window.addEventListener("resize", size);
  const spores = Array.from({ length: W < 768 ? 26 : 50 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 0.6 + Math.random() * 1.6,
    s: 0.004 + Math.random() * 0.012,
    w: Math.random() * Math.PI * 2,
    o: 0.12 + Math.random() * 0.4,
  }));
  let last = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    spores.forEach((p) => {
      p.y -= p.s * dt;
      p.w += dt * 0.6;
      if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
      const x = (p.x + Math.sin(p.w) * 0.01) * W;
      ctx.fillStyle = `rgba(255, 185, 172, ${p.o})`;
      ctx.beginPath();
      ctx.arc(x, p.y * H, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
