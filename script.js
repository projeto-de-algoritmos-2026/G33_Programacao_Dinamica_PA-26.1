const $ = id => document.getElementById(id);
const [dict, editor, bd, sug, dpView, dpCont, themeBtn] = ['dict', 'editor', 'backdrop', 'suggestions', 'dp-view', 'dp-table-container', 'theme-toggle'].map($);

const lev = (a, b) => {
    const m = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= b.length; j++) m[0][j] = j;
    for (let i = 1; i <= a.length; i++)
        for (let j = 1; j <= b.length; j++)
            m[i][j] = a[i-1] === b[j-1] ? m[i-1][j-1] : Math.min(m[i-1][j-1], m[i][j-1], m[i-1][j]) + 1;
    return m;
};

const trace = (m, a, b) => {
    let i = a.length, j = b.length, path = new Set([`${i},${j}`]), ops = [];
    while (i || j) {
        if (i && j && a[i-1] === b[j-1]) { ops.push(`Manter '${a[--i]}'`); j--; }
        else if (i && j && m[i][j] === m[i-1][j-1] + 1) ops.push(`Substituir '${a[--i]}' por '${b[--j]}'`);
        else if (i && m[i][j] === m[i-1][j] + 1) ops.push(`Deletar '${a[--i]}'`);
        else ops.push(`Inserir '${b[--j]}'`);
        path.add(`${i},${j}`);
    }
    return { path, ops: ops.reverse() };
};

window.showDp = (a, b) => {
    const m = lev(a, b), { path, ops } = trace(m, a, b);
    dpCont.innerHTML = `<table><tr><th></th><th>ε</th>${[...b].map(c=>`<th>${c}</th>`).join('')}</tr>` +
        m.map((r, i) => `<tr><th>${i ? a[i-1] : 'ε'}</th>${r.map((v, j) => `<td${path.has(`${i},${j}`) ? ' class="path-cell"' : ''}>${v}</td>`).join('')}</tr>`).join('') +
        `</table><div class="ops-container"><h4>caminho ótimo:</h4><ul class="ops-list">${ops.map(o=>`<li>${o}</li>`).join('')}</ul></div>`;
    dpView.style.display = 'block';
};

let cache = {}, timer;
const escapeHTML = s => s.replace(/[&<>"']/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', '\'':'&#39;' }[m]));

const analyzeText = () => {
    const dSet = new Set(dict.value.toLowerCase().match(/\S+/g) || []), txt = editor.value;
    const errs = {};

    if (dSet.size) {
        [...new Set(txt.match(/[\p{L}]+/gu) || [])].map(w => w.toLowerCase()).filter(w => !dSet.has(w)).forEach(w => {
            if (!cache[w]) {
                let best = '', maxSim = -1;
                dSet.forEach(dw => {
                    const len = Math.max(w.length, dw.length);
                    const sim = len ? (1 - lev(w, dw)[w.length][dw.length] / len) * 100 : 100;
                    if (sim > maxSim) [maxSim, best] = [sim, dw];
                });
                cache[w] = { best, sim: maxSim.toFixed(2) };
            }
            errs[w] = cache[w];
        });
    }

    bd.innerHTML = escapeHTML(txt).replace(/[\p{L}]+/gu, m => errs[m.toLowerCase()] 
        ? `<span class="err-inline" data-sug="${errs[m.toLowerCase()].best}">${m}</span>` : m) + (txt.endsWith('\n') ? ' ' : '');

    sug.innerHTML = Object.entries(errs).map(([w, {best, sim}]) => 
        `<div class="correction-line"><span class="err-word">${w}</span><span class="sug-word">${best}</span><span class="meta">${sim}%</span><button onclick="showDp('${w}', '${best}')">[matriz]</button></div>`
    ).join('');
};

dict.oninput = () => { cache = {}; analyzeText(); };
editor.oninput = () => { clearTimeout(timer); timer = setTimeout(analyzeText, 100); };
editor.onscroll = () => bd.scrollTop = editor.scrollTop;
themeBtn.onclick = () => document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';