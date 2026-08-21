/* ============================================================
   SAGODENT MENU — MOBILE FIX + LIQUID GLASS
   - Drawer luôn mở từ bên phải.
   - Header và drawer nhận cùng màu/tone.
   - Chữ, link, mũi tên trong drawer đổi theo tone.
   - VN/ENG được giữ bởi CSS ở mọi breakpoint.
   - Nhận diện được Section của Flatsome trên desktop/mobile/tablet.
   - Giữ thanh tiến trình cuộn.
   ============================================================ */
(function () {
  "use strict";

  function initSagodentMenu() {
    const menuRoot = Array.from(
      document.querySelectorAll("main#--sgd-top"),
    ).find(function (root) {
      return Boolean(
        root.querySelector(":scope > .--sgd-topbar .--sgd-menu-button") &&
        root.querySelector(":scope > .--sgd-menu-panel"),
      );
    });

    if (!menuRoot) return;

    const sourceHeader = menuRoot.querySelector(":scope > .--sgd-topbar");
    const sourcePanel = menuRoot.querySelector(":scope > .--sgd-menu-panel");
    const progress = menuRoot.querySelector(":scope > .--sgd-scroll-progress");

    if (!sourceHeader || !sourcePanel) return;

    /*
     * sagodent.js gốc đã từng gắn listener lên .--sgd-menu-button/.--sgd-menu-panel.
     * Clone cả header và panel để loại bỏ listener cũ, tránh xung đột.
     */
    const header = sourceHeader.cloneNode(true);
    const panel = sourcePanel.cloneNode(true);

    sourceHeader.replaceWith(header);
    sourcePanel.replaceWith(panel);

    const button = header.querySelector(".--sgd-menu-button");
    if (!button) return;

    button.type = "button";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "--sgd-sagodent-main-menu-panel");

    panel.id = "--sgd-sagodent-main-menu-panel";
    panel.setAttribute("aria-hidden", "true");

    let backdrop = document.querySelector(
      "body > .--sgd-sagodent-menu-backdrop",
    );

    if (!backdrop) {
      backdrop = document.createElement("button");
      backdrop.type = "button";
      backdrop.className = "--sgd-sagodent-menu-backdrop";
      backdrop.setAttribute("aria-label", "Đóng menu");
      backdrop.setAttribute("aria-hidden", "true");
    }

    /*
     * Tách phần fixed khỏi .section/.row/.col-inner của UX Block.
     * Tránh transform/overflow của Flatsome làm sai vị trí trên mobile.
     */
    if (progress) {
      progress.classList.add("--sgd-sagodent-menu-mounted");
      document.body.appendChild(progress);
    }

    header.classList.add("--sgd-sagodent-menu-mounted");
    panel.classList.add("--sgd-sagodent-menu-mounted");

    document.body.appendChild(backdrop);
    document.body.appendChild(panel);
    document.body.appendChild(header);

    /* Xóa bản menu trùng nếu UX Block bị render hai lần. */
    document
      .querySelectorAll("body > .--sgd-topbar.--sgd-sagodent-menu-mounted")
      .forEach(function (item) {
        if (item !== header) item.remove();
      });

    document
      .querySelectorAll("body > .--sgd-menu-panel.--sgd-sagodent-menu-mounted")
      .forEach(function (item) {
        if (item !== panel) item.remove();
      });

    let menuOpen = false;
    let updateQueued = false;
    let currentZone = null;
    let lockedScrollY = 0;
    let mobileScrollLocked = false;

    function isMobileMenuMode() {
      return window.matchMedia("(max-width: 900px)").matches;
    }

    function lockMobilePageScroll() {
      if (!isMobileMenuMode() || mobileScrollLocked) return;

      lockedScrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
      mobileScrollLocked = true;

      document.documentElement.style.setProperty(
        "--sgd-lock-top",
        "-" + lockedScrollY + "px",
      );

      if (
        window.sagodentLenis &&
        typeof window.sagodentLenis.stop === "function"
      ) {
        window.sagodentLenis.stop();
      }
    }

    function unlockMobilePageScroll() {
      if (!mobileScrollLocked) return;

      mobileScrollLocked = false;
      document.documentElement.style.removeProperty("--sgd-lock-top");

      /* Khôi phục đúng vị trí trước khi mở menu, tránh trang bị nhảy về đầu. */
      window.scrollTo(0, lockedScrollY);

      if (window.sagodentLenis) {
        if (typeof window.sagodentLenis.resize === "function") {
          window.sagodentLenis.resize();
        }
        if (typeof window.sagodentLenis.start === "function") {
          window.sagodentLenis.start();
        }
      }
    }

    const explicitZoneSelector = [
      "[data-menu-bg]",
      "[data-sagodent-menu-bg]",
      "[data-menu-tone]",
      "[data-sagodent-menu-tone]",
      ".hero",
      ".intro",
      ".doctor",
      ".difference",
      ".difference-head",
      ".difference-row",
      ".courses",
      ".library",
      ".id4",
      ".contact",
      ".sagodent-zone-hero",
      ".sagodent-zone-dark",
      ".sagodent-zone-light",
      ".sagodent-zone-blue",
      ".sagodent-zone-black",
      "blockquote",
      "footer",
    ].join(",");

    const fallbackZoneSelector = [
      ".section",
      "section",
      "article",
      "blockquote",
      "footer",
    ].join(",");

    function setMenu(open) {
      const nextOpen = Boolean(open);
      const wasOpen = menuOpen;

      /*
       * Mobile/tablet: khóa vị trí trang TRƯỚC khi thêm class mở menu.
       * Desktop: không khóa để giữ đúng logic sticky/Lenis hiện tại.
       */
      if (nextOpen && !wasOpen) {
        lockMobilePageScroll();
      }

      menuOpen = nextOpen;

      header.classList.toggle("--sgd-menu-open", menuOpen);
      panel.classList.toggle("--sgd-open", menuOpen);
      backdrop.classList.toggle("--sgd-open", menuOpen);
      document.documentElement.classList.toggle(
        "--sgd-sagodent-menu-open",
        menuOpen,
      );

      button.setAttribute("aria-expanded", String(menuOpen));
      panel.setAttribute("aria-hidden", String(!menuOpen));
      backdrop.setAttribute("aria-hidden", String(!menuOpen));

      if (!menuOpen && wasOpen) {
        unlockMobilePageScroll();
      } else if (menuOpen && !isMobileMenuMode() && window.sagodentLenis) {
        /* Desktop vẫn giữ cuộn trang/Lenis như logic cũ. */
        if (typeof window.sagodentLenis.resize === "function") {
          window.sagodentLenis.resize();
        }
        if (typeof window.sagodentLenis.start === "function") {
          window.sagodentLenis.start();
        }
      }

      /* Giữ đúng màu/tone hiện tại khi drawer vừa mở. */
      applyTheme(currentZone || findZoneUnderHeader());
      requestUpdate();
    }

    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      setMenu(!menuOpen);
    });

    backdrop.addEventListener("click", function () {
      setMenu(false);
    });

    function scrollToContent(link) {
      const href = link.getAttribute("href");
      if (!href || href.charAt(0) !== "#") return false;

      const target = document.querySelector(href);
      if (!target) return false;

      const offset = -Math.round(header.getBoundingClientRect().height);
      setMenu(false);

      window.requestAnimationFrame(function () {
        if (
          window.sagodentLenis &&
          typeof window.sagodentLenis.scrollTo === "function"
        ) {
          window.sagodentLenis.scrollTo(target, {
            offset: offset,
            duration: 1.05,
            force: true,
          });
        } else {
          const top =
            target.getBoundingClientRect().top + window.scrollY + offset;
          window.scrollTo({ top: top, behavior: "smooth" });
        }

        if (
          window.history &&
          typeof window.history.replaceState === "function"
        ) {
          window.history.replaceState(null, "", href);
        }
      });

      return true;
    }

    panel.addEventListener("click", function (event) {
      const link = event.target.closest("a[href^='#']");
      if (!link) return;

      if (scrollToContent(link)) {
        event.preventDefault();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menuOpen) setMenu(false);
    });

    function rootVariable(name, fallback) {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();

      return value || fallback;
    }

    function isTransparent(color) {
      if (!color) return true;

      const normalized = String(color).replace(/\s+/g, "").toLowerCase();

      return (
        normalized === "transparent" ||
        normalized === "rgba(0,0,0,0)" ||
        normalized.endsWith(",0)")
      );
    }

    function classColor(zone) {
      if (!zone) return null;

      if (zone.matches(".id4,.sagodent-zone-black")) {
        return rootVariable("--near-black", "#050708");
      }

      if (
        zone.matches(
          ".difference,.difference-head,.difference-row,.contact,blockquote,footer,.sagodent-zone-blue",
        )
      ) {
        return rootVariable("--blue", "#075d98");
      }

      if (zone.matches(".hero,.sagodent-zone-hero,.sagodent-zone-dark")) {
        return rootVariable("--hero", "#021b2c");
      }

      if (
        zone.matches(".intro,.doctor,.courses,.library,.sagodent-zone-light")
      ) {
        return rootVariable("--white", "#ffffff");
      }

      return null;
    }

    function computedBackground(element) {
      if (!element) return null;

      const style = getComputedStyle(element);
      const customColor =
        style.getPropertyValue("--menu-section-bg").trim() ||
        style.getPropertyValue("--sagodent-menu-bg").trim();

      if (customColor) return customColor;
      if (!isTransparent(style.backgroundColor)) return style.backgroundColor;

      return null;
    }

    function resolveZoneColor(zone) {
      if (!zone) return rootVariable("--hero", "#021b2c");

      const declared =
        zone.getAttribute("data-menu-bg") ||
        zone.getAttribute("data-sagodent-menu-bg");

      if (declared && declared.trim()) return declared.trim();

      const mapped = classColor(zone);
      if (mapped) return mapped;

      const ownColor = computedBackground(zone);
      if (ownColor) return ownColor;

      /* Flatsome thường đặt màu nền thật trong lớp con này. */
      const backgroundLayers = zone.querySelectorAll(
        ":scope > .section-bg, :scope > .bg-fill, :scope > .fill, .section-bg, .bg-fill, .fill",
      );

      for (const layer of backgroundLayers) {
        const layerColor = computedBackground(layer);
        if (layerColor) return layerColor;
      }

      let parent = zone.parentElement;

      while (
        parent &&
        parent !== document.body &&
        parent !== document.documentElement
      ) {
        const parentColor = computedBackground(parent);
        if (parentColor) return parentColor;
        parent = parent.parentElement;
      }

      return rootVariable("--white", "#ffffff");
    }

    function parseRgb(color) {
      const value = String(color || "").trim();

      if (value.startsWith("#")) {
        const source = value.slice(1);
        const hex =
          source.length === 3
            ? source
                .split("")
                .map(function (character) {
                  return character + character;
                })
                .join("")
            : source.slice(0, 6);

        if (!/^[0-9a-f]{6}$/i.test(hex)) return null;

        return [
          parseInt(hex.slice(0, 2), 16),
          parseInt(hex.slice(2, 4), 16),
          parseInt(hex.slice(4, 6), 16),
        ];
      }

      const values = value.match(/[\d.]+/g);
      if (!values || values.length < 3) return null;

      return [Number(values[0]), Number(values[1]), Number(values[2])];
    }

    function rgbaFromColor(color, alpha, fallback) {
      const rgb = parseRgb(color);
      if (!rgb) return fallback;

      const safeAlpha = Math.min(1, Math.max(0, Number(alpha)));
      return (
        "rgba(" +
        rgb[0] +
        ", " +
        rgb[1] +
        ", " +
        rgb[2] +
        ", " +
        safeAlpha +
        ")"
      );
    }

    function isDarkColor(color) {
      const rgb = parseRgb(color);
      if (!rgb) return true;

      const luminance =
        (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;

      return luminance < 0.58;
    }

    function resolveZoneTone(zone, color) {
      if (!zone) return "dark";

      const declared =
        zone.getAttribute("data-menu-tone") ||
        zone.getAttribute("data-sagodent-menu-tone");

      if (declared) {
        const tone = declared.toLowerCase().trim();
        if (tone === "dark" || tone === "light") return tone;
      }

      if (
        zone.matches(
          ".hero,.difference,.difference-head,.difference-row,.id4,.contact,blockquote,footer,.sagodent-zone-hero,.sagodent-zone-dark,.sagodent-zone-blue,.sagodent-zone-black",
        )
      ) {
        return "dark";
      }

      if (
        zone.matches(".intro,.doctor,.courses,.library,.sagodent-zone-light")
      ) {
        return "light";
      }

      return isDarkColor(color) ? "dark" : "light";
    }

    function probeY() {
      const rect = header.getBoundingClientRect();

      return Math.min(
        Math.max(rect.bottom + 4, 1),
        Math.max(1, window.innerHeight - 1),
      );
    }

    function zoneFromElement(element) {
      if (!element) return null;

      if (
        element === header ||
        header.contains(element) ||
        element === panel ||
        panel.contains(element) ||
        element === backdrop ||
        element === progress
      ) {
        return null;
      }

      const explicit = element.closest(explicitZoneSelector);
      if (explicit) return explicit;

      return element.closest(fallbackZoneSelector);
    }

    function findZoneUnderHeader() {
      const y = probeY();
      const xRatios = [0.15, 0.5, 0.85];
      const candidates = [];

      xRatios.forEach(function (ratio) {
        const x = Math.min(
          Math.max(window.innerWidth * ratio, 1),
          Math.max(1, window.innerWidth - 1),
        );

        document.elementsFromPoint(x, y).forEach(function (element) {
          const zone = zoneFromElement(element);

          if (zone && !candidates.includes(zone)) {
            candidates.push(zone);
          }
        });
      });

      if (candidates.length) {
        const explicit = candidates.find(function (zone) {
          return zone.matches(explicitZoneSelector);
        });

        return explicit || candidates[0];
      }

      /* Dự phòng Safari/mobile sau khi đổi hướng màn hình. */
      const zones = Array.from(
        document.querySelectorAll(
          explicitZoneSelector + "," + fallbackZoneSelector,
        ),
      ).filter(function (zone) {
        return (
          zone !== header &&
          !header.contains(zone) &&
          zone !== panel &&
          !panel.contains(zone)
        );
      });

      return (
        zones.find(function (zone) {
          const rect = zone.getBoundingClientRect();
          return rect.top <= y && rect.bottom > y;
        }) ||
        currentZone ||
        document.querySelector(".hero,.section,section")
      );
    }

    function setThemeProperties(element, properties) {
      Object.keys(properties).forEach(function (name) {
        element.style.setProperty(name, properties[name]);
      });
    }

    function applyTheme(zone) {
      if (zone) currentZone = zone;

      const activeZone = currentZone;
      const background = resolveZoneColor(activeZone);
      const tone = resolveZoneTone(activeZone, background);
      const dark = tone === "dark";

      const properties = {
        "--menu-section-bg": background,

        /* Liquid Glass đổi tint theo đúng màu section đang nằm dưới header. */
        "--menu-glass-bg": rgbaFromColor(
          background,
          dark ? 0.7 : 0.68,
          dark ? "rgba(2, 27, 44, 0.70)" : "rgba(255, 255, 255, 0.68)",
        ),
        "--menu-panel-glass-bg": rgbaFromColor(
          background,
          dark ? 0.86 : 0.82,
          dark ? "rgba(2, 27, 44, 0.86)" : "rgba(255, 255, 255, 0.82)",
        ),
        "--menu-glass-highlight": dark
          ? "rgba(255, 255, 255, 0.14)"
          : "rgba(255, 255, 255, 0.62)",
        "--menu-foreground": dark ? "#ffffff" : "#075d98",
        "--menu-border": dark
          ? "rgba(255, 255, 255, 0.18)"
          : "rgba(7, 93, 152, 0.18)",
        "--menu-hover": dark
          ? "rgba(255, 255, 255, 0.08)"
          : "rgba(7, 93, 152, 0.07)",
      };

      setThemeProperties(document.documentElement, properties);
      setThemeProperties(header, properties);
      setThemeProperties(panel, properties);

      [header, panel].forEach(function (element) {
        element.classList.toggle("--sgd-menu-tone-dark", dark);
        element.classList.toggle("--sgd-menu-tone-light", !dark);
        element.classList.toggle(
          "--sgd-on-blue",
          Boolean(
            activeZone &&
            activeZone.matches(
              ".difference,.difference-head,.difference-row,.contact,.sagodent-zone-blue",
            ),
          ),
        );
        element.classList.toggle(
          "--sgd-on-black",
          Boolean(
            activeZone && activeZone.matches(".id4,.sagodent-zone-black"),
          ),
        );
      });

      header.classList.toggle("--sgd-scrolled", window.scrollY > 20);
    }

    function updateProgress() {
      const pageHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      );
      const maxScroll = Math.max(0, pageHeight - window.innerHeight);
      const value =
        maxScroll > 0
          ? Math.min(1, Math.max(0, window.scrollY / maxScroll))
          : 0;

      document.documentElement.style.setProperty("--scroll", String(value));
    }

    function updateMenu() {
      updateQueued = false;
      applyTheme(findZoneUnderHeader());
      updateProgress();
    }

    function requestUpdate() {
      if (updateQueued) return;
      updateQueued = true;
      window.requestAnimationFrame(updateMenu);
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener(
      "resize",
      function () {
        /* Nếu đổi breakpoint khi menu đang mở, đồng bộ lại trạng thái khóa cuộn. */
        if (menuOpen) {
          if (isMobileMenuMode()) {
            lockMobilePageScroll();
          } else {
            unlockMobilePageScroll();
          }
        }
        requestUpdate();
      },
      { passive: true },
    );
    window.addEventListener("orientationchange", requestUpdate, {
      passive: true,
    });
    window.addEventListener("load", requestUpdate, { once: true });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(requestUpdate);
    }

    if ("ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver(requestUpdate);
      resizeObserver.observe(document.documentElement);
    }

    /* Chỉ theo dõi node mới; không theo dõi class/style để tránh vòng lặp. */
    if ("MutationObserver" in window) {
      const mutationObserver = new MutationObserver(requestUpdate);
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    setMenu(false);
    updateMenu();

    window.setTimeout(requestUpdate, 120);
    window.setTimeout(requestUpdate, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSagodentMenu, {
      once: true,
    });
  } else {
    initSagodentMenu();
  }
})();
