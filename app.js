let mineGetCount = 0;
let cutGetCount = 1;
let storageMax = 2880;
let storageUsed = 0;
let currentPage = 'main';//当前页面

const resources = {
    // 基础资源
    wood: {
        name: '原木',
        count: 0,
        revealed: false,
        storageCost: 1,
    },
    cobblestone: {
        name: '圆石',
        count: 0,
        revealed: false,
        storageCost: 1,
    },
    coal: {
        name: '煤炭',
        count: 0,
        revealed: false,
        storageCost: 1,
        probability: 0,
    },
    iron_ore: {
        name: '铁矿',
        count: 0,
        revealed: false,
        storageCost: 1,
        probability: 0,
    },
    iron: {
        name: '铁锭',
        count: 0,
        revealed: false,
        storageCost: 1,
    },
    gold_ore: {
        name: '金矿',
        count: 0,
        revealed: false,
        storageCost: 1,
        probability: 0,
    },
    gold: {
        name: '金锭',
        count: 0,
        revealed: false,
        storageCost: 1,
    },
    emerald: {
        name: '绿宝石',
        count: 0,
        revealed: false,
        storageCost: 1,
        probability: 0,
    },
    diamond: {
        name: '钻石',
        count: 0,
        revealed: false,
        storageCost: 1,
        probability: 0,
    },
    lapis_lazuli: {
        name: '青金石',
        count: 0,
        revealed: false,
        storageCost: 1,
        probability: 0,
    },
    lava: {
        name: '岩浆',
        count: 0,
        revealed: false,
        storageCost: 64,
    },
    obsidian: {
        name: '黑曜石',
        count: 0,
        revealed: false,
        storageCost: 1,
        probability: 0,
    },
};

const tools = {
    wood_axe: {
        name: '木斧',
        count: 0,
    },
    wood_pick: {
        name: '木镐',
        count: 0,
    },
    cobblestone_axe: {
        name: '石斧',
        count: 0,
    },
    cobblestone_pickaxe: {
        name: '石镐',
        count: 0,
    },
    chest: {
        name: '箱子',
        count: 0,
    },
    iron_pickaxe: {
        name: '铁镐',
        count: 0,
    },
    iron_axe: {
        name: '铁斧',
        count: 0,
    },
};

const machines = {
    furnace: {
        name: '熔炉',
        count: 0,
        revealed: false,
        recipes: [
            {
                id: 'smelt_iron',
                name: '熔炼铁矿',
                description: '1铁矿 + 1煤炭 → 1铁锭',
                cd: 10,
                count: 0,
                counter: 0,
                tag:["smelting"],
                work() {
                    if (resources.iron_ore.count < 1 || resources.coal.count < 1) return;
                    if (storageUsed + resources.iron.storageCost > storageMax) return;
                    resourcesAdd('iron_ore', -1);
                    resourcesAdd('coal', -1);
                    resourcesAdd('iron', 1);
                }
            },
            {
                id: 'smelt_coal',
                name: '烧制木炭',
                description: '1原木 + 1煤炭 → 5煤炭',
                cd: 5,
                count: 0,
                counter: 0,
                tag:[],
                work() {
                    if (!(resources.wood.count > 0 && resources.coal.count > 0)) return;
                    resourcesAdd('coal', 5);
                    resourcesAdd('wood', -1);
                    resourcesAdd('coal', -1);
                },
            }
        ]
    },

};

const upgrades = {
    nether_portal:{
        id:'nether_portal',
        name:'制作下界传送门',
        description:'用14个黑曜石制作下界传送门以进入下界',
        revealed:false,
        condition() { return resources.obsidian.count > 0;},
        effect(){
            if(resources.obsidian.count < 14) return;
            revealed = true;
            resourcesAdd('obsidian', -14);
        }
    },
    enter_village:{
        id:'enter_village',
        name:'进入村庄',
        description:'用64个绿宝石换取村民的信任，以进入村庄',
        revealed:false,
        condition() { return resources.emerald.count > 1;},
        effect(){
            if(resources.emerald.count < 64) return;
            revealed = true;
            resourcesAdd('emerald', -64);
        }
    },
    visit_piglin:{
        id:'visit_piglin',
        name:'“猪”就友谊',
        description:'用64个金锭结识一些“猪”队友',
        revealed:false,
        condition() { return upgrades.nether_portal.revealed;},
        effect(){
            if(resources.gold.count < 64) return;
            revealed = true;
            resourcesAdd('gold', -64);
        }
    }

}

