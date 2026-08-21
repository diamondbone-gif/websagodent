/* Sagodent Lenis setup — only this file controls smooth scrolling. */
(function initSagodentLenis() {
  "use strict";

  if (typeof window.Lenis !== "function") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  /* Prevent duplicate Lenis instances when the script is loaded again. */
  if (
    window.sagodentLenis &&
    typeof window.sagodentLenis.destroy === "function"
  ) {
    window.sagodentLenis.destroy();
  }

  /* Avoid native smooth-scroll and Lenis easing running at the same time. */
  document.documentElement.style.scrollBehavior = "auto";

  const lenis = new window.Lenis({
    autoRaf: true,
    autoResize: true,

    /* Smooth mouse-wheel and trackpad movement without excessive delay. */
    smoothWheel: true,
    lerp: 0.085,
    wheelMultiplier: 0.9,

    /* Keep touch scrolling native and stable on phones/tablets. */
    syncTouch: false,
    touchMultiplier: 1,

    orientation: "vertical",
    gestureOrientation: "vertical",
    overscroll: true,
    stopInertiaOnNavigate: true,

    anchors: {
      offset: -100,
      lerp: 0.09,
    },

    /* Soften only unusually large mouse-wheel steps; trackpads stay natural. */
    virtualScroll: function (input) {
      if (input.event && input.event.ctrlKey) return false;

      if (Math.abs(input.deltaY) > 100) {
        input.deltaY *= 0.82;
      }

      return true;
    },
  });

  window.sagodentLenis = lenis;

  /* Refresh dimensions after fonts and images finish affecting page height. */
  window.addEventListener(
    "load",
    function () {
      lenis.resize();
    },
    { once: true, passive: true },
  );

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      lenis.resize();
    });
  }

  /* Do not keep the scroll animation active in a hidden browser tab. */
  document.addEventListener(
    "visibilitychange",
    function () {
      if (document.hidden) {
        lenis.stop();
      } else {
        lenis.resize();
        lenis.start();
      }
    },
    { passive: true },
  );
})();
