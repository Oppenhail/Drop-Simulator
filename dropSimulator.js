// dropSimulator.ts
// ─── Constants ───────────────────────────────────────────────────────────────
const AUTO_KILL_INTERVAL_MS = 20;
const LUCK_BUFF_MULT = 1.01;
// ─── DOM Helper ───────────────────────────────────────────────────────────────
function $(id) {
    const el = document.getElementById(id);
    if (!el)
        throw new Error(`Missing element #${id}`);
    return el;
}
// ─── Globals & DOM Elements ───────────────────────────────────────────────────
const bossData = {}; // <--- Added missing declaration
const bossSelect = $('bossSelect');
const killsInput = $('kills');
const sumEl = $('sumGE');
const tooltip = $('tooltip');
const slayerTaskToggle = $('slayerTaskToggle');
const slayerTaskContainer = $('slayerTaskContainer');
const wildernessToggle = $('wildernessToggle');
const wildernessToggleContainer = $('wildernessToggleContainer');
const luckToggle = $('luckToggle');
const simulateBtn = $('simulate');
const autoKillToggle = $('autoKillToggle');
const resetBtn = $('reset');
const tablesContainer = $('tablesContainer');
// Add “Add Monster…” option to the dropdown
const addOpt = new Option("+ Add Monster...", "__add");
bossSelect.add(addOpt);
// ─── Parser Utilities ─────────────────────────────────────────────────────────
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
function parseGEPrice(s) {
    const parts = s.split('–').map(str => parseInt(str.replace(/[, ]+/g, ''), 10) || 0);
    return { min: parts[0], max: parts[1] ?? parts[0] };
}
// ─── Fetch & Parse ────────────────────────────────────────────────────────────
async function fetchDrops(page) {
    if (bossData[page])
        return;
    const url = `https://runescape.wiki/api.php?action=parse&format=json`
        + `&page=${encodeURIComponent(page)}&prop=text&onlypst=1&formatversion=2`;
    const resp = await fetch(url);
    const data = await resp.json();
    bossData[page] = parseDropsFromHTML(data.parse.text);
    ['normal', 'wilderness'].forEach(cat => {
        bossData[page][cat].forEach(d => {
            d.rateParts = d.rateParts.map(normalizeRatePart);
        });
    });
}
function findDropsHeading(doc) {
    return Array.from(doc.querySelectorAll('span.mw-headline'))
        .find(h => /drops?|loot/i.test(h.textContent || '')) || null;
}
function parseDropsFromHTML(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const normal = [];
    const gemRare = [];
    const wilderness = [];
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
            if (tbl.dataset.schema === 'charms') {
                extractCharmsTable(tbl, { normal, gemRare, wilderness }[cat]);
            }
            else {
                extractTable(tbl, { normal, gemRare, wilderness }[cat]);
            }
        }
        node = node.nextElementSibling;
    }
    return { normal, gemRare, wilderness };
}
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
        let qtyMin;
        let qtyMax;
        const qtxt = tds[2].textContent.trim();
        const qm = qtxt.match(/^(\d+)(?:[–-](\d+))?$/);
        if (qm) {
            qtyMin = parseInt(qm[1], 10);
            qtyMax = qm[2] ? parseInt(qm[2], 10) : qtyMin;
        }
        let qtyPerDrop;
        if (/^Coins\b/i.test(name))
            qtyPerDrop = 1;
        const imgEl = tds[0].querySelector('img');
        let icon;
        if (imgEl) {
            const src = imgEl.getAttribute('src');
            icon = src.startsWith('http') ? src : 'https://runescape.wiki' + src;
        }
        let raw = tds[3].textContent.trim()
            .split('–')[0].split('-')[0]
            .replace(/\[.*?\]/g, '').trim();
        out.push({
            name,
            rateParts: raw.split(';').map(p => p.trim()),
            gePrice: tds[4].textContent.trim(),
            icon,
            qtyPerDrop,
            qtyMin,
            qtyMax
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
    let dataRow;
    for (let i = rows.indexOf(headerRow) + 1; i < rows.length; i++) {
        const tds = rows[i].querySelectorAll('td');
        if (tds.length >= charms.length) {
            dataRow = rows[i];
            break;
        }
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
// ─── Simulator Class ─────────────────────────────────────────────────────────
class DropSimulator {
    constructor() {
        this.counts = [];
        this.drops = [];
        this.probs = [];
        this.triskelionGroup = [];
        this.triskelionCycle = 0;
        this.killLoopId = null;
    }
    loadDrops(drops) {
        this.drops = drops;
        this.counts = drops.map(() => 0);
        this.probs = drops.map(d => parseRate(d.rateParts.length > 1 && slayerTaskToggle.checked
            ? d.rateParts[1]
            : d.rateParts[0]));
        this.triskelionGroup = drops
            .map((d, i) => /^Crystal[\s_]triskelion[\s_]fragment/i.test(d.name) ? i : -1)
            .filter(i => i >= 0);
        this.triskelionCycle = 0;
    }
    simulateOneKill() {
        if (this.triskelionGroup.length) {
            const idx0 = this.triskelionGroup[0];
            const p = this.probs[idx0];
            if (Math.random() < p) {
                const which = this.triskelionGroup[this.triskelionCycle % this.triskelionGroup.length];
                const d = this.drops[which];
                const qty = d.qtyPerDrop != null
                    ? d.qtyPerDrop
                    : (d.qtyMin != null && d.qtyMax != null
                        ? d.qtyMin + Math.floor(Math.random() * (d.qtyMax - d.qtyMin + 1))
                        : 1);
                this.counts[which] += qty;
                this.triskelionCycle++;
            }
        }
        this.probs.forEach((p, i) => {
            if (this.triskelionGroup.includes(i))
                return;
            if (Math.random() < p) {
                const d = this.drops[i];
                let qty = d.qtyPerDrop ?? 1;
                if (d.qtyMin != null && d.qtyMax != null) {
                    qty = d.qtyMin + Math.floor(Math.random() * (d.qtyMax - d.qtyMin + 1));
                }
                this.counts[i] += qty;
            }
        });
    }
    simulateBatch(kills) {
        for (let i = 0; i < kills; i++) {
            this.simulateOneKill();
        }
    }
    startAutoKill() {
        if (this.killLoopId != null)
            return;
        this.killLoopId = window.setInterval(() => {
            killsInput.value = String((+killsInput.value || 0) + 1);
            this.simulateOneKill();
            updateUI();
        }, AUTO_KILL_INTERVAL_MS);
    }
    stopAutoKill() {
        if (this.killLoopId != null) {
            clearInterval(this.killLoopId);
            this.killLoopId = null;
        }
    }
    getCounts() { return this.counts; }
    getDrops() { return this.drops; }
}
// ─── Tooltip & Value Helpers ─────────────────────────────────────────────────
function computeTooltip(d, q) {
    const { min, max } = parseGEPrice(d.gePrice);
    const perDrop = d.qtyPerDrop != null ? d.qtyPerDrop : (d.qtyMin ?? 1);
    const totalMin = Math.round((min / perDrop) * q);
    const totalMax = Math.round((max / perDrop) * q);
    return totalMin === totalMax
        ? `Total: ${totalMin.toLocaleString()} coins`
        : `Total: ${totalMin.toLocaleString()}–${totalMax.toLocaleString()} coins`;
}
function computeValue(d, q) {
    const { min, max } = parseGEPrice(d.gePrice);
    const perDrop = d.qtyPerDrop != null ? d.qtyPerDrop : (d.qtyMin ?? 1);
    return [(min / perDrop) * q, (max / perDrop) * q];
}
// ─── UI Rendering ─────────────────────────────────────────────────────────────
const simulator = new DropSimulator();
async function renderAll() {
    let page = bossSelect.value;
    if (!page)
        return;
    if (page === "__add") {
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
        page = slug;
    }
    await fetchDrops(page);
    const { normal, wilderness } = bossData[page];
    const hasW = wilderness.length > 0;
    wildernessToggleContainer.style.display = hasW ? "inline-block" : "none";
    if (!hasW)
        wildernessToggle.checked = false;
    const combined = normal.concat(wilderness);
    const hasSl = combined.some(d => d.rateParts.length > 1);
    slayerTaskContainer.style.display = hasSl ? "inline-block" : "none";
    if (!hasSl)
        slayerTaskToggle.checked = false;
    const activeList = normal.concat(wildernessToggle.checked ? wilderness : []);
    simulator.loadDrops(activeList);
    simulator.simulateBatch(+killsInput.value || 0);
    renderTables(normal, wilderness);
    updateUI();
}
function renderTables(normal, wilderness) {
    tablesContainer.innerHTML = "";
    function makeSection(title, items, offset) {
        if (!items.length)
            return;
        const h2 = document.createElement("h2");
        h2.textContent = title;
        tablesContainer.append(h2);
        const tbl = document.createElement("table");
        tbl.setAttribute("data-generated", "true");
        tbl.innerHTML = `
      <thead><tr><th>Item</th><th>Drop Rate</th><th>GE Price</th><th>Quantity</th></tr></thead>
      <tbody></tbody>`;
        const tbody = tbl.querySelector("tbody");
        items.forEach((d, i) => {
            let raw = (d.rateParts.length > 1 && slayerTaskToggle.checked ? d.rateParts[1] : d.rateParts[0])
                .replace(/\u00A0/g, " ")
                .replace(/\s+/g, " ")
                .replace(/,/g, "")
                .replace(/^~/, "")
                .trim();
            let badge;
            if (d.qtyPerDrop != null && d.qtyPerDrop > 1) {
                badge = String(d.qtyPerDrop);
            }
            else if (d.qtyMin != null &&
                d.qtyMax != null &&
                (d.qtyMin > 1 || d.qtyMax > 1)) {
                badge = d.qtyMin === d.qtyMax ? String(d.qtyMin) : `${d.qtyMin}–${d.qtyMax}`;
            }
            const iconHtml = d.icon
                ? badge
                    ? `<span class="charm-container"><img src="${d.icon}" class="drop-icon" alt="${d.name}" /><span class="charmqty">${badge}</span></span>`
                    : `<img src="${d.icon}" class="drop-icon" alt="${d.name}" />`
                : d.name;
            const idx = offset + i;
            const qty = simulator.getCounts()[idx];
            const tip = computeTooltip(simulator.getDrops()[idx], qty);
            const tr = document.createElement("tr");
            tr.innerHTML = `
        <td>${iconHtml}</td>
        <td>${raw}</td>
        <td>${d.gePrice}</td>
        <td class="quantity-cell" data-tooltip="${tip}">${qty}</td>`;
            tbody.append(tr);
        });
        tablesContainer.append(tbl);
    }
    makeSection("Drops", normal, 0);
    makeSection("Wilderness drop table", wildernessToggle.checked ? wilderness : [], normal.length);
    document.querySelectorAll("td.quantity-cell").forEach(el => {
        const td = el;
        td.onmouseenter = () => {
            tooltip.textContent = td.dataset.tooltip;
            tooltip.style.display = "block";
        };
        td.onmouseleave = () => (tooltip.style.display = "none");
        td.onmousemove = (e) => {
            const off = 12;
            const r = tooltip.getBoundingClientRect();
            let x = e.clientX + off;
            if (x + r.width > window.innerWidth)
                x = e.clientX - off - r.width;
            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${e.clientY + off}px`;
        };
    });
}
function updateUI() {
    const counts = simulator.getCounts();
    simulator.getDrops().forEach((d, i) => {
        const td = document.querySelectorAll("td.quantity-cell")[i];
        const q = counts[i];
        td.dataset.tooltip = computeTooltip(d, q);
        td.textContent = String(q);
    });
    let minT = 0;
    let maxT = 0;
    simulator.getDrops().forEach((d, i) => {
        const [vmin, vmax] = computeValue(d, simulator.getCounts()[i]);
        minT += vmin;
        maxT += vmax;
    });
    if (luckToggle.checked) {
        minT = Math.round(minT * LUCK_BUFF_MULT);
        maxT = Math.round(maxT * LUCK_BUFF_MULT);
    }
    sumEl.textContent =
        minT === maxT
            ? `Total GE Value: ${minT.toLocaleString()} coins`
            : `Total GE Value: ${minT.toLocaleString()}–${maxT.toLocaleString()} coins`;
}
// ─── Event Hooks ─────────────────────────────────────────────────────────────
bossSelect.addEventListener("change", () => renderAll());
simulateBtn.addEventListener("click", () => renderAll());
autoKillToggle.addEventListener("change", (e) => {
    if (e.target.checked)
        simulator.startAutoKill();
    else
        simulator.stopAutoKill();
});
resetBtn.addEventListener("click", () => {
    simulator.stopAutoKill();
    killsInput.value = "0";
    simulator.getCounts().fill(0);
    tablesContainer.innerHTML = "";
    sumEl.textContent = "Total GE Value: 0 coins";
});
slayerTaskToggle.addEventListener("change", () => renderAll());
wildernessToggle.addEventListener("change", () => renderAll());
luckToggle.addEventListener("change", () => updateUI());
