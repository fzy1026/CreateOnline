

const resources = {
    wood: { name: '原木', count: 0, revealed: false, storageCost: 1 },
    wood_axe: { name: '木斧', count: 0, revealed: false, storageCost: 64 },
    wood_pick: { name: '木镐', count: 0, revealed: false, storageCost: 64 },
    cobblestone: { name: '圆石', count: 0, revealed: false, storageCost: 1 },
    iron_ore: { name: '铁矿', count: 0, revealed: false, storageCost: 1 },
    furnace: { name: '熔炉', count: 0, revealed: false, storageCost: 1 },
    cobblestone_axe: { name: '石斧', count: 0, revealed: false, storageCost: 64 },
    cobblestone_pickaxe: { name: '石镐', count: 0, revealed: false, storageCost: 64 },
    coal: { name: '煤', count: 0, revealed: false, storageCost: 1 },
    chest: { name: '箱子', count: 0, revealed: false, storageCost: 0},
};

let storageMax = 2880;
let storageUsed = 0;
let coalProbability = 0.1;
let ironOreProbability = 0;

function resourcesAdd(resourceName, count) {
    const res = resources[resourceName];
    const deltaStorage = res.storageCost * count;

    // Spending resources (negative count) always allowed
    if (count < 0) {
        res.count += count;
        storageUsed += deltaStorage;
        return;
    }

    // Adding resources — check storage capacity
    if (storageUsed + deltaStorage > storageMax) return;
    res.count += count;
    storageUsed += deltaStorage;
}




const actions = [
    // -- Production --
    {
        id: 'get_wood',
        name: '撸树',
        icon: '🪓',
        type: 'primary',
        revealed: true,
        condition() { return true; },
        effect() {
            resourcesAdd('wood', 1 + resources.wood_axe.count + 3 * resources.cobblestone_axe.count);
        },
    },
    {
        id: 'get_cobblestone',
        name: '挖矿',
        icon: '⛏️',
        type: 'primary',
        revealed: false,
        condition() { return resources.wood_pick.count > 0; },
        effect() {
            resourcesAdd('cobblestone', resources.wood_pick.count + 3 * resources.cobblestone_pickaxe.count);

            if (Math.random() < coalProbability) {
                resourcesAdd('coal', 1);
            }
            if (Math.random() < ironOreProbability) {
                resourcesAdd('iron_ore', 1);
            }
        },
    },

    // -- Upgrades --
    {
        id: 'buy_wood_axe',
        name: '木斧 (20原木/个)',
        icon: '🛠️',
        desc: '每次撸树获得木头数 +1',
        type: 'secondary',
        revealed: false,
        condition() { return resources.wood.count >= 20; },
        effect() {
            if (resources.wood.count < 20) return;
            resourcesAdd('wood', -20);
            resourcesAdd('wood_axe', 1);
        },
    },
    {
        id: 'buy_wood_pickaxe',
        name: '木镐 (20原木/个)',
        icon: '⛏️',
        desc: '每次挖矿获得圆石数 +1，挖掘时获得煤炭概率 +0.01',
        type: 'secondary',
        revealed: false,
        condition() { return resources.wood.count >= 20; },
        effect() {
            if (resources.wood.count < 20) return;
            resourcesAdd('wood', -20);
            resourcesAdd('wood_pick', 1);
            coalProbability += 0.01;
        },
    },
    {
        id: 'buy_furnace',
        name: '熔炉 (20圆石/个)',
        icon: '🔥',
        desc: '熔炼',
        type: 'secondary',
        revealed: false,
        condition() { return resources.cobblestone.count >= 20; },
        effect() {
            if (resources.cobblestone.count < 20) return;
            resourcesAdd('cobblestone', -20);
            resourcesAdd('furnace', 1);
        },
    },
    {
        id: 'buy_cobblestone_axe',
        name: '石斧 (30原木+20圆石/个)',
        icon: '🪓',
        desc: '每次撸树获得木头数 +3',
        type: 'secondary',
        revealed: false,
        condition() { return resources.wood.count >= 30 && resources.cobblestone.count >= 20; },
        effect() {
            if (resources.wood.count < 30 || resources.cobblestone.count < 20) return;
            resourcesAdd('wood', -30);
            resourcesAdd('cobblestone', -20);
            resourcesAdd('cobblestone_axe', 1);
        },
    },
    {
        id: 'buy_cobblestone_pickaxe',
        name: '石镐 (30原木+20圆石/个)',
        icon: '⛏️',
        desc: '每次挖矿获得圆石数 +3，挖矿时获得铁矿概率 +0.01',
        type: 'secondary',
        revealed: false,
        condition() { return resources.wood.count >= 30 && resources.cobblestone.count >= 20; },
        effect() {
            if (resources.wood.count < 30 || resources.cobblestone.count < 20) return;
            resourcesAdd('wood', -30);
            resourcesAdd('cobblestone', -20);
            resourcesAdd('cobblestone_pickaxe', 1);
            ironOreProbability += 0.01;
        },
    },
    {
        id: 'buy_chest',
        name: '箱子 (64原木/个)',
        icon: '📦',
        desc: '增加仓库容量 +1728',
        type: 'secondary',
        revealed: false,
        condition() { return resources.wood.count >= 64; },
        effect() {
            if (resources.wood.count < 64) return;
            resourcesAdd('wood', -64);
            resourcesAdd('chest', 1);
            storageMax += 1728;
        },
    }
];




function renderStorage() {
    const container = document.getElementById('storage-display');
    if (!container) return;

    const pct = Math.min(storageUsed / storageMax, 1);
    const barColor = pct > 0.85 ? '#e67e22' : pct > 0.6 ? '#f1c40f' : '#2d6a4f';

    container.innerHTML = `
    <div class="storage-card">
      <div class="storage-label">
        <span>🏚️ 仓库</span>
        <span class="storage-numbers">${storageUsed} / ${storageMax}</span>
      </div>
      <div class="storage-bar-track">
        <div class="storage-bar-fill" style="width:${(pct * 100).toFixed(1)}%;background:${barColor}"></div>
      </div>
    </div>
  `;
}

function refreshSidebar() {
    const container = document.getElementById('sidebar-list');
    if (!container) return;

    renderStorage();

    for (const [id, res] of Object.entries(resources)) {
        let el = document.getElementById(id);
        if (!el) {
            el = document.createElement('div');
            el.className = 'sidebar-item';
            el.id = id;
            container.appendChild(el);
        }

        el.innerHTML = `<span>${res.name}</span><span class="item-count">${res.count}</span>`;

        if (res.count > 0 && !res.revealed) {
            res.revealed = true;
            el.dataset.revealed = 'true';
        }
    }
}



function refreshActions() {
    const container = document.getElementById('action-list');
    if (!container) return;
    container.innerHTML = '';

    for (const action of actions) {
        if (!action.condition() && !action.revealed) continue;

        action.revealed = true;

        const wrapper = document.createElement('div');
        wrapper.className = 'action-card';

        const btn = document.createElement('button');
        btn.className = `btn btn-${action.type}`;
        btn.innerHTML = `<span class="btn-icon">${action.icon}</span> ${action.name}`;

        btn.onclick = () => {
            action.effect();
            refreshSidebar();
            refreshActions();
        };

        wrapper.appendChild(btn);

        if (action.desc) {
            const desc = document.createElement('span');
            desc.className = 'action-desc';
            desc.textContent = action.desc;
            wrapper.appendChild(desc);
        }

        container.appendChild(wrapper);
    }
}



function tick() {
    // Future: passive income per second, etc.
}



refreshSidebar();
refreshActions();
setInterval(tick, 1000);