const merchants = {
    librarian:{
        id:'librarian',
        name:'图书管理员',
        trades:[
            {
                id:'trade_emerald_for_book',
                name:'绿宝石换书',
                cost:{emerald:5},
                reward:{book:1}
            }
        ]
    },
    blacksmith:{
        id:'blacksmith',
        name:'铁匠',
        trades:[
            {
                id:'trade_iron_for_axe',
                name:'铁锭换斧',
                cost:{iron:10},
                reward:{axe:1}
            }
        ]
    }
}

function LuckyGet(probability) {
    let ans = 0;
    while(probability > 0) {
        let random = Math.random();
        if (random < probability) {
            ans++;
            probability-=1;
        }
        else{
            probability = 0;
        }
    }
    return ans;
}

function pageChange(pageId) {
    currentPage = pageId;
    // 切换导航按钮高亮
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === pageId);
    });
    updatePage();
}

function resourcesAdd(resourceName, count) {
    const res = resources[resourceName];
    const deltaStorage = res.storageCost * count;

    // Spending resources (negative count) always allowed
    if (count < 0) {
        res.count += count;
        storageUsed += deltaStorage;
        return true;
    }

    // Adding resources — check storage capacity
    if (storageUsed + deltaStorage > storageMax) return false;
    res.count += count;
    storageUsed += deltaStorage;
    return true;
}




