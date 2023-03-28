document.getElementById("fetch-rss").addEventListener("click", function () {
    const url = document.getElementById("rss-url").value;
    addRssFeed(url);
});

document.addEventListener("DOMContentLoaded", function () {
    const storedUrls = getStoredUrls();
    if (storedUrls) {
        storedUrls.forEach(url => {
            fetchRssFeed(url);
        });
    }
});

function getStoredUrls() {
    return JSON.parse(localStorage.getItem("rss-urls")) || [];
}

function addRssFeed(url) {
    const storedUrls = getStoredUrls();
    if (!storedUrls.includes(url)) {
        storedUrls.push(url);
        localStorage.setItem("rss-urls", JSON.stringify(storedUrls));
        fetchRssFeed(url);
    }
}

async function fetchRssFeed(url) {
    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
    const data = await response.json();

    if (data.status === "ok") {
        displayFeed(url, data.items);
    } else {
        alert("Error fetching RSS feed");
    }
}

function displayFeed(url, items) {
    const columnsContainer = document.getElementById("rss-feed-columns");

    const column = document.createElement("div");
    column.classList.add("rss-feed-column");

    const title = document.createElement("h2");
    title.innerText = url;
    column.appendChild(title);

    items.forEach(item => {
        const entry = document.createElement("div");
        entry.innerHTML = `
            <h3><a href="${item.link}" target="_blank">${item.title}</a></h3>
            <p>${item.description}</p>
        `;
        column.appendChild(entry);
    });

    columnsContainer.appendChild(column);
}

