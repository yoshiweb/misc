/* Search and AI crawlers can understand each page's purpose from this JSON-LD. */
(function () {
    const head = document.head;
    if (!head) return;

    const ogUrl = document.querySelector('meta[property="og:url"]')?.content;
    const canonical = document.querySelector('link[rel="canonical"]')?.href || ogUrl || window.location.href.split('#')[0];
    const title = document.querySelector('meta[property="og:title"]')?.content || document.title;
    const description = document.querySelector('meta[name="description"]')?.content
        || document.querySelector('meta[property="og:description"]')?.content || '';
    if (description && !document.querySelector('meta[name="description"]')) {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = description;
        head.appendChild(meta);
    }
    if (!document.querySelector('link[rel="canonical"]') && canonical.startsWith('https://misc.yoshiweb.net/')) {
        const link = document.createElement('link');
        link.rel = 'canonical';
        link.href = canonical;
        head.appendChild(link);
    }
    const site = {
        '@type': 'Organization',
        '@id': 'https://misc.yoshiweb.net/#organization',
        name: 'misc.yoshiweb.net',
        url: 'https://misc.yoshiweb.net/'
    };

    function addSchema(schema) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify({ '@context': 'https://schema.org', ...schema });
        head.appendChild(script);
    }

    if (canonical === 'https://misc.yoshiweb.net/' || canonical === 'https://misc.yoshiweb.net') {
        addSchema({
            '@type': 'WebSite',
            '@id': 'https://misc.yoshiweb.net/#website',
            name: 'misc.yoshiweb.net',
            url: 'https://misc.yoshiweb.net/',
            description,
            publisher: { '@id': 'https://misc.yoshiweb.net/#organization' }
        });
    } else if (canonical.includes('/games/')) {
        addSchema({
            '@type': 'VideoGame',
            name: title,
            description,
            url: canonical,
            image: document.querySelector('meta[property="og:image"]')?.content,
            applicationCategory: 'Game',
            gamePlatform: 'Web browser',
            publisher: site
        });
    } else if (canonical.includes('/tools/')) {
        addSchema({
            '@type': 'WebApplication',
            name: title,
            description,
            url: canonical,
            image: document.querySelector('meta[property="og:image"]')?.content,
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Any',
            browserRequirements: 'Requires JavaScript-enabled web browser',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
            publisher: site
        });
    }

    const parts = new URL(canonical).pathname.split('/').filter(Boolean);
    if (parts.length) {
        const items = [{ '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://misc.yoshiweb.net/' }];
        parts.forEach((part, index) => {
            const item = 'https://misc.yoshiweb.net/' + parts.slice(0, index + 1).join('/') + '/';
            items.push({
                '@type': 'ListItem',
                position: index + 2,
                name: index === parts.length - 1 ? title : part,
                item
            });
        });
        addSchema({ '@type': 'BreadcrumbList', itemListElement: items });
    }
})();
