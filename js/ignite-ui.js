// =========================================
// IGNITE MATH LAB - GLOBAL UI LOGIC
// =========================================

// --- 1. 侧边栏抽屉开关 ---
function toggleSidebar() {
    const panel = document.getElementById('navPanel');
    const overlay = document.getElementById('sidebarOverlay');
    const btn = document.getElementById('sidebarToggleBtn');
    
    if(panel) panel.classList.toggle('open');
    if(overlay) overlay.classList.toggle('active');
    if(btn) btn.classList.toggle('hidden');
}

// --- 2. 多功能面板与专注模式切换 ---
function switchView(viewId, btn) {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    document.querySelectorAll('.stark-panel').forEach(p => p.classList.remove('active'));
    const targetPanel = document.getElementById('view-' + viewId);
    if(targetPanel) targetPanel.classList.add('active');

    const bodyEl = document.querySelector('.view-body');
    if(bodyEl) {
        if (viewId === 'assign' || viewId === 'quiz' || viewId === 'lab' || viewId === 'notes') {
            bodyEl.classList.add('focus-mode');
        } else {
            bodyEl.classList.remove('focus-mode');
        }
    }
}

// --- 3. 侧边栏章节手风琴展开 ---
function toggleUnit(btn) {
    const isActive = btn.classList.contains('active');
    // 先把所有的都折叠
    document.querySelectorAll('.nav-unit-btn').forEach(b => {
        b.classList.remove('active');
        const menu = b.querySelector('.nav-sub-menu');
        if(menu) menu.style.display = 'none';
    });
    // 如果点击的原来没展开，就展开它
    if (!isActive) {
        btn.classList.add('active');
        const menu = btn.querySelector('.nav-sub-menu');
        if(menu) menu.style.display = 'block';
    }
}

// --- 4. 页面跳转逻辑 ---
function loadPage(pageId) {
    event.stopPropagation();
    // 判断是不是本页，是本页就只收起菜单不刷新
    if(window.location.href.includes(pageId)) {
        toggleSidebar(); 
        return; 
    }
    console.log("Loading System: " + pageId);
    window.location.href = pageId + ".html";
}


// =========================================
// 🚀 核心新增：自动匹配并定位当前页面
// =========================================
document.addEventListener("DOMContentLoaded", function() {
    // 1. 获取当前网页的文件名 (例如 "6-1.html" -> "6-1")
    let currentPath = window.location.pathname.split('/').pop() || '';
    let pageId = currentPath.replace('.html', '');

    // 如果不是具体课程页 (比如主页 index.html)，就不作处理
    if (!pageId || pageId === 'index') return; 

    // 2. 先把侧边栏里写死的默认展开项全部折叠并取消高亮
    document.querySelectorAll('.nav-unit-btn').forEach(btn => {
        btn.classList.remove('active');
        const menu = btn.querySelector('.nav-sub-menu');
        if (menu) menu.style.display = 'none';
    });
    document.querySelectorAll('.nav-sub-item').forEach(item => {
        item.classList.remove('current'); 
    });

    // 3. 寻找与当前 pageId 完全匹配的子菜单按钮
    let targetItem = null;
    document.querySelectorAll('.nav-sub-item').forEach(item => {
        let onclickStr = item.getAttribute('onclick') || '';
        // 匹配 onClick 里面是否包含 loadPage('6-1')
        if (onclickStr.includes("loadPage('" + pageId + "')")) {
            targetItem = item;
        }
    });

    // 4. 如果找到了对应的选项，执行自动定位魔法
    if (targetItem) {
        // 给当前项加上高亮样式
        targetItem.classList.add('current');
        
        // 修改当前项的点击事件，防止冒泡触发折叠，直接关闭侧边栏即可
        targetItem.onclick = function(e) { 
            e.stopPropagation(); 
            toggleSidebar(); 
        };

        // 找到它所在的章 (UNIT)
        let parentMenu = targetItem.closest('.nav-sub-menu');
        let parentUnit = targetItem.closest('.nav-unit-btn');

        if (parentMenu && parentUnit) {
            // 自动展开该章
            parentMenu.style.display = 'block';
            parentUnit.classList.add('active');

            // 自动将侧边栏内部的滚动条，平滑滚动到当前发光项的位置！
            setTimeout(() => {
                const scrollArea = document.querySelector('.nav-scroll-area') || document.querySelector('.nav-panel-container');
                if(scrollArea) {
                    // 计算居中位置
                    const itemTop = parentUnit.offsetTop + targetItem.offsetTop;
                    const halfScreen = scrollArea.clientHeight / 2;
                    scrollArea.scrollTo({
                        top: itemTop - halfScreen + 50,
                        behavior: 'smooth'
                    });
                }
            }, 100); // 延迟一点点等渲染完毕
        }
    }
});
