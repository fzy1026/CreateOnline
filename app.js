let wood_num = 0;//木头数量
let wood_axe_num = 0;//木斧数量,每一个使单次砍树获得木头数量+1

// 记录每个侧边栏项是否已经显示过（一旦为 true 就不再隐藏）
let wood_num_revealed = false;
let wood_axe_num_revealed = false;

function RefreshSidebar() {
    // 更新内容
    document.getElementById("wood_num").innerHTML = "原木:" + wood_num;
    document.getElementById("wood_axe_num").innerHTML = "木斧:" + wood_axe_num;

    // 值为非零且尚未显示过 → 显示它（之后永远不隐藏）
    if (wood_num > 0 && !wood_num_revealed) {
        wood_num_revealed = true;
        document.getElementById("wood_num").style.display = "block";
    }
    if (wood_axe_num > 0 && !wood_axe_num_revealed) {
        wood_axe_num_revealed = true;
        document.getElementById("wood_axe_num").style.display = "block";
    }
}

function GetWood() {
    wood_num += 1 + wood_axe_num;
    console.log("撸树", wood_num);
    RefreshSidebar();
}

function BuyWoodAxe() {
    if (wood_num >= 4) {
        wood_num -= 4;
        wood_axe_num++;
        console.log("购买木斧", wood_axe_num);
    }
    RefreshSidebar();
}

function Tick() {

}

setInterval(Tick, 1000);