// =========================================
// IGNITE MATH LAB - GLOBAL UI LOGIC
// =========================================

// 侧边栏抽屉开关
function toggleSidebar() {
    const panel = document.getElementById('navPanel');
    const overlay = document.getElementById('sidebarOverlay');
    const btn = document.getElementById('sidebarToggleBtn');
    
    if(panel) panel.classList.toggle('open');
    if(overlay) overlay.classList.toggle('active');
    if(btn) btn.classList.toggle('hidden');
}

// 多功能面板与专注模式切换
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

// 侧边栏章节手风琴展开
function toggleUnit(btn) {
    const isActive = btn.classList.contains('active');
    document.querySelectorAll('.nav-unit-btn').forEach(b => {
        b.classList.remove('active');
        const menu = b.querySelector('.nav-sub-menu');
        if(menu) menu.style.display = 'none';
    });
    if (!isActive) {
        btn.classList.add('active');
        const menu = btn.querySelector('.nav-sub-menu');
        if(menu) menu.style.display = 'block';
    }
}

// 页面跳转逻辑
function loadPage(pageId) {
    event.stopPropagation();
    // 判断是不是本页，是本页就光收起菜单不刷新
    if(window.location.href.includes(pageId)) {
        toggleSidebar(); 
        return; 
    }
    console.log("Loading System: " + pageId);
    window.location.href = pageId + ".html";
}
