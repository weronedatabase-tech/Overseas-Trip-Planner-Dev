// ==========================================
// core.js - Centralized MPA App Engine
// ==========================================
// [CONSIDERATION - CONCURRENCY & ISOLATION]: This file is loaded on every HTML page.
// It acts as the backbone for the MPA architecture, handling shared state, Hydration,
// Optimistic UI tracking, and the standardized layout wrapper.

window.AppCore = {
  // Shared State
  currentUser: null,
  appSettings: null,
  
  // [CONSIDERATION - OPTIMISTIC UI]: Globally track mutations to reject stale background polling.
  lastLocalChange: 0,
  
  // Core Initialization
  init: async function() {
      if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
      this.applyTheme();
      this.loadSession();
      this.renderEnvironmentBanner();
      
      // Protect pages that require auth
      const path = window.location.pathname;
      const publicPages = ['/', '/index.html', 'index.html'];
      const isPublic = publicPages.some(p => path.endsWith(p));
      
      if (!this.currentUser && !isPublic) {
          window.location.href = './index.html';
          return;
      }
  },

  loadSession: function() {
      const saved = localStorage.getItem('userSession');
      if (saved) this.currentUser = JSON.parse(saved);
      
      // [CONSIDERATION - HYDRATION]: Hydrate settings instantly from cache for 0ms TTFB
      const cachedSettings = localStorage.getItem('appSettings');
      if (cachedSettings) this.appSettings = JSON.parse(cachedSettings);
  },

  // ==========================================
  // Delta API Fetcher & Concurrency Safety
  // ==========================================
  apiFetch: async function(action, payload = {}, isBackgroundPoll = false) {
      const fetchStartTime = Date.now();
      
      try {
          const res = await fetch(API_URL, { 
              method: 'POST', 
              body: JSON.stringify({ action, ...payload }), 
              headers: { 'Content-Type': 'text/plain;charset=utf-8' }
          });
          
          if(!res.ok) throw new Error("Network error."); 
          const data = await res.json();
          if(data.status === 'error') throw new Error(data.message); 
          
          // [CONSIDERATION - OPTIMISTIC UI]: Stale Payload Rejection
          if (isBackgroundPoll && this.lastLocalChange > fetchStartTime) {
              console.warn(`[AppCore] Stale payload rejected for ${action}`);
              return null; 
          }
          
          return data;
      } catch (err) {
          if(err.message.includes('Failed to fetch') && !isBackgroundPoll) { 
              this.showToast("Auth required.", true); 
              setTimeout(() => window.open(API_URL, '_blank'), 2000); 
          }
          throw err;
      }
  },

  trackMutation: function() {
      this.lastLocalChange = Date.now();
  },

  // ==========================================
  // Standardized UI Generators (MPA Wrapper)
  // ==========================================
  renderEnvironmentBanner: function() {
      let banner = document.getElementById('devModeBar');
      if (!banner) {
          banner = document.createElement('div');
          banner.id = 'devModeBar';
          document.body.insertBefore(banner, document.body.firstChild);
      }
      
      if (ENV === 'Dev') {
          banner.textContent = 'Development Environment';
          banner.className = 'w-full bg-red-600 text-white text-center py-1 text-[10px] font-bold tracking-widest uppercase shrink-0 z-[100]';
      } else if (ENV === 'Exp') {
          banner.textContent = 'Experimentation Environment';
          banner.className = 'w-full bg-purple-600 text-white text-center py-1 text-[10px] font-bold tracking-widest uppercase shrink-0 z-[100]';
      } else {
          banner.classList.add('hidden-force');
      }
  },

  renderHeader: function(pageTitle, backUrl = './dashboard.html') {
      const headerHtml = `
      <header class="sticky top-0 z-50 shadow-lg shrink-0 bg-white dark:bg-zinc-900">
          <nav class="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 py-2.5 flex flex-col justify-center transition-colors">
              <div class="container mx-auto px-4 flex flex-col gap-2">
                  <div class="flex items-center justify-between w-full min-h-[32px] gap-2">
                      <div class="flex items-center gap-2 min-w-0 flex-1">
                          ${backUrl ? `<a href="${backUrl}" class="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 w-8 h-8 flex items-center justify-center rounded shadow-sm shrink-0 transition-colors focus:outline-none"><i class="fa-solid fa-arrow-left text-sm"></i></a>` : ''}
                          <div class="flex flex-col min-w-0">
                              <h1 class="text-base md:text-lg font-black text-zinc-900 dark:text-white leading-tight truncate tracking-tight">${pageTitle}</h1>
                              <span id="headerSubtitle" class="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate leading-none mt-0.5"></span>
                          </div>
                      </div>
                      <div class="flex items-center gap-1.5 shrink-0 pl-2 ml-auto border-l border-zinc-200 dark:border-zinc-700">
                          <button onclick="AppCore.hardRefresh()" class="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-[10px] md:text-xs transition-colors group flex items-center p-1 focus:outline-none" title="Refresh Cache">
                              <i class="fa-solid fa-arrows-rotate text-sm md:text-base group-hover:text-primary transition-transform"></i>
                          </button>
                          <button onclick="AppCore.toggleTheme()" class="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-[10px] md:text-xs transition-colors flex items-center p-1 focus:outline-none" title="Toggle Theme">
                              <span class="text-sm md:text-base leading-none">🌗</span>
                          </button>
                          <a href="./dashboard.html" class="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-[10px] md:text-xs transition-colors flex items-center p-1 focus:outline-none" title="Home">
                              <i class="fa-solid fa-house text-sm md:text-base"></i>
                          </a>
                      </div>
                  </div>
              </div>
          </nav>
      </header>
      `;
      
      const container = document.getElementById('app-header');
      if (container) {
          container.innerHTML = headerHtml;
          if(this.appSettings?.tripTitle) {
              const sub = document.getElementById('headerSubtitle');
              if(sub) sub.textContent = `${this.appSettings.tripTitle} ${this.appSettings.tripYear}`;
          }
      }
  },

  // ==========================================
  // Utils & UX
  // ==========================================
  showToast: function(msg, isError = false) {
      let t = document.getElementById('global-toast');
      if(!t) {
          t = document.createElement('div');
          t.id = 'global-toast';
          document.body.appendChild(t);
      }
      t.textContent = msg;
      t.className = `fixed top-20 left-1/2 transform -translate-x-1/2 px-5 py-2.5 rounded-xl shadow-2xl z-[100] transition-opacity duration-300 text-sm font-bold border ${isError ? 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/50 dark:text-red-400 dark:border-red-800' : 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-400 dark:border-green-800'}`;
      
      t.style.opacity = '1';
      setTimeout(() => t.style.opacity = '0', 3000);
  },

  applyTheme: function() {
      if(localStorage.getItem('theme') === 'dark') {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }
  },

  toggleTheme: function() {
      document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  },

  hardRefresh: async function() {
      this.showToast("Clearing caches...");
      if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map(k => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          for(let r of regs) await r.unregister();
      }
      setTimeout(() => {
          const url = new URL(window.location.href);
          url.searchParams.set('v', Date.now());
          window.location.replace(url.toString());
      }, 800);
  },

  logout: function() {
      localStorage.removeItem('userSession');
      window.location.href = './index.html';
  }
};

