import { loadHeaderFooter} from "./utils.mjs";

async function initMain() {
    await loadHeaderFooter();
    /// for the number of visits
    const visitsDisplay = document.querySelector(".visits");   //   Initialize display element variable
    const lastVisitDisplay = document.querySelector(".last-visit"); // Initialize last visit display

    let numVisits = Number(localStorage.getItem("numVisits-ls")) || 0;   //  Get the stored VALUE for the numVisits-ls KEY in localStorage if it exists.
    let lastVisit = localStorage.getItem("lastVisit-ls"); //get the stored value for the last visit

    numVisits++;  // increment the number of visits by one.
    // Determine if this is the first visit or display the number of visits. We wrote this example backwards in order for you to think deeply about the logic.
    if (visitsDisplay) {
        if (numVisits === 1) {
            visitsDisplay.textContent = `This is your first visit. 🥳 Welcome!`;
        }
        else {
            visitsDisplay.textContent = numVisits;
        }
    }

    // Display last visit
    if (lastVisitDisplay) {
        if (lastVisit) {
            const lastVisitDate = new Date(lastVisit);
            const now = new Date();
            const diffTime = now - lastVisitDate; // in ms
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                lastVisitDisplay.textContent = "Your last visit was today.";
            } else if (diffDays === 1) {
                lastVisitDisplay.textContent = "Your last visit was yesterday.";
            } else {
                lastVisitDisplay.textContent = `Your last visit was ${diffDays} days ago.`;
            }
        } else {
            lastVisitDisplay.textContent = "This is your first recorded visit.";
        }
    }

    localStorage.setItem("numVisits-ls", numVisits);  // store the new visit total into localStorage, key=numVisits-ls
    localStorage.setItem("lastVisit-ls", new Date().toISOString());  // store the current date for the last visit

    //for the modal
    const searchSongsBtn = document.getElementById("search-songs-btn");
    const searchArtistsBtn = document.getElementById("search-artists-btn");
    const modal = document.getElementById("search-modal");
    const modalTitle = modal?.querySelector("h2");
    const closeBtn = modal?.querySelector(".close-btn");

    if (searchSongsBtn && searchArtistsBtn && modal && closeBtn) {
    const openModal = (title) => {
      modal.style.display = "flex";
      modalTitle.textContent = title;
    };

    searchSongsBtn.addEventListener("click", () => openModal("Search Songs"));
    searchArtistsBtn.addEventListener("click", () => openModal("Search Artists"));

    closeBtn.addEventListener("click", () => (modal.style.display = "none"));

    window.addEventListener("click", (event) => {
      if (event.target === modal) modal.style.display = "none";
    });
  }

}
document.addEventListener("DOMContentLoaded", initMain);