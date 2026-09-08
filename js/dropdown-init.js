  document.addEventListener("DOMContentLoaded", () => {
    const fullNameBox = document.getElementById("fullNameBox");
    const fullNameLabel = document.getElementById("fullNameLabel");
    const fullNameDropdown = document.getElementById("fullNameDropdown");
    const fullNameInput = document.getElementById("fullName");

    fullNameDropdown.querySelectorAll(".option").forEach(opt => {
      opt.innerHTML = `<span class="opt-name">${opt.dataset.value}</span><span class="taken-label">Tayyor</span><span class="check"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12.5L10 17.5L19.5 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
      opt.addEventListener("click", (e) => {
        if (opt.hidden || takenNames.has(opt.dataset.value)) {
          e.stopPropagation();
          return;
        }
        fullNameDropdown.querySelectorAll(".option").forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
        fullNameInput.value = opt.dataset.value;
        fullNameLabel.textContent = opt.dataset.value;
        fullNameBox.classList.remove("placeholder");
        fullNameDropdown.classList.remove("show");
        fullNameBox.classList.remove("open");
        const err = document.getElementById("stepError");
        if (err) err.textContent = "";
      });
    });

    fullNameBox.addEventListener("click", (e) => {
      e.stopPropagation();
      fullNameDropdown.classList.toggle("show");
      fullNameBox.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (!fullNameBox.contains(e.target) && !fullNameDropdown.contains(e.target)) {
        fullNameDropdown.classList.remove("show");
        fullNameBox.classList.remove("open");
      }
    });
  });