// ==========================================
// Global Shared Tooling
// ==========================================
window.setBtnLoading = function(btn, isLoading) {
  if (!btn) return;
  const spinner = btn.querySelector('.btn-spinner');
  const icon = btn.querySelector('.btn-icon');
  const text = btn.querySelector('.btn-text');

  if (isLoading) { 
      btn.disabled = true; btn.classList.add('opacity-80', 'cursor-not-allowed'); 
      if (spinner) spinner.classList.remove('hidden-force'); 
      if (icon) icon.classList.add('opacity-0'); 
      if (text) text.classList.add('opacity-0'); 
  } else { 
      btn.disabled = false; btn.classList.remove('opacity-80', 'cursor-not-allowed'); 
      if (spinner) spinner.classList.add('hidden-force'); 
      if (icon) icon.classList.remove('opacity-0');
      if (text) text.classList.remove('opacity-0');
  }
};

window.processDisplayNames = function(participants) {
  if(!participants) return;
  participants.forEach(p => {
      p.displayName = p.shortName ? p.shortName : (p.fullName || p.name || 'Unknown');
  });
};

window.applyGlobalSorting = function(participants) {
  if(!participants) return [];
  const rules = AppCore.appSettings?.sortingRules || ['project', 'family', 'role', 'name'];
  
  return participants.sort((a, b) => {
      for (let rule of rules) {
          if (rule === 'none') continue;
          
          let valA = '', valB = '';
          if (rule === 'project') { valA = a.group || ''; valB = b.group || ''; }
          else if (rule === 'family') { valA = a.pocNric || a.nric || ''; valB = b.pocNric || b.nric || ''; }
          else if (rule === 'role') { valA = a.role || ''; valB = b.role || ''; }
          else if (rule === 'name') { valA = a.displayName || a.fullName || a.name || ''; valB = b.displayName || b.fullName || b.name || ''; }
          
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
          
          if (valA < valB) return -1;
          if (valA > valB) return 1;
      }
      return 0;
  });
};

// Bootstrap core on load
document.addEventListener('DOMContentLoaded', () => AppCore.init());