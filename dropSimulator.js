// dropSimulator.ts
// ─── Globals ─────────────────────────────────────────────────────────────────
const bossData = {};
let currentCounts = [];
let activeDrops = [];
let activeProbs = [];
let autoKillTimer = null;
const bossSelect = document.getElementById('bossSelect');
const killsInput = document.getElementById('kills');
const sumEl = document.getElementById('sumGE');
const tooltip = document.getElementById('tooltip');
const slayerTaskToggle = document.getElementById('slayerTaskToggle');
const slayerTaskContainer = document.getElementById('slayerTaskContainer');
const wildernessToggle = document.getElementById('wildernessToggle');
const wildernessToggleContainer = document.getElementById('wildernessToggleContainer');
// ─── Add “Add Monster…” option to the dropdown ───────────────────────────────
const addOpt = new Option("+ Add Monster...", "__add");
bossSelect.add(addOpt);
// ─── Fetch & Parse ────────────────────────────────────────────────────────────
async function fetchDrops(page) {
    if (bossData[page])
        return;
    const url = `https://runescape.wiki/api.php?action=parse&format=json`
        + `&page=${encodeURIComponent(page)}&prop=text&onlypst=1&formatversion=2`;
    const resp = await fetch(url);
    const data = await resp.json();
    bossData[page] = parseDropsFromHTML(data.parse.text);
    // normalize all rates
    for (const cat of ['normal', 'wilderness']) {
        for (const drop of bossData[page][cat]) {
            drop.rateParts = drop.rateParts.map(normalizeRatePart);
        }
    }
}
function normalizeRatePart(raw) {
    let s = raw.replace(/\u00A0/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/,/g, '')
        .replace(/^~/, '')
        .trim();
    const p = s.match(/^([\d.]+)%$/);
    if (p)
        return `${Math.round(parseFloat(p[1]))}%`;
    const o = s.match(/^1\/(\d+(?:\.\d+)?)$/);
    if (o)
        return `1/${Math.ceil(parseFloat(o[1]))}`;
    const m = s.match(/^(\d+)\s*[×x]\s*(\d+)\/(\d+)$/i);
    if (m) {
        const numer = parseInt(m[2], 10), denom = parseInt(m[3], 10);
        return `1/${Math.ceil(denom / numer)}`;
    }
    if (/always/i.test(s))
        return 'Always';
    if (/very rare/i.test(s))
        return '1/500';
    if (/common/i.test(s))
        return '1/3';
    if (/uncommon/i.test(s))
        return '1/30';
    if (/rare/i.test(s))
        return '1/100';
    return s;
}
function findDropsHeading(doc) {
    return Array.from(doc.querySelectorAll('span.mw-headline'))
        .find(h => /drops?|loot/i.test(h.textContent || '')) || null;
}
function parseDropsFromHTML(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const normal = [], gemRare = [], wilderness = [];
    const heading = findDropsHeading(doc);
    if (!heading)
        return { normal, gemRare, wilderness };
    let node = heading.parentElement.nextElementSibling;
    let cat = 'normal';
    while (node && node.tagName !== 'H2') {
        if (/^H[3-4]$/.test(node.tagName)) {
            const txt = node.textContent || '';
            if (/gem and rare drop table/i.test(txt))
                cat = 'gemRare';
            else if (/wilderness (?:shared )?drop table/i.test(txt))
                cat = 'wilderness';
            else
                cat = 'normal';
        }
        if (node.tagName === 'TABLE') {
            const tbl = node;
            if (tbl.dataset.schema === 'charms')
                extractCharmsTable(tbl, { normal, gemRare, wilderness }[cat]);
            else
                extractTable(tbl, { normal, gemRare, wilderness }[cat]);
        }
        node = node.nextElementSibling;
    }
    return { normal, gemRare, wilderness };
}
// ─── Table Extractors ─────────────────────────────────────────────────────────
function extractTable(tbl, out) {
    tbl.querySelectorAll('tr').forEach((row, i) => {
        if (i === 0)
            return;
        const tds = row.querySelectorAll('td');
        if (tds.length < 5)
            return;
        const name = tds[1].textContent.trim();
        if (!name)
            return;
        if (/^Wilderness shared loot table$/i.test(name))
            return;
        if (/loot table|drop table/i.test(name))
            return;
        // icon
        let iconUrl;
        const imgEl = tds[0].querySelector('img');
        if (imgEl) {
            const src = imgEl.getAttribute('src');
            iconUrl = src.startsWith('http') ? src : 'https://runescape.wiki' + src;
        }
        else {
            const file = name.replace(/’/g, '')
                .replace(/[^A-Za-z0-9\s]/g, '')
                .trim()
                .replace(/\s+/g, '_');
            iconUrl = `https://runescape.wiki/images/${file}.png`;
        }
        let raw = tds[3].textContent.trim()
            .split('–')[0].split('-')[0]
            .replace(/\[.*?\]/g, '').trim();
        if (/always/i.test(raw))
            raw = 'Always';
        else if (/very rare/i.test(raw))
            raw = '1/500';
        else if (/common/i.test(raw))
            raw = '1/3';
        else if (/uncommon/i.test(raw))
            raw = '1/30';
        else if (/rare/i.test(raw))
            raw = '1/100';
        raw = raw.replace(/^(\d+)\.\d+%$/, '$1%');
        out.push({
            name,
            rateParts: raw.split(';').map(p => p.trim()),
            gePrice: tds[4].textContent.trim(),
            iconUrl
        });
    });
}
function extractCharmsTable(tbl, out) {
    const rows = Array.from(tbl.querySelectorAll('tr'));
    const headerRow = rows.find(r => r.querySelectorAll('th').length > 1);
    if (!headerRow)
        return;
    const headerThs = Array.from(headerRow.querySelectorAll('th')).slice(1);
    const charms = headerThs.map(th => {
        const qtySpan = th.querySelector('span[style*="position:absolute"]');
        const qty = parseInt(qtySpan.textContent.trim(), 10);
        const img = th.querySelector('img');
        const src = img.getAttribute('src');
        const iconUrl = src.startsWith('http') ? src : 'https://runescape.wiki' + src;
        let name = img.getAttribute('alt') || img.getAttribute('title') || '';
        if (!name) {
            name = src.split('/').pop().split('?')[0]
                .replace(/_/g, ' ').replace(/\.png$/, '');
        }
        return { name, iconUrl, qtyPerDrop: qty };
    });
    let idx = rows.indexOf(headerRow) + 1, dataRow;
    while (idx < rows.length) {
        const tds = rows[idx].querySelectorAll('td');
        if (tds.length >= charms.length) {
            dataRow = rows[idx];
            break;
        }
        idx++;
    }
    if (!dataRow)
        return;
    const cells = Array.from(dataRow.querySelectorAll('td'));
    charms.forEach((ch, i) => {
        let raw = cells[i].textContent.trim().replace(/\[.*?\]/g, '').trim();
        const m = raw.match(/(\d+)[–-](\d+)%/);
        if (m)
            raw = `${Math.ceil((+m[1] + +m[2]) / 2)}%`;
        raw = raw.replace(/^(\d+)\.\d+%$/, '$1%');
        if (/always/i.test(raw))
            raw = 'Always';
        else if (/very rare/i.test(raw))
            raw = '1/500';
        else if (/common/i.test(raw))
            raw = '1/3';
        else if (/uncommon/i.test(raw))
            raw = '1/30';
        else if (/rare/i.test(raw))
            raw = '1/100';
        out.push({
            name: charms[i].name,
            rateParts: [raw],
            gePrice: 'Not sold',
            iconUrl: charms[i].iconUrl,
            qtyPerDrop: charms[i].qtyPerDrop
        });
    });
}
// ─── Utils ────────────────────────────────────────────────────────────────────
function parseRate(rt) {
    const c = rt.replace(/\[.*?\]/g, '').replace(/,/g, '').trim().toLowerCase();
    if (c === 'always')
        return 1;
    const p = c.match(/^([\d.]+)%$/);
    if (p)
        return parseFloat(p[1]) / 100;
    const f = c.match(/^(\d+)\/(\d+)$/);
    if (f)
        return +f[1] / +f[2];
    return 0;
}
function parseNumber(s) {
    return parseInt(s.replace(/[, ]+/g, ''), 10) || 0;
}
function computeTooltip(q, p) {
    if (p.includes('–')) {
        const [a, b] = p.split('–').map(parseNumber);
        return `Total: ${(a * q).toLocaleString()}–${(b * q).toLocaleString()} coins`;
    }
    const v = parseNumber(p) * q;
    return p === 'Not sold' ? 'Not sold' : `Total: ${v.toLocaleString()} coins`;
}
// ─── Auto‐kill Helpers ───────────────────────────────────────────────────────
function simulateOneKill() {
    activeProbs.forEach((p, i) => {
        if (Math.random() < p) {
            const dropQty = activeDrops[i].qtyPerDrop || 1;
            currentCounts[i] += dropQty;
        }
    });
}
function prepareAndSimulate(base) {
    currentCounts = base.map(() => 0);
    const kills = +killsInput.value || 0;
    const probs = base.map(d => {
        const idx = (d.rateParts.length > 1 && slayerTaskToggle.checked) ? 1 : 0;
        return parseRate(d.rateParts[idx]);
    });
    for (let i = 0; i < kills; i++) {
        probs.forEach((p, i) => {
            if (p < 1e-9)
                return;
            if (Math.random() < p) {
                const dropQty = base[i].qtyPerDrop || 1;
                currentCounts[i] += dropQty;
            }
        });
    }
}
// ─── Rendering ────────────────────────────────────────────────────────────────
async function renderAll() {
    const page = bossSelect.value;
    if (!page)
        return;
    if (page === '__add') {
        const input = prompt("Paste a RSWiki URL, e.g. https://runescape.wiki/w/Woman")?.trim();
        if (!input || !input.startsWith("https://runescape.wiki/w/")) {
            alert("URL must begin with https://runescape.wiki/w/");
            bossSelect.value = "";
            return;
        }
        let slug = input.slice("https://runescape.wiki/w/".length).split(/[?#]/)[0];
        slug = decodeURIComponent(slug).replace(/\s+/g, "_");
        if (![...bossSelect.options].some(o => o.value === slug)) {
            bossSelect.add(new Option(slug.replace(/_/g, " "), slug), addOpt);
        }
        bossSelect.value = slug;
    }
    await fetchDrops(bossSelect.value);
    const { normal, wilderness } = bossData[bossSelect.value];
    // wilderness toggle
    const hasW = wilderness.length > 0;
    wildernessToggleContainer.style.display = hasW ? 'inline-block' : 'none';
    if (!hasW)
        wildernessToggle.checked = false;
    // slayer‐task toggle
    const combined = normal.concat(wilderness);
    const hasSl = combined.some(d => d.rateParts.length > 1);
    slayerTaskContainer.style.display = hasSl ? 'inline-block' : 'none';
    if (!hasSl)
        slayerTaskToggle.checked = false;
    const activeList = normal.concat(wildernessToggle.checked ? wilderness : []);
    activeDrops = activeList;
    activeProbs = activeList.map(d => {
        const idx = (d.rateParts.length > 1 && slayerTaskToggle.checked) ? 1 : 0;
        return parseRate(d.rateParts[idx]);
    });
    prepareAndSimulate(activeList);
    const container = document.getElementById('tablesContainer');
    container.innerHTML = '';
    function makeSection(title, items, offset) {
        if (!items.length)
            return;
        const h2 = document.createElement('h2');
        h2.textContent = title;
        container.append(h2);
        const tbl = document.createElement('table');
        tbl.setAttribute('data-generated', 'true');
        tbl.innerHTML = `
        <thead>
          <tr><th>Item</th><th>Drop Rate</th><th>GE Price</th><th>Quantity</th></tr>
        </thead>
        <tbody></tbody>
      `;
        const tbody = tbl.querySelector('tbody');
        items.forEach((d, i) => {
            let raw = d.rateParts[(d.rateParts.length > 1 && slayerTaskToggle.checked) ? 1 : 0].replace(/\u00A0/g, ' ')
                .replace(/\s+/g, ' ')
                .replace(/,/g, '')
                .replace(/^~/, '')
                .trim();
            const pm = raw.match(/^([\d.]+)%$/);
            if (pm)
                raw = `${Math.round(parseFloat(pm[1]))}%`;
            else {
                const om = raw.match(/^1\/(\d+(?:\.\d+)?)$/);
                if (om)
                    raw = `1/${Math.ceil(parseFloat(om[1]))}`;
                else {
                    const mm = raw.match(/^(\d+)\s*[×x]\s*(\d+)\/(\d+)$/i);
                    if (mm) {
                        const numer = parseInt(mm[2], 10), denom = parseInt(mm[3], 10);
                        raw = `1/${Math.ceil(denom / numer)}`;
                    }
                }
            }
            if (/always/i.test(raw))
                raw = 'Always';
            else if (/very rare/i.test(raw))
                raw = '1/500';
            else if (/common/i.test(raw))
                raw = '1/3';
            else if (/uncommon/i.test(raw))
                raw = '1/30';
            else if (/rare/i.test(raw))
                raw = '1/100';
            const idx2 = offset + i, qty = currentCounts[idx2];
            const tip = computeTooltip(qty, d.gePrice);
            const iconHtml = d.iconUrl
                ? d.qtyPerDrop && d.qtyPerDrop > 1
                    ? `<span class="charm-container">
                 <img src="${d.iconUrl}" class="drop-icon" alt="${d.name}" />
                 <span class="charmqty">${d.qtyPerDrop}</span>
               </span>`
                    : `<img src="${d.iconUrl}" class="drop-icon" alt="${d.name}" />`
                : d.name;
            const tr = document.createElement('tr');
            tr.innerHTML = `
          <td>${iconHtml}</td>
          <td>${raw}</td>
          <td>${d.gePrice}</td>
          <td class="quantity-cell" data-tooltip="${tip}">${qty}</td>
        `;
            tbody.append(tr);
        });
        container.append(tbl);
    }
    makeSection('Drops', normal, 0);
    makeSection('Wilderness drop table', wildernessToggle.checked ? wilderness : [], normal.length);
    // tooltips
    document.querySelectorAll('td.quantity-cell').forEach(el => {
        const td = el;
        td.onmouseenter = () => { tooltip.textContent = td.dataset.tooltip; tooltip.style.display = 'block'; };
        td.onmouseleave = () => tooltip.style.display = 'none';
        td.onmousemove = (e) => {
            const off = 12, r = tooltip.getBoundingClientRect();
            let x = e.clientX + off;
            if (x + r.width > window.innerWidth)
                x = e.clientX - off - r.width;
            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${e.clientY + off}px`;
        };
    });
    updateUI();
}
// ─── Update UI ────────────────────────────────────────────────────────────────
function updateUI() {
    document.querySelectorAll('td.quantity-cell').forEach((el, idx) => {
        const td = el, q = currentCounts[idx];
        td.textContent = String(q);
        td.dataset.tooltip = computeTooltip(q, activeDrops[idx].gePrice);
    });
    let minT = 0, maxT = 0;
    activeDrops.forEach((d, i) => {
        const q = currentCounts[i];
        if (d.gePrice.includes('–')) {
            const [a, b] = d.gePrice.split('–').map(parseNumber);
            minT += a * q;
            maxT += b * q;
        }
        else {
            const v = parseNumber(d.gePrice) * q;
            minT += v;
            maxT = minT;
        }
    });
    sumEl.textContent = minT === maxT
        ? `Total GE Value: ${minT.toLocaleString()} coins`
        : `Total GE Value: ${minT.toLocaleString()}–${maxT.toLocaleString()} coins`;
}
// ─── Hooks ───────────────────────────────────────────────────────────────────
bossSelect.addEventListener('change', () => { renderAll(); });
document.getElementById('simulate').addEventListener('click', renderAll);
document.getElementById('autoKillToggle').addEventListener('change', e => {
    if (autoKillTimer !== null) {
        clearInterval(autoKillTimer);
        autoKillTimer = null;
    }
    if (e.target.checked) {
        if (!currentCounts.length)
            renderAll();
        autoKillTimer = window.setInterval(() => {
            killsInput.value = String((+killsInput.value || 0) + 1);
            simulateOneKill();
            updateUI();
        }, 20);
    }
});
document.getElementById('reset').addEventListener('click', () => {
    if (autoKillTimer !== null) {
        clearInterval(autoKillTimer);
        autoKillTimer = null;
    }
    killsInput.value = '0';
    currentCounts = [];
    document.getElementById('tablesContainer').innerHTML = '';
    sumEl.textContent = 'Total GE Value: 0 coins';
});
slayerTaskToggle.addEventListener('change', renderAll);
wildernessToggle.addEventListener('change', renderAll);
