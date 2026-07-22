/* ============================================
   CineAI - 全局交互脚本
   ============================================ */

// --- History Storage ---
var GEN_HISTORY_KEY = 'cineai_history';
var CHECKLIST_KEY = 'cineai_checklist';

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(GEN_HISTORY_KEY)) || [];
  } catch(e) { return []; }
}

function saveHistory(entry) {
  var history = getHistory();
  entry.id = Date.now();
  entry.createdAt = new Date().toLocaleString('zh-CN');
  history.unshift(entry);
  if (history.length > 50) history = history.slice(0, 50);
  localStorage.setItem(GEN_HISTORY_KEY, JSON.stringify(history));
  renderHistory();
}

function clearHistory() {
  if (confirm('确定清空所有生成历史？')) {
    localStorage.removeItem(GEN_HISTORY_KEY);
    renderHistory();
  }
}

function deleteHistoryItem(id) {
  var history = getHistory().filter(function(h) { return h.id !== id; });
  localStorage.setItem(GEN_HISTORY_KEY, JSON.stringify(history));
  renderHistory();
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', function() {
  initNavigation();
  initScrollAnimations();
  initFaqAccordion();
  initCreatePage();
  renderHistory();
  initCharCounter();
  initChecklist();
});

/* --- HTML Escape Helper --- */
function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* --- Fill Prompt Template --- */
function fillPrompt(text) {
  var ta = document.querySelector('.create-input-area textarea');
  if (ta) {
    ta.value = text;
    ta.focus();
    updateCharCount(ta);
  }
}

/* --- Quality Checklist --- */
function updateChecklist() {
  var items = document.querySelectorAll('#checklistItems input[type="checkbox"]');
  var checked = 0;
  var total = items.length;
  var states = {};
  items.forEach(function(cb) {
    if (cb.checked) checked++;
    states[cb.getAttribute('data-key')] = cb.checked;
  });
  var progress = document.getElementById('checklistProgress');
  if (progress) progress.textContent = checked + '/' + total + ' 已完成';
  var result = document.getElementById('checklistResult');
  if (result) result.style.display = checked === total ? 'block' : 'none';
  try { localStorage.setItem(CHECKLIST_KEY, JSON.stringify(states)); } catch(e) {}
}

function initChecklist() {
  try {
    var saved = JSON.parse(localStorage.getItem(CHECKLIST_KEY));
    if (saved) {
      document.querySelectorAll('#checklistItems input[type="checkbox"]').forEach(function(cb) {
        var key = cb.getAttribute('data-key');
        if (saved[key]) cb.checked = true;
      });
      updateChecklist();
    }
  } catch(e) {}
}

function resetChecklist() {
  localStorage.removeItem(CHECKLIST_KEY);
  document.querySelectorAll('#checklistItems input[type="checkbox"]').forEach(function(cb) {
    cb.checked = false;
  });
  updateChecklist();
}

/* --- Character Counter --- */
function initCharCounter() {
  var ta = document.querySelector('.create-input-area textarea');
  if (ta) {
    ta.addEventListener('input', function() { updateCharCount(this); });
  }
}

function updateCharCount(ta) {
  var counter = document.querySelector('.char-counter');
  if (!counter) return;
  var len = ta.value.length;
  var max = 2000;
  counter.textContent = len + '/' + max;
  counter.style.color = len > max ? '#EF4444' : (len > 1800 ? '#F59E0B' : 'var(--text-tertiary)');
}

/* --- Navigation --- */
function initNavigation() {
  var nav = document.querySelector('.nav');
  var mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  var mobileMenu = document.querySelector('.mobile-menu');

  window.addEventListener('scroll', function() {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      mobileMenu.classList.toggle('open');
      var icon = mobileMenuBtn.querySelector('i');
      var isOpen = mobileMenu.classList.contains('open');
      icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
      mobileMenuBtn.setAttribute('aria-label', isOpen ? '关闭菜单' : '打开菜单');
    });

    mobileMenu.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        mobileMenu.classList.remove('open');
        mobileMenuBtn.querySelector('i').className = 'fas fa-bars';
      });
    });
  }

  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(function(link) {
    if (link.getAttribute('href') === currentPage) link.classList.add('active');
  });
}

/* --- Scroll Animations --- */
function initScrollAnimations() {
  var els = document.querySelectorAll('.animate-on-scroll');
  if (!els.length) return;
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  els.forEach(function(el) { observer.observe(el); });
}

