(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  ready(function () {
    var drawer = document.getElementById("__drawer");
    if (!drawer) return;

    var closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "sl-docs-drawer-close";
    closeButton.setAttribute("aria-label", "Close navigation");
    closeButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z"/></svg>';
    document.body.appendChild(closeButton);

    function closeDrawer() {
      drawer.checked = false;
      drawer.dispatchEvent(new Event("change", { bubbles: true }));
      sync();
    }

    function sync() {
      document.body.classList.toggle("sl-docs-drawer-open", drawer.checked);
    }

    drawer.addEventListener("change", sync);
    closeButton.addEventListener("click", closeDrawer);

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && drawer.checked) {
        event.preventDefault();
        closeDrawer();
      }
    });

    document.addEventListener("click", function (event) {
      var target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('.md-overlay[for="__drawer"]')) {
        closeDrawer();
        return;
      }
      if (drawer.checked && target.closest(".md-nav a")) {
        closeDrawer();
      }
    });

    sync();
  });
})();