const actions = [
    // -- Production --
    {
        id: 'get_wood',
        name: '砍树',
        icon: '🪓',
        type: 'primary',
        revealed: true,
        condition() { return true; },
        effect() {
            resourcesAdd('wood', cutGetCount);
        },
    },
    {
        id: 'get_cobblestone',
        name: '挖矿',
        icon: '⛏️',
        type: 'primary',
        revealed: false,
        condition() { return tools.wood_pick.count > 0; },
        effect() {
            resourcesAdd('cobblestone', mineGetCount);
            if (Math.random() < resources['coal'].probability) {
                resourcesAdd('coal', 1);
            }
                if (Math.random() < resources['iron_ore'].probability) {
                resourcesAdd('iron_ore', 1);
            }
            if(Math.random() < resources['gold_ore'].probability){
                resourcesAdd('gold_ore', 1);
            }
        },
    },

    // -- Upgrades --
    {
        id: 'buy_wood_axe',
        name: '木斧 (20原木/个)',
        icon: '🛠️',
        desc: '每次砍树获得木头数 +1',
        type: 'secondary',
        revealed: false,
        condition() { return resources.wood.count >= 20; },
        effect() {
            if (resources.wood.count < 20) return;
            resourcesAdd('wood', -20);
            tools.wood_axe.count += 1;
            cutGetCount += 1;
        },
        info() {
            return '数量:' + tools.wood_axe.count;
        }
    },
    {
        id: 'buy_wood_pickaxe',
        name: '木镐 (20原木/个)',
        icon: '⛏️',
        desc: '每次挖矿获得圆石数 +1，挖掘时获得煤炭概率些微增加',
        type: 'secondary',
        revealed: false,
        condition() { return resources.wood.count >= 20; },
        effect() {
            if (resources.wood.count < 20) return;
            resourcesAdd('wood', -20);
            tools.wood_pick.count += 1;
            mineGetCount += 1;
            resources['coal'].probability += 0.005;
        },
        info() {
            return '数量:' + tools.wood_pick.count;
        }
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
            machines.furnace.count += 1;
            machines.furnace.revealed = true;
        },
        info() {
            return '数量:' + machines.furnace.count;
        }
    },
    {
        id: 'buy_cobblestone_axe',
        name: '石斧 (30原木+20圆石/个)',
        icon: '🪓',
        desc: '每次砍树获得木头数 +3',
        type: 'secondary',
        revealed: false,
        condition() { return resources.wood.count >= 30 && resources.cobblestone.count >= 20; },
        effect() {
            if (resources.wood.count < 30 || resources.cobblestone.count < 20) return;
            resourcesAdd('wood', -30);
            resourcesAdd('cobblestone', -20);
            tools.cobblestone_axe.count += 1;
            cutGetCount += 3;
        },
        info() {
            return '数量:' + tools.cobblestone_axe.count;
        }
    },
    {
        id: 'buy_cobblestone_pickaxe',
        name: '石镐 (30原木+20圆石/个)',
        icon: '⛏️',
        desc: '每次挖矿获得圆石数 +3，挖矿时获得铁矿,煤矿的概率小幅度增加',
        type: 'secondary',
        revealed: false,
        condition() { return resources.wood.count >= 30 && resources.cobblestone.count >= 20; },
        effect() {
            if (resources.wood.count < 30 || resources.cobblestone.count < 20) return;
            resourcesAdd('wood', -30);
            resourcesAdd('cobblestone', -20);
            tools.cobblestone_pickaxe.count += 1;
            mineGetCount += 3;
            resources['coal'].probability += 0.01;
            resources['iron_ore'].probability += 0.01;
        },
        info() {
            return '数量:' + tools.cobblestone_pickaxe.count;
        }
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
            tools.chest.count += 1;
            storageMax += 1728;
        },
        info() {
            return '数量:' + tools.chest.count;
        }
    },
    {
        id: 'buy_iron_axe',
        name: '铁斧 (30原木+10铁锭/个)',
        icon: '🪓',
        desc: '每次砍树获得木头数 +10',
        type: 'secondary',
        revealed: false,
        condition() { return resources.wood.count >= 30 && resources.iron.count >= 10; },
        effect() {
            if (resources.wood.count < 30 || resources.iron.count < 10) return;
            resourcesAdd('wood', -30);
            resourcesAdd('iron', -10);
            tools.iron_axe.count += 1;
            cutGetCount += 10;
        },
        info() {
            return '数量:' + tools.iron_axe.count;
        }
    },
    {
        id: 'buy_iron_pickaxe',
        name: '铁镐 (30原木+10铁锭/个)',
        icon: '⛏️',
        desc: '每次挖矿获得圆石数 +10，挖矿时获得所有种类矿物的概率小幅度提升',
        type: 'secondary',
        revealed: false,
        condition() { return resources.wood.count >= 30 && resources.iron.count >= 10; },
        effect() {
            if (resources.wood.count < 30 || resources.iron.count < 10) return;
            resourcesAdd('wood', -30);
            resourcesAdd('iron', -10);
            tools.iron_pickaxe.count += 1;
            mineGetCount += 10;
            resources['coal'].probability += 0.05;
            resources['iron_ore'].probability += 0.05;
            resources['gold_ore'].probability += 0.05;
            resources['emerald'].probability += 0.05;
            resources['diamond'].probability += 0.05;
            resources['lapis_lazuli'].probability += 0.05;
        },
        info() {
            return '数量:' + tools.iron_pickaxe.count;
        }
    },
    {
        id:'buy_diamond_pickaxe',
        name:'钻石镐 (50原木+10钻石/个)',
        icon:'⛏️',
        desc:'每次挖矿获得圆石数 +50，挖矿时获得所有种类矿物的概率大幅度提升,并可以获得黑曜石',
        type:'secondary',
        revealed:false,
        condition(){return resources.wood.count >= 50 && resources.diamond.count >= 10;},
        effect(){
            if(resources.wood.count < 50 || resources.diamond.count < 10) return;
            resourcesAdd('wood', -50);
            resourcesAdd('diamond', -10);
            tools.diamond_pickaxe = tools.diamond_pickaxe || {name:'钻石镐', count:0};
            tools.diamond_pickaxe.count += 1;
            mineGetCount += 50;
            resources['coal'].probability += 0.05;
            resources['iron_ore'].probability += 0.05;
            resources['gold_ore'].probability += 0.05;
            resources['emerald'].probability += 0.05;
            resources['diamond'].probability += 0.05;
            resources['lapis_lazuli'].probability += 0.05;
        },
        info() {
            return '数量:' + tools.diamond_pickaxe.count;
        }
    },
    {
        id:'buy_diamond_axe',
        name:'钻石斧 (50原木+10钻石/个)',
        icon:'🪓',
        desc:'每次砍树获得木头数 +50',
        type:'secondary',
        revealed:false,
        condition(){return resources.wood.count >= 50 && resources.diamond.count >= 10;},
        effect(){
            if(resources.wood.count < 50 || resources.diamond.count < 10) return;
            resourcesAdd('wood', -50);
            resourcesAdd('diamond', -10);
            tools.diamond_axe = tools.diamond_axe || {name:'钻石斧', count:0};
            tools.diamond_axe.count += 1;
            cutGetCount += 50;
        },
        info() {
            return '数量:' + tools.diamond_axe.count;
        }
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


function updatePage() {
    const container = document.getElementById('page-content');
    if (!container) return;
    container.innerHTML = '';
    if (currentPage === 'main') {

        for (const action of actions) {
            if (!action.condition() && !action.revealed) continue;

            action.revealed = true;

            const wrapper = document.createElement('div');
            wrapper.className = 'action-card';

            const btn = document.createElement('button');
            btn.className = `btn btn-${action.type}`;
            let btnHTML = `<span class="btn-icon">${action.icon}</span> ${action.name}`;
            if (action.info) {
                btnHTML += ` <span class="btn-count">${action.info()}</span>`;
            }
            btn.innerHTML = btnHTML;

            btn.onclick = () => {
                action.effect();
                refreshSidebar();
                updatePage();
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
    else if (currentPage === 'machine') {
        for (const [id, machine] of Object.entries(machines)) {
            if (!machine.revealed) continue;
            const card = document.createElement('div');
            card.className = 'machine-card';
            card.id = 'machine-' + id;

            let bodyHTML = '';
            if (machine.recipes && machine.recipes.length > 0) {
                for (let recipe of machine.recipes) {
                    const assigned = recipe.count || 0;
                    const available = machine.count - machine.recipes.reduce((sum, r) => sum + (r.count || 0), 0) + assigned;
                    bodyHTML += `
                        <div class="recipe-row">
                            <div class="recipe-info">
                                <span class="recipe-name">${recipe.name}</span>
                                <span class="recipe-desc">${recipe.description}</span>
                                <span class="recipe-cd">配方工作时间: ${recipe.cd}s</span>
                            </div>
                            <div class="recipe-stepper">
                                <button class="recipe-stepper-btn" onclick="adjustRecipe('${id}', '${recipe.id}', -1)" ${assigned <= 0 ? 'disabled' : ''}>−</button>
                                <span class="recipe-stepper-value">${assigned}</span>
                                <button class="recipe-stepper-btn" onclick="adjustRecipe('${id}', '${recipe.id}', 1)" ${available <= 0 ? 'disabled' : ''}>+</button>
                            </div>
                        </div>`;
                }
            } else {
                bodyHTML = '<span class="machine-desc">暂无可用配方</span>';
            }

            card.innerHTML = `
                <div class="machine-header">
                    <span class="machine-name">${machine.name}</span>
                    <span class="machine-count">×${machine.count}</span>
                </div>
                <div class="machine-body">
                    ${bodyHTML}
                </div>
            `;
            container.appendChild(card);
        }
    }
    else if(currentPage === 'upgrades') {
        for (const [id, upgrade] of Object.entries(upgrades)) {
            if (!upgrade.condition() && !upgrade.revealed) continue;

            const wasRevealed = upgrade.revealed;
            upgrade.revealed = true;

            const card = document.createElement('div');
            card.className = 'upgrade-card';
            card.id = 'upgrade-' + id;

            if (wasRevealed) {
                card.innerHTML = `
                    <div class="upgrade-header">
                        <span class="upgrade-name">✅ ${upgrade.name}</span>
                        <span class="upgrade-done">已完成</span>
                    </div>
                `;
            } else {
                card.innerHTML = `
                    <div class="upgrade-header">
                        <span class="upgrade-name">${upgrade.name}</span>
                    </div>
                    <div class="upgrade-body">
                        <span class="upgrade-desc">${upgrade.description}</span>
                        <button class="btn btn-upgrade" onclick="activateUpgrade('${id}')">🔓 激活</button>
                    </div>
                `;
            }

            container.appendChild(card);
        }
    }
}



function activateUpgrade(upgradeId) {
    const upgrade = upgrades[upgradeId];
    if (!upgrade) return;
    upgrade.effect();
    refreshSidebar();
    updatePage();
}

function adjustRecipe(machineId, recipeId, delta) {
    let goalMachine = null;
    for (const [id, machine] of Object.entries(machines)) {
        if (id === machineId) {
            goalMachine = machine;
            break;
        }
    }
    if (goalMachine == null) return;
    let goalRecipe = null;
    for (const recipe of goalMachine.recipes) {
        if (recipe.id === recipeId) {
            goalRecipe = recipe;
            break;
        }
    }
    if (goalRecipe == null) return;

    goalRecipe.count = goalRecipe.count || 0;

    if (delta > 0) {
        const totalAssigned = goalMachine.recipes.reduce((sum, r) => sum + (r.count || 0), 0);
        if (totalAssigned >= goalMachine.count) return;
        goalRecipe.count += delta;
    } else {
        if (goalRecipe.count <= 0) return;
        goalRecipe.count += delta;
    }

    updatePage();
}

function processMachines() {
    for (const [id, machine] of Object.entries(machines)) {
        if (machine.count <= 0) continue;
        for (let recipe of machine.recipes) {
            if (recipe.count <= 0) continue;
            console.log(`Processing machine: ${id}, recipe: ${recipe.id}, count: ${recipe.count}, counter: ${recipe.counter}, cd: ${recipe.cd}`);
            recipe.counter = recipe.counter || 0;
            recipe.counter++;
            if (recipe.counter >= recipe.cd) {
                recipe.counter = 0;
                for(let i = 0; i < recipe.count; i++) {
                    recipe.work();
                }
                refreshSidebar();
            }
        }
    }
}

function tick() {
    processMachines();
}



refreshSidebar();
updatePage();
setInterval(tick, 1000);