/* --- FAQ Accordion --- */
function initFaqAccordion() {
  document.querySelectorAll('.faq-question').forEach(function(question) {
    question.addEventListener('click', function() {
      var item = this.parentElement;
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function(i) { i.classList.remove('open'); });
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* --- Create Page Logic --- */
function initCreatePage() {
  var toolItems = document.querySelectorAll('.create-tool-item');
  var generateBtn = document.getElementById('generateBtn');
  var previewArea = document.querySelector('.create-preview');
  var sliderInputs = document.querySelectorAll('.param-slider');

  // Tool selection
  var toolIcons = {
    '文生视频': 'fa-pen-fancy', '图生视频': 'fa-image',
    '视频编辑': 'fa-scissors', '配音音效': 'fa-microphone', '角色管理': 'fa-user-check'
  };
  var createHeader = document.querySelector('.create-header h2');
  toolItems.forEach(function(item) {
    item.addEventListener('click', function() {
      toolItems.forEach(function(i) { i.classList.remove('active'); });
      this.classList.add('active');
      var toolName = this.querySelector('span:last-child').textContent.trim();
      var icon = toolIcons[toolName] || 'fa-wand-magic-sparkles';
      if (createHeader) {
        createHeader.innerHTML = '<i class="fas fa-' + icon + '" style="color:var(--color-primary-light);margin-right:8px;"></i>' + toolName;
      }
    });
  });

  // Slider value display
  sliderInputs.forEach(function(slider) {
    var display = slider.parentElement.querySelector('.param-value .param-value-num');
    if (display) {
      display.textContent = slider.value;
      slider.setAttribute('aria-valuenow', slider.value);
      slider.addEventListener('input', function() {
        display.textContent = this.value;
        this.setAttribute('aria-valuenow', this.value);
      });
    }
  });

  // Generate button
  if (generateBtn && previewArea) {
    generateBtn.addEventListener('click', function() {
      var textarea = document.querySelector('.create-input-area textarea');
      var prompt = textarea ? textarea.value.trim() : '';
      
      if (!prompt) {
        this.innerHTML = '<i class="fas fa-exclamation-circle"></i> 请先输入描述';
        this.style.opacity = '0.7';
        setTimeout(function() {
          generateBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> 开始生成';
          generateBtn.style.opacity = '1';
        }, 1500);
        return;
      }

      startGeneration(prompt, generateBtn, previewArea);
    });
  }

  // Model select listener
  var modelSelect = document.getElementById('modelSelect');
  if (modelSelect) {
    modelSelect.addEventListener('change', function() { updateParamPresets(this.value); });
  }

  // Reference image upload
  var refBtn = document.querySelector('.create-input-actions .btn-ghost');
  if (refBtn) {
    refBtn.addEventListener('click', function(e) {
      e.preventDefault();
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = function(e2) {
        var file = e2.target.files[0];
        if (file) {
          var reader = new FileReader();
          reader.onload = function(ev) {
            refBtn.innerHTML = '<i class="fas fa-check"></i> 已上传';
            refBtn.style.borderColor = 'var(--color-primary)';
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    });
  }
}

/* --- Generation with Progress --- */
function startGeneration(prompt, btn, previewArea) {
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 生成中...';
  btn.disabled = true;

  // Show progress bar
  var progressContainer = document.getElementById('progressContainer');
  if (progressContainer) progressContainer.style.display = 'block';
  
  var stages = [
    { label: '正在分析提示词...', pct: 10, icon: 'fa-brain' },
    { label: '正在生成分镜脚本...', pct: 30, icon: 'fa-pen-fancy' },
    { label: '正在渲染画面...', pct: 60, icon: 'fa-film' },
    { label: '正在合成音频...', pct: 85, icon: 'fa-music' },
    { label: '正在导出成品...', pct: 100, icon: 'fa-check-circle' }
  ];

  var progressFill = document.getElementById('progressFill');
  var progressLabel = document.getElementById('progressLabel');
  var currentStage = 0;

  function advanceStage() {
    if (currentStage >= stages.length) {
      finishGeneration(prompt, btn, previewArea);
      return;
    }
    var stage = stages[currentStage];
    if (progressFill) progressFill.style.width = stage.pct + '%';
    if (progressLabel) progressLabel.innerHTML = '<i class="fas ' + stage.icon + '"></i> ' + stage.label;
    currentStage++;
    var delay = currentStage === 1 ? 800 : (currentStage === stages.length ? 1200 : 600 + Math.random() * 400);
    setTimeout(advanceStage, delay);
  }

  advanceStage();
}

function finishGeneration(prompt, btn, previewArea) {
  // Reset button
  btn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> 开始生成';
  btn.disabled = false;
  // Hide progress
  var progressContainer = document.getElementById('progressContainer');
  if (progressContainer) progressContainer.style.display = 'none';

  // Get current params
  var qualitySelect = document.getElementById('qualitySelect');
  var durationSlider = document.getElementById('durationSlider');
  var styleSelect = document.getElementById('styleSelect');
  var modelSelect = document.getElementById('modelSelect');

  var params = {
    quality: qualitySelect ? qualitySelect.value : '1080p',
    duration: durationSlider ? durationSlider.value : '15',
    style: styleSelect ? styleSelect.value : 'cinematic',
    model: modelSelect ? modelSelect.options[modelSelect.selectedIndex].text : 'CineAI Pro'
  };

  var genTime = (2 + Math.random() * 3).toFixed(1);
  var fileName = 'cineai_' + Date.now() + '.mp4';

  // Save to history
  var entry = {
    prompt: prompt.substring(0, 200),
    quality: params.quality,
    duration: params.duration,
    style: params.style,
    model: params.model,
    genTime: genTime,
    fileName: fileName,
    thumbnail: '🎬'
  };
  saveHistory(entry);

  showGenerationResult(prompt, previewArea, params, genTime, fileName);
  
  // Show quality checklist
  var qc = document.getElementById('qualityChecklist');
  if (qc) qc.style.display = 'block';
}

/* --- Generation Result --- */
function showGenerationResult(prompt, container, params, genTime, fileName) {
  var safePrompt = prompt.substring(0, 120);
  safePrompt = safePrompt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  if (prompt.length > 120) safePrompt += '...';

  container.innerHTML = [
    '<div style="width:100%;height:100%;display:flex;flex-direction:column;background:var(--bg-secondary);">',
      '<div style="flex:1;display:flex;align-items:center;justify-content:center;position:relative;background:linear-gradient(135deg,rgba(124,58,237,0.1),rgba(6,182,212,0.1));">',
        '<div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,rgba(124,58,237,0.1),transparent 70%);"></div>',
        '<div style="position:relative;z-index:2;text-align:center;padding:20px;">',
          '<div style="font-size:48px;margin-bottom:8px;animation:pulse-shadow 2s ease-in-out infinite;display:inline-block;">▶️</div>',
          '<div style="font-size:var(--font-size-lg);font-weight:600;margin-bottom:4px;">' + safePrompt + '</div>',
          '<div style="display:flex;gap:12px;justify-content:center;margin-top:16px;">',
            '<button class="btn btn-primary btn-sm preview-play-btn"><i class="fas fa-play"></i> 播放预览</button>',
            '<button class="btn btn-secondary btn-sm download-btn"><i class="fas fa-download"></i> 下载</button>',
            '<button class="btn btn-ghost btn-sm edit-btn"><i class="fas fa-sliders-h"></i> 精调</button>',
          '</div>',
        '</div>',
      '</div>',
      '<div style="display:flex;gap:16px;padding:10px 20px;border-top:1px solid var(--border-color-light);font-size:var(--font-size-xs);color:var(--text-tertiary);flex-wrap:wrap;">',
        '<span><i class="fas fa-clock"></i> ' + genTime + '秒</span>',
        '<span><i class="fas fa-expand"></i> ' + escapeHtml(params.quality) + '</span>',
        '<span><i class="fas fa-hourglass-half"></i> ' + escapeHtml(params.duration) + '秒</span>',
        '<span><i class="fas fa-palette"></i> ' + escapeHtml(params.style) + '</span>',
        '<span><i class="fas fa-microchip"></i> ' + escapeHtml(params.model) + '</span>',
      '</div>',
    '</div>'
  ].join('');

  // Event listeners
  var playBtn = container.querySelector('.preview-play-btn');
  if (playBtn) {
    playBtn.addEventListener('click', function() {
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 加载中...';
      setTimeout(function() {
        playBtn.innerHTML = '<i class="fas fa-play"></i> 播放预览';
        alert('🎬 视频预览播放\n\n文件: ' + fileName + '\n时长: ' + params.duration + '秒\n分辨率: ' + params.quality + '\n\n（演示模式，实际播放需集成播放器）');
      }, 800);
    });
  }
  var dlBtn = container.querySelector('.download-btn');
  if (dlBtn) {
    dlBtn.addEventListener('click', function() {
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 准备中...';
      setTimeout(function() {
        dlBtn.innerHTML = '<i class="fas fa-download"></i> 下载';
        alert('📥 下载: ' + fileName + '\n\n文件已保存到生成历史中，可随时下载。');
      }, 600);
    });
  }
  var edBtn = container.querySelector('.edit-btn');
  if (edBtn) {
    edBtn.addEventListener('click', function() {
      alert('🎛️ 精调面板\n\n可调整：\n- 画面风格\n- 色彩倾向\n- 镜头运动\n- 节奏速度\n\n（精调功能即将上线）');
    });
  }
}

/* --- History Rendering --- */
function renderHistory() {
  var container = document.getElementById('historyList');
  if (!container) return;
  var history = getHistory();
  
  if (history.length === 0) {
    container.innerHTML = '<div style="font-size:var(--font-size-sm);color:var(--text-tertiary);padding:var(--space-md);text-align:center;"><i class="fas fa-clock" style="font-size:24px;margin-bottom:8px;display:block;opacity:0.3;"></i>暂无生成记录</div>';
    return;
  }

  var html = '';
  for (var i = 0; i < Math.min(history.length, 10); i++) {
    var h = history[i];
    var snippet = h.prompt.substring(0, 30);
    snippet = snippet.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    if (h.prompt.length > 30) snippet += '...';
    html += [
      '<div class="history-item" style="padding:10px 12px;border-radius:var(--border-radius-md);cursor:pointer;transition:background var(--transition-fast);margin-bottom:4px;border:1px solid transparent;"',
      ' onmouseover="this.style.background=\'rgba(124,58,237,0.08)\';this.style.borderColor=\'rgba(124,58,237,0.15)\'"',
      ' onmouseout="this.style.background=\'\';this.style.borderColor=\'transparent\'"',
      ' onclick="loadHistoryItem(' + h.id + ')">',
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;">',
          '<div style="font-size:var(--font-size-xs);font-weight:600;color:var(--text-primary);flex:1;line-height:1.4;">' + snippet + '</div>',
          '<button onclick="event.stopPropagation();deleteHistoryItem(' + h.id + ')" style="background:none;border:none;color:var(--text-tertiary);cursor:pointer;font-size:11px;padding:2px 4px;opacity:0.4;" onmouseover="this.style.opacity=\'1\'" onmouseout="this.style.opacity=\'0.4\'">&times;</button>',
        '</div>',
        '<div style="font-size:10px;color:var(--text-tertiary);margin-top:4px;display:flex;gap:8px;">',
          '<span>' + escapeHtml(h.quality) + '</span>',
          '<span>' + escapeHtml(h.duration) + 's</span>',
          '<span>' + escapeHtml(h.createdAt) + '</span>',
        '</div>',
      '</div>'
    ].join('');
  }

  if (history.length > 10) {
    html += '<div style="text-align:center;padding:8px;font-size:var(--font-size-xs);color:var(--text-tertiary);">还有 ' + (history.length - 10) + ' 条记录</div>';
  }

  html += '<div style="text-align:center;padding:8px;"><button onclick="clearHistory()" style="background:none;border:none;color:var(--text-tertiary);font-size:11px;cursor:pointer;text-decoration:underline;">清空历史</button></div>';

  container.innerHTML = html;
}

function loadHistoryItem(id) {
  var history = getHistory();
  var item = null;
  for (var i = 0; i < history.length; i++) {
    if (history[i].id === id) { item = history[i]; break; }
  }
  if (!item) return;
  var ta = document.querySelector('.create-input-area textarea');
  if (ta) ta.value = item.prompt;
  var previewArea = document.querySelector('.create-preview');
  if (previewArea) {
    showGenerationResult(item.prompt, previewArea, item, item.genTime, item.fileName);
  }
}

/* --- Parameter Presets --- */
function updateParamPresets(model) {
  var durationSlider = document.getElementById('durationSlider');
  var qualitySelect = document.getElementById('qualitySelect');
  var styleSelect = document.getElementById('styleSelect');

  if (!durationSlider) return;

  var presets = {
    'cineai-pro': { duration: 30, quality: '1080p', style: 'cinematic' },
    'cineai-turbo': { duration: 15, quality: '720p', style: 'natural' },
    'cineai-studio': { duration: 60, quality: '4k', style: 'cinematic' },
    'cineai-anime': { duration: 15, quality: '1080p', style: 'anime' }
  };

  var preset = presets[model] || presets['cineai-pro'];
  durationSlider.value = preset.duration;
  durationSlider.setAttribute('aria-valuenow', preset.duration);
  var durationDisplay = durationSlider.parentElement.querySelector('.param-value .param-value-num');
  if (durationDisplay) durationDisplay.textContent = preset.duration;
  if (qualitySelect) qualitySelect.value = preset.quality;
  if (styleSelect) styleSelect.value = preset.style;
}
