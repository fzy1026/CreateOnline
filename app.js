// ========== 资源数据 ==========
const resources = {
    wood: { name: "原木", count: 0, revealed: false,max_count: 256 },
    wood_axe: { name: "木斧", count: 0, revealed: false,max_count: 256 },
    wood_pick: { name: "木镐", count: 0, revealed: false,max_count: Infinity },
    cobblestone: { name: "圆石", count: 0, revealed: false,max_count: Infinity },
    iron_ore: { name: "铁矿", count: 0, revealed: false,max_count: Infinity },
    furnace: { name: "熔炉", count: 0, revealed: false,max_count: Infinity },
    cobblestone_axe: { name: "石斧", count: 0, revealed: false,max_count: Infinity },
    cobblestone_pickaxe: { name: "石镐", count: 0, revealed: false,max_count: Infinity },
    coal: { name: "煤", count: 0, revealed: false,max_count: Infinity },
};

let coal_probability = 0.1; // 挖矿时获得煤的概率
let iron_ore_probability = 0; // 挖矿时获得铁矿的概率


// ========== 动作数据（自由配置） ==========
const actions = [
    // ---- 生产动作 ----
    {
        id: "get_wood",
        name: "撸树",
        icon: "🪓",
        type: "primary",
        revealed: true,   // 永远可见
        condition() {
            return true;
        },   // 永远可见
        effect() {  
            resources.wood.count += 1 + resources.wood_axe.count + 3*resources.cobblestone_axe.count;
            console.log("撸树", resources.wood.count);
        },
    },
    {
        id: "get_cobblestone",
        name: "挖矿",
        icon: "⛏️",
        type: "primary",
        revealed: false,
        condition() {
            return resources.wood_pick.count > 0;
        },
        effect() {
            resources.cobblestone.count += resources.wood_pick.count + 3*resources.cobblestone_pickaxe.count;
            console.log("挖矿", resources.cobblestone.count);
            if(Math.random() < coal_probability) resources.coal.count += 1;  
            if(Math.random() < iron_ore_probability) resources.iron_ore.count += 1;  
        },
    },

    // ---- 购买/升级动作 ----
    {
        id: "buy_wood_axe",
        name: "木斧(20原木/个)",
        icon: "🛠️",
        desc: "每次撸树获得木头数 +1",
        type: "secondary",
        revealed: false,
        condition() {
            return resources.wood.count >= 20
        },
        effect() {
            if(resources.wood.count < 20) return;
            resources.wood.count -= 20;
            resources.wood_axe.count++;
            console.log("购买木斧", resources.wood_axe.count);
        },
    },
    {
        id: "buy_wood_pickaxe",
        name: "木镐(20原木/个)",
        icon: "⛏️",
        desc: "每次挖矿获得圆石数 +1,挖掘时获得煤炭概率+0.01",
        type: "secondary",
        revealed: false,
        condition() {
            return resources.wood.count >= 20
        },
        effect() {
            if(resources.wood.count < 20) return;
            resources.wood.count -= 20;
            resources.wood_pick.count++;
            console.log("购买木镐", resources.wood_pick.count);
            coal_probability += 0.01; // 增加获得煤炭的概率
        },
    },
    {
        id: "buy_furnace",
        name: "熔炉(20圆石/个)",
        icon: "🔥",
        desc: "熔炼",
        type: "secondary",
        revealed: false,
        condition() {
            return resources.cobblestone.count >= 20
        },
        effect() {
            if(resources.cobblestone.count < 20) return;
            resources.cobblestone.count -= 20;
            resources.furnace.count++;
            console.log("购买熔炉", resources.furnace.count);
        },
    },
    {
        id:"buy_cobblestone_axe",
        name:"石斧(30原木+20圆石/个)",
        icon:"🪓",
        desc:"每次撸树获得木头数 +3",
        type:"secondary",
        revealed:false,
        condition(){
            return resources.wood.count >= 30 && resources.cobblestone.count >= 20;
        },
        effect(){
            if(resources.wood.count < 30 || resources.cobblestone.count < 20) return;
            resources.wood.count -= 30;
            resources.cobblestone.count -= 20;
            resources.cobblestone_axe.count++;
            console.log("购买石斧", resources.cobblestone_axe.count);
        }
    },
    {
        id:"buy_cobblestone_pickaxe",
        name:"石镐(30原木+20圆石/个)",
        icon:"⛏️",
        desc:"每次挖矿获得圆石数 +3，挖矿时获得铁矿概率+0.01",
        type:"secondary",
        revealed:false,
        condition(){
            return resources.wood.count >= 30 && resources.cobblestone.count >= 20;
        },
        effect(){
            if(resources.wood.count < 30 || resources.cobblestone.count < 20) return;
            resources.wood.count -= 30;
            resources.cobblestone.count -= 20;
            resources.cobblestone_pickaxe.count++;
            console.log("购买石镐", resources.cobblestone_pickaxe.count);
            iron_ore_probability += 0.01; // 增加获得铁矿的概率
        }
    }
];


// ========== 侧边栏渲染（数据驱动） ==========
function RefreshSidebar() {
    const container = document.getElementById("sidebar-list");
    if (!container) return;

    for (const [id, res] of Object.entries(resources)) {
        // 如果该资源还没有对应的 DOM 元素，创建一个
        let el = document.getElementById(id);
        if (!el) {
            el = document.createElement("div");
            el.className = "sidebar-item";
            el.id = id;
            container.appendChild(el);
        }

        // 名称居左，数量徽标居右（显示时修正精度）
        el.innerHTML = `<span>${res.name}</span><span class="item-count">${res.count}</span>`;

        // 首次非零 → 揭示（之后永不隐藏）
        if (res.count > 0 && !res.revealed) {
            res.revealed = true;
            el.dataset.revealed = "true";
        }
    }
}

// ========== 动作按钮渲染（数据驱动） ==========
function RefreshActions() {
    const container = document.getElementById("action-list");
    if (!container) return;
    container.innerHTML = "";

    for (const action of actions) {
        // 条件不满足 → 不显示此按钮
        if (action.condition() || action.revealed) {
            action.revealed = true; 
            // 包装容器
            const wrapper = document.createElement("div");
            wrapper.className = "action-card";

            // 创建按钮
            const btn = document.createElement("button");
            btn.className = `btn btn-${action.type}`;
            btn.innerHTML = `<span class="btn-icon">${action.icon}</span> ${action.name}`;

            btn.onclick = () => {
                action.effect();
                RefreshSidebar();
                RefreshActions();   // 动作可能改变条件，重新计算按钮可见性
            };

            wrapper.appendChild(btn);

            // 可选描述文字
            if (action.desc) {
                const desc = document.createElement("span");
                desc.className = "action-desc";
                desc.textContent = action.desc;
                wrapper.appendChild(desc);
            }

            container.appendChild(wrapper);
        }
    }
}

// ========== 初始化 ==========
RefreshSidebar();
RefreshActions();

// ========== 游戏主循环 ==========
function Tick() {
    // 未来：每秒自动收益等
}

setInterval(Tick, 1000);