    // ========== 资源数据（统一管理） ==========
const resources = {
    wood_num:     { name: "原木", count: 0, revealed: false },
    wood_axe_num: { name: "木斧", count: 0, revealed: false, desc: "每次撸树获得木头数+1" },
};

// 简写访问
const wood     = resources.wood_num;
const wood_axe = resources.wood_axe_num;

// ========== 侧边栏渲染 ==========
function RefreshSidebar() {
    for (const [id, res] of Object.entries(resources)) {
        const el = document.getElementById(id);
        if (!el) continue;

        // 更新文本：名称居左，数量居右（CSS flex 自动排列）
        el.innerHTML = `<span>${res.name}</span><span class="item-count">${res.count}</span>`;

        // 首次非零 → 揭示（之后永不隐藏）
        if (res.count > 0 && !res.revealed) {
            res.revealed = true;
            el.dataset.revealed = "true";
        }
    }
}

// ========== 游戏逻辑 ==========
function GetWood() {
    wood.count += 1 + wood_axe.count;
    console.log("撸树", wood.count);
    RefreshSidebar();
}

function BuyWoodAxe() {
    if (wood.count >= 4) {
        wood.count -= 4;
        wood_axe.count++;
        console.log("购买木斧", wood_axe.count);
    }
    RefreshSidebar();
}

function Tick() {

}

setInterval(Tick, 1000);