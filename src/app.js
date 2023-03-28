document.getElementById("fetch-rss").addEventListener("click", function () {
    const url = document.getElementById("rss-url").value;
    localStorage.setItem("rss-url", url);
    fetchRssFeed(url);
});

// ページが読み込まれたときにローカルストレージからURLを取得し、存在する場合はRSSフィードを取得する
document.addEventListener("DOMContentLoaded", function () {
    const storedUrl = localStorage.getItem("rss-url");
    if (storedUrl) {
        document.getElementById("rss-url").value = storedUrl;
        fetchRssFeed(storedUrl);
    }
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
