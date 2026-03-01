let currentSite = '';
if (location.hostname.includes('chatgpt.com')) currentSite = 'chatgpt';
else if (location.hostname.includes('gemini.google.com')) currentSite = 'gemini';
else if (location.hostname.includes('grok.com') || location.hostname.includes('x.com')) currentSite = 'grok';
else if (location.hostname.includes('claude.ai')) currentSite = 'claude';

const userSelectors = {
  chatgpt: 'div[data-message-author-role="user"] .user-message-bubble-color',     // ChatGPT 超级稳定
  gemini: 'div.query-content span.user-query-bubble-with-background p.query-text-line.ng-star-inserted',     // Gemini（若失效请F12检查更新）
  grok: 'div.items-end .message-bubble',               // Grok（来自开源扩展验证）
  claude: 'div[data-testid="user-message"]'            // Claude（claude.ai）
};

let messageList = []; // {text, element}

function getUserMessages() {
  const selector = userSelectors[currentSite];
  if (!selector) return [];
  
  return Array.from(document.querySelectorAll(selector))
    .map(el => {
      let text = (el.textContent || '').trim().replace(/\s+/g, ' ');
      if (text.length > 80) text = text.slice(0, 77) + '...';
      return { text, element: el };
    })
    .filter(item => item.text.length > 5); // 过滤空消息
}

function createSidebar() {
  if (document.getElementById('ai-nav-sidebar')) return;
  
  const sidebar = document.createElement('div');
  sidebar.id = 'ai-nav-sidebar';
  sidebar.innerHTML = `
    <h3>📋 我的发言列表 (${currentSite})</h3>
    <ul id="ai-nav-list"></ul>
  `;
  document.body.appendChild(sidebar);

  const toggle = document.createElement('button');
  toggle.id = 'ai-nav-toggle';
  toggle.textContent = '📜';
  toggle.onclick = () => sidebar.classList.toggle('show');
  document.body.appendChild(toggle);
}

function renderList() {
  const listEl = document.getElementById('ai-nav-list');
  if (!listEl) return;
  
  listEl.innerHTML = '';
  messageList.forEach((item, i) => {
    const li = document.createElement('li');
    li.textContent = `${i+1}. ${item.text}`;
    li.onclick = () => {
      item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // 高亮3秒
      item.element.style.transition = 'background 0.3s';
      item.element.style.background = '#fff3cd';
      setTimeout(() => item.element.style.background = '', 10000);
    };
    listEl.appendChild(li);
  });
}

function updateNavigation() {
  messageList = getUserMessages();
  renderList();
}

// MutationObserver 监听新消息自动刷新
function startObserver() {
  const chatContainer = document.querySelector('main, [role="main"], .chat-container, .conversation') || document.body;
  const observer = new MutationObserver(() => {
    // 防抖
    clearTimeout(window.aiNavTimer);
    window.aiNavTimer = setTimeout(updateNavigation, 800);
  });
  observer.observe(chatContainer, { childList: true, subtree: true });
}

// 初始化
createSidebar();
updateNavigation();
startObserver();

// 页面加载完成后再次刷新一次（防止动态加载）
window.addEventListener('load', () => setTimeout(updateNavigation, 1500));