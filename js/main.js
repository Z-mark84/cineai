/* ============================================
   CineAI - 全局交互脚本
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
  initNavigation();
  initScrollAnimations();
  initFaqAccordion();
  // initPricingToggle removed — pricing.html uses inline onclick
  initCreatePage();
});

/* --- Navigation --- */
function initNavigation() {
  const nav = document.querySelector('.nav');
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');

  // Scroll effect
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      mobileMenu.classList.toggle('open');
      const icon = mobileMenuBtn.querySelector('i');
      if (mobileMenu.classList.contains('open')) {
        icon.className = 'fas fa-times';
        mobileMenuBtn.setAttribute('aria-label', '关闭菜单');
      } else {
        icon.className = 'fas fa-bars';
        mobileMenuBtn.setAttribute('aria-label', '打开菜单');
      }
    });

    // Close mobile menu on link click
    mobileMenu.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        mobileMenu.classList.remove('open');
        const icon = mobileMenuBtn.querySelector('i');
        icon.className = 'fas fa-bars';
      });
    });
  }

  // Set active nav link based on current page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(function(link) {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });
}

/* --- Scroll Animations --- */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  if (animatedElements.length === 0) return;

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  animatedElements.forEach(function(el) {
    observer.observe(el);
  });
}

/* --- FAQ Accordion --- */
function initFaqAccordion() {
  document.querySelectorAll('.faq-question').forEach(function(question) {
    question.addEventListener('click', function() {
      const item = this.parentElement;
      const isOpen = item.classList.contains('open');
      
      // Close all
      document.querySelectorAll('.faq-item').forEach(function(i) {
        i.classList.remove('open');
      });
      
      // Toggle current
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });
}

/* --- Create Page Logic --- */
function initCreatePage() {
  const toolItems = document.querySelectorAll('.create-tool-item');
  const generateBtn = document.getElementById('generateBtn');
  const previewArea = document.querySelector('.create-preview');
  const sliderInputs = document.querySelectorAll('.param-slider');

  // Tool selection
  const toolIcons = {
    '文生视频': 'fa-pen-fancy',
    '图生视频': 'fa-image',
    '视频编辑': 'fa-scissors',
    '配音音效': 'fa-microphone',
    '角色管理': 'fa-user-check'
  };
  const createHeader = document.querySelector('.create-header h2');
  toolItems.forEach(function(item) {
    item.addEventListener('click', function() {
      toolItems.forEach(function(i) { i.classList.remove('active'); });
      this.classList.add('active');
      // Update header
      const toolName = this.querySelector('span:last-child').textContent.trim();
      const icon = toolIcons[toolName] || 'fa-wand-magic-sparkles';
      if (createHeader) {
        createHeader.innerHTML = '<i class="fas fa-' + icon + '" style="color:var(--color-primary-light);margin-right:8px;"></i>' + toolName;
      }
    });
  });

  // Slider value display
  sliderInputs.forEach(function(slider) {
    const display = slider.parentElement.querySelector('.param-value .param-value-num');
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
      const textarea = document.querySelector('.create-input-area textarea');
      const prompt = textarea ? textarea.value.trim() : '';
      
      if (!prompt) {
        this.innerHTML = '<i class="fas fa-exclamation-circle"></i> 请先输入描述';
        this.style.opacity = '0.7';
        setTimeout(() => {
          this.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> 开始生成';
          this.style.opacity = '1';
        }, 1500);
        return;
      }

      // Loading state
      const originalText = this.innerHTML;
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 生成中...';
      this.disabled = true;

      // Simulate generation
      setTimeout(function() {
        showGenerationResult(prompt, previewArea);
        generateBtn.innerHTML = originalText;
        generateBtn.disabled = false;
      }, 2500);
    });
  }

  // Model select listener
  const modelSelect = document.getElementById('modelSelect');
  if (modelSelect) {
    modelSelect.addEventListener('change', function() {
      updateParamPresets(this.value);
    });
  }
}

/* --- Generation Result Simulation --- */
function showGenerationResult(prompt, container) {
  // Sanitize user input to prevent XSS
  var safePrompt = prompt.substring(0, 80);
  safePrompt = safePrompt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  if (prompt.length > 80) safePrompt += '...';
  
  container.innerHTML = `
    <div style="width:100%;height:100%;display:flex;flex-direction:column;background:var(--bg-secondary);">
      <div style="flex:1;display:flex;align-items:center;justify-content:center;position:relative;background:linear-gradient(135deg,rgba(124,58,237,0.1),rgba(6,182,212,0.1));">
        <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,rgba(124,58,237,0.1),transparent 70%);"></div>
        <div style="position:relative;z-index:2;text-align:center;">
          <div style="font-size:64px;margin-bottom:16px;">🎬</div>
          <div style="font-size:var(--font-size-lg);font-weight:600;margin-bottom:8px;">视频生成完成</div>
          <div style="font-size:var(--font-size-sm);color:var(--text-tertiary);max-width:400px;margin-bottom:20px;">
            "${safePrompt}"
          </div>
          <div style="display:flex;gap:12px;justify-content:center;">
            <button class="btn btn-primary btn-sm download-btn" type="button">
              <i class="fas fa-download"></i> 下载视频
            </button>
            <button class="btn btn-secondary btn-sm edit-btn" type="button">
              <i class="fas fa-edit"></i> 继续编辑
            </button>
          </div>
        </div>
      </div>
      <div style="display:flex;gap:16px;padding:16px 24px;border-top:1px solid var(--border-color-light);font-size:var(--font-size-sm);color:var(--text-tertiary);">
        <span>⏱ 生成耗时: 2.3秒</span>
        <span>🎯 分辨率: 1080p</span>
        <span>📹 时长: 15秒</span>
      </div>
    </div>
  `;
  
  // Attach event listeners (safe, no inline onclick)
  var dlBtn = container.querySelector('.download-btn');
  if (dlBtn) dlBtn.addEventListener('click', function() { alert('下载功能演示'); });
  var edBtn = container.querySelector('.edit-btn');
  if (edBtn) edBtn.addEventListener('click', function() { alert('编辑功能演示'); });
}

/* --- Parameter Presets --- */
function updateParamPresets(model) {
  const durationSlider = document.getElementById('durationSlider');
  const qualitySelect = document.getElementById('qualitySelect');
  const styleSelect = document.getElementById('styleSelect');

  if (!durationSlider) return;

  const presets = {
    'cineai-pro': { duration: 30, quality: '1080p', style: 'cinematic' },
    'cineai-turbo': { duration: 15, quality: '720p', style: 'natural' },
    'cineai-studio': { duration: 60, quality: '4k', style: 'cinematic' },
    'cineai-anime': { duration: 15, quality: '1080p', style: 'anime' }
  };

  const preset = presets[model] || presets['cineai-pro'];
  
  durationSlider.value = preset.duration;
  durationSlider.setAttribute('aria-valuenow', preset.duration);
  const durationDisplay = durationSlider.parentElement.querySelector('.param-value .param-value-num');
  if (durationDisplay) durationDisplay.textContent = preset.duration;

  if (qualitySelect) qualitySelect.value = preset.quality;
  if (styleSelect) styleSelect.value = preset.style;
}
