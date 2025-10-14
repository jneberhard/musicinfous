//saves the user data
export function saveUserData(name, favoriteGenre = "", lastSongTerm = "", lastArtistTerm = "") {
    const data = {
        name, favoriteGenre, lastSongTerm, lastArtistTerm,
    };
    localStorage.setItem("userData", JSON.stringify(data));
}

    //get user data
    export function getUserData() {
    const stored = localStorage.getItem("userData");
    if (!stored) return null;
    return JSON.parse(stored);
}

    //ask for name and favorite genre if there is not one already stored
    export function promptForname() {
    const userData = getUserData();
    if (!userData?.name) {
        const name = prompt("Enter your name:");
        const favoriteGenre = prompt("What is your favorite music genre?");
        if (name) {
        saveUserData(name,favoriteGenre || "Unknown", "", "");
        return name;
        }
        return null;
    }
    return userData.name;
}

export function displayUserData() {
    const data = getUserData();
    if (!data) return;

    const greeting = document.getElementById("greeting");
    const genreEl = document.getElementById("favorite-genre");
    const songEl = document.getElementById("last-song-search");
    const artistEl = document.getElementById("last-artist-search");
    

    if (greeting) greeting.textContent = `Welcome back, ${data.name}!`;
    if (genreEl) genreEl.textContent = data.favoriteGenre
        ? `Favorite Genre: ${data.favoriteGenre}`
        : `Favorite Genre: Not set yet`;
    if (songEl) songEl.textContent = data.lastSongTerm 
        ? `Last Searched Song: ${data.lastSongTerm}`
        : "";
    if (artistEl) artistEl.textContent = data.lastArtistTerm 
        ? `Last Searched Artist: ${data.lastArtistTerm}`
        : "";
    }

export function updateLastSongSearch(term) {
    const data = getUserData();
    if (!data) return;
    data.lastSongTerm = term;
    saveUserData(data.name, data.favoriteGenre, data.lastSongTerm, data.lastArtistTerm);
}

export function updateLastArtistSearch(term) {
    const data = getUserData();
    if (!data) return;
    data.lastArtistTerm = term;
    saveUserData(data.name, data.favoriteGenre, data.lastSongTerm, data.lastArtistTerm);
}