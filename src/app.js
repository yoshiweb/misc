document.getElementById("fetch-rss").addEventListener("click", function () {
    const url = document.getElementById("rss-url").value;
    fetchRssFeed(url);
});

async function fetchRssFeed(url) {
    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
    const data = await response.json();

    if (data.status === "ok") {
        displayFeed(data.items);
    } else {
        alert("Error fetching RSS feed");
    }
}

function displayFeed(items) {
    const content = document.getElementById("rss-feed-content");
    content.innerHTML = "";

    items.forEach(item => {
        const entry = document.createElement("div");
        entry.innerHTML = `
            <h2><a href="${item.link}" target="_blank">${item.title}</a></h2>
            <p>${item.description}</p>
        `;
        content.appendChild(entry);
    });
}
