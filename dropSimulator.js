// dropSimulator.ts
// ─── Globals ─────────────────────────────────────────────────────────────────
const bossData = {};
let currentCounts = [];
let activeDrops = [];
let activeProbs = [];
let autoKillTimer = null;
let triskelionGroup = [];
let triskelionCycle = 0;
const bossSelect = document.getElementById('bossSelect');
const killsInput = document.getElementById('kills');
const sumEl = document.getElementById('sumGE');
const tooltip = document.getElementById('tooltip');
const slayerTaskToggle = document.getElementById('slayerTaskToggle');
const slayerTaskContainer = document.getElementById('slayerTaskContainer');
const wildernessToggle = document.getElementById('wildernessToggle');
const wildernessToggleContainer = document.getElementById('wildernessToggleContainer');
const luckToggle = document.getElementById('luckToggle');
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
    for (const cat of ['normal', 'wilderness']) {
        for (const d of bossData[page][cat]) {
            d.rateParts = d.rateParts.map(normalizeRatePart);
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
    if (/uncommon/i.test(s))
        return '1/30';
    if (/common/i.test(s))
        return '1/3';
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
        // ─── 1) parse the quantity column exactly once ─────────────────────────
        let qtyMin, qtyMax;
        const qtxt = tds[2].textContent.trim(); // e.g. "35–45" or "20"
        const qm = qtxt.match(/^(\d+)(?:[–-](\d+))?$/);
        if (qm) {
            qtyMin = parseInt(qm[1], 10);
            qtyMax = qm[2] ? parseInt(qm[2], 10) : qtyMin;
        }
        // ─── 2) force coins → always exactly 1 per drop event ─────────────────
        let qtyPerDrop;
        if (/^Coins\b/i.test(name)) {
            qtyPerDrop = 1;
        }
        // ─── 3) grab the icon URL ───────────────────────────────────────────────
        const imgEl = tds[0].querySelector('img');
        let icon;
        if (imgEl) {
            const src = imgEl.getAttribute('src');
            icon = src.startsWith('http') ? src : 'https://runescape.wiki' + src;
        }
        // ─── 4) pull & fallback the raw drop‐rate text ──────────────────────────
        let raw = tds[3].textContent.trim()
            .split('–')[0].split('-')[0]
            .replace(/\[.*?\]/g, '').trim();
        // … your existing textual‐fallbacks here (Always, very rare, etc.) …
        // ─── 5) build the RawDrop object ───────────────────────────────────────
        out.push({
            name,
            rateParts: raw.split(';').map(p => p.trim()),
            gePrice: tds[4].textContent.trim(),
            icon, // for the picture
            qtyPerDrop, // fixed quantity (coins or charms)
            qtyMin, // lower end of the range
            qtyMax // upper end
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
        else if (/uncommon/i.test(raw))
            raw = '1/30';
        else if (/common/i.test(raw))
            raw = '1/3';
        else if (/rare/i.test(raw))
            raw = '1/100';
        out.push({
            name: ch.name,
            rateParts: [raw],
            gePrice: 'Not sold',
            icon: ch.iconUrl,
            qtyPerDrop: ch.qtyPerDrop
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
// ─── Utils ────────────────────────────────────────────────────────────────────
/**
 * q       = total items you’ve accumulated
 * p       = GE price string (e.g. "222 400" or "Not sold")
 * perDrop = the number of items dropped per roll (e.g. 40 for Hydrix bolt tips)
 * min/max = the min/max for ranged drops (if any)
 */
function computeTooltip(d, q) {
    // parse the same way: price or range?
    let minPrice, maxPrice;
    if (d.gePrice.includes('–')) {
        [minPrice, maxPrice] = d.gePrice.split('–').map(parseNumber);
    }
    else {
        minPrice = maxPrice = parseNumber(d.gePrice);
    }
    // items per drop
    const perDrop = d.qtyPerDrop != null
        ? d.qtyPerDrop
        : (d.qtyMin != null ? d.qtyMin : 1);
    // price per one item
    const unitMin = minPrice / perDrop;
    const unitMax = maxPrice / perDrop;
    // total for q items
    const totalMin = Math.round(unitMin * q);
    const totalMax = Math.round(unitMax * q);
    if (totalMin === totalMax) {
        return `Total: ${totalMin.toLocaleString()} coins`;
    }
    else {
        return `Total: ${totalMin.toLocaleString()}–${totalMax.toLocaleString()} coins`;
    }
}
// ─── Auto‑kill Helpers ────────────────────────────────────────────────────────
function simulateOneKill() {
    // triskelion cycling:
    if (triskelionGroup.length) {
        const idx0 = triskelionGroup[0];
        const p = activeProbs[idx0];
        if (Math.random() < p) {
            const which = triskelionGroup[triskelionCycle % triskelionGroup.length];
            const d = activeDrops[which];
            const qty = d.qtyPerDrop ?? (d.qtyMin !== undefined && d.qtyMax !== undefined
                ? d.qtyMin + Math.floor(Math.random() * (d.qtyMax - d.qtyMin + 1))
                : 1);
            currentCounts[which] += qty;
            triskelionCycle++;
        }
    }
    activeProbs.forEach((p, i) => {
        if (triskelionGroup.includes(i))
            return;
        if (Math.random() < p) {
            const d = activeDrops[i];
            let qty = d.qtyPerDrop ?? 1;
            if (d.qtyMin !== undefined && d.qtyMax !== undefined) {
                qty = d.qtyMin + Math.floor(Math.random() * (d.qtyMax - d.qtyMin + 1));
            }
            currentCounts[i] += qty;
        }
    });
}
function prepareAndSimulate(base) {
    currentCounts = base.map(() => 0);
    triskelionCycle = 0;
    const kills = +killsInput.value || 0;
    const probs = base.map(d => parseRate(d.rateParts.length > 1 && slayerTaskToggle.checked
        ? d.rateParts[1]
        : d.rateParts[0]));
    for (let k = 0; k < kills; k++) {
        simulateOneKill();
    }
}
/**
* Returns [minValue, maxValue] in coins, for this drop `d` and count `q`.
*/
function computeValue(d, q) {
    // 1) parse the GE‐price or range
    let minPrice, maxPrice;
    if (d.gePrice.includes('–')) {
        const [a, b] = d.gePrice.split('–').map(parseNumber);
        minPrice = a;
        maxPrice = b;
    }
    else {
        minPrice = maxPrice = parseNumber(d.gePrice);
    }
    // 2) figure out “items per drop”
    //    - for charms/coins you forced qtyPerDrop=1 (or >1)
    //    - for ranged drops you parsed qtyMin/qtyMax
    const perDrop = d.qtyPerDrop != null
        ? d.qtyPerDrop
        : (d.qtyMin != null ? d.qtyMin : 1);
    // 3) compute unit‐price and multiply by q
    const unitMin = minPrice / perDrop;
    const unitMax = maxPrice / perDrop;
    return [unitMin * q, unitMax * q];
}
// ─── Rendering ────────────────────────────────────────────────────────────────
async function renderAll() {
    let page = bossSelect.value;
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
        page = bossSelect.value = slug;
    }
    await fetchDrops(page);
    const { normal, wilderness } = bossData[page];
    // toggles
    const hasW = wilderness.length > 0;
    wildernessToggleContainer.style.display = hasW ? 'inline-block' : 'none';
    if (!hasW)
        wildernessToggle.checked = false;
    const combined = normal.concat(wilderness);
    const hasSl = combined.some(d => d.rateParts.length > 1);
    slayerTaskContainer.style.display = hasSl ? 'inline-block' : 'none';
    if (!hasSl)
        slayerTaskToggle.checked = false;
    // prepare & simulate
    const activeList = normal.concat(wildernessToggle.checked ? wilderness : []);
    activeDrops = activeList;
    activeProbs = activeList.map(d => parseRate((d.rateParts.length > 1 && slayerTaskToggle.checked)
        ? d.rateParts[1]
        : d.rateParts[0]));
    triskelionGroup = activeDrops
        .map((d, i) => /^Crystal[\s_]triskelion[\s_]fragment/i.test(d.name) ? i : -1)
        .filter(i => i >= 0);
    prepareAndSimulate(activeList);
    // render tables
    const container = document.getElementById('tablesContainer');
    container.innerHTML = '';
    function makeSection(title, items, offset) {
        if (!items.length)
            return;
        // Section header
        const h2 = document.createElement('h2');
        h2.textContent = title;
        container.append(h2);
        // Build table
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
            // ─── Normalize the drop rate text ────────────────────────────────────────
            let raw = (d.rateParts.length > 1 && slayerTaskToggle.checked
                ? d.rateParts[1]
                : d.rateParts[0])
                .replace(/\u00A0/g, ' ')
                .replace(/\s+/g, ' ')
                .replace(/,/g, '')
                .replace(/^~/, '')
                .trim();
            // (… your existing percentage/1/N/A×B/C normalization and textual fallbacks …)
            // ─── Compute badge text ───────────────────────────────────────────────────
            let badge;
            // 1) fixed‑per‑drop items (charms, forced coins, etc.)
            if (d.qtyPerDrop != null && d.qtyPerDrop > 1) {
                badge = String(d.qtyPerDrop);
            }
            // 2) ranged drops
            else if (d.qtyMin !== undefined &&
                d.qtyMax !== undefined &&
                (d.qtyMin > 1 || d.qtyMax > 1)) {
                badge = d.qtyMin === d.qtyMax
                    ? String(d.qtyMin)
                    : `${d.qtyMin}–${d.qtyMax}`;
            }
            // ─── Build the icon HTML ────────────────────────────────────────────────
            let iconHtml;
            if (d.icon) {
                if (badge) {
                    iconHtml = `
                <span class="charm-container">
                  <img src="${d.icon}" class="drop-icon" alt="${d.name}" />
                  <span class="charmqty">${badge}</span>
                </span>`;
                }
                else {
                    iconHtml = `<img src="${d.icon}" class="drop-icon" alt="${d.name}" />`;
                }
            }
            else {
                iconHtml = d.name;
            }
            // ─── Quantity & Tooltip ─────────────────────────────────────────────────
            const idx = offset + i;
            const qty = currentCounts[idx];
            const tip = computeTooltip(d, qty);
            // ─── Assemble row ───────────────────────────────────────────────────────
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
    // initial GE sum
    updateUI();
}
// ─── Update UI ────────────────────────────────────────────────────────────────
function updateUI() {
    // update each quantity cell & its tooltip
    document.querySelectorAll('td.quantity-cell').forEach((el, idx) => {
        const td = el;
        const q = currentCounts[idx];
        // new tooltip signature
        td.dataset.tooltip = computeTooltip(activeDrops[idx], q);
        td.textContent = String(q);
    });
    // now sum them up properly
    let minT = 0, maxT = 0;
    activeDrops.forEach((d, i) => {
        const [vmin, vmax] = computeValue(d, currentCounts[i]);
        minT += vmin;
        maxT += vmax;
    });
    // apply Luck of the Dwarves
    if (luckToggle.checked) {
        minT = Math.round(minT * 1.01);
        maxT = Math.round(maxT * 1.01);
    }
    sumEl.textContent = (minT === maxT)
        ? `Total GE Value: ${minT.toLocaleString()} coins`
        : `Total GE Value: ${minT.toLocaleString()}–${maxT.toLocaleString()} coins`;
}
// ─── Hooks ───────────────────────────────────────────────────────────────────
bossSelect.addEventListener('change', () => renderAll());
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
luckToggle.addEventListener('change', updateUI);
