/**
 * ══════════════════════════════════════════════════════════════════
 * WZKER FEEDBACK & IDEAS CONTROLLER (شاركنا رأيك واقتراحاتك)
 * تواصل مباشر: واتساب وتيليجرام (201158601817) - جيميل (omartegany8@gmail.com)
 * ══════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  class WzkerFeedbackHub {
    constructor() {
      this.currentTab = 'ideasTab';
      this.inputMode = 'text'; // 'text' or 'voice'
      this.currentRating = 5;
      this.aspectRatings = {
        ui: 5,
        audio: 5,
        speed: 5,
        content: 5
      };
      this.selectedCategory = 'feature';
      this.ticketCode = this.generateTicketCode();
      this.attachedImage = null;

      // Contact Details
      this.whatsappNumber = '201158601817';
      this.telegramContact = '201158601817';
      this.developerEmail = 'omartegany8@gmail.com';

      // Voice Recording State
      this.mediaRecorder = null;
      this.audioChunks = [];
      this.audioBlob = null;
      this.audioUrl = null;
      this.isRecording = false;
      this.recordStartTime = null;
      this.recordTimerInterval = null;
      this.animFrameId = null;
      this.audioPreviewObj = null;

      this.categoryLabels = {
        feature: 'اقتراح فكرة جديدة',
        ux: 'تحسين في التصميم والسرعة',
        bug: 'مشكلة أو عطل فني',
        content: 'إضافة تلاوات وأدعية',
        thanks: 'كلمة حلوة وشكر'
      };

      this.categoryPlaceholders = {
        feature: 'إيه الفكرة أو الميزة اللي حابب تشوفها في وذكر؟ احكيلي عنها براحتك...',
        ux: 'إيه اللي محتاج يتظبط أكتر في الخطوط، الألوان، أو حركة التنقل عشان تكون مريحة لعينك؟...',
        bug: 'إيه المشكلة اللي ظهرت معاك؟ وفي أنهي شاشة ظهرت عشان أحلها فوراً؟...',
        content: 'حابب نضيف سور، أدعية، أو قراء معينين؟ قولي عليهم...',
        thanks: 'جزاك الله كل خير! كلامك ودعواتك هي أكبر تشجيع ليا عشان أطور التطبيق أكتر...'
      };

      this.ratingLabels = {
        1: { text: '💔 محتاج شغل كتير وتصليح', color: '#E65100' },
        2: { text: '⚠️ في حجات محتاجة تتراجع', color: '#F57C00' },
        3: { text: '🌿 شغال كويس وعايزينه أحسن', color: '#827717' },
        4: { text: '⭐ تجربة جميلة ومميزة جداً', color: '#2E7D32' },
        5: { text: '👑 تحفة بجد وتسلم إيدك!', color: '#C9933B' }
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init());
      } else {
        this.init();
      }
    }

    init() {
      this.bindTabs();
      this.bindStars();
      this.bindAspects();
      this.bindInputMode();
      this.bindCategories();
      this.bindTextarea();
      this.bindTicketSync();
      this.bindDropzone();
      this.bindQuickTags();
      this.initWaveformCanvas();
      this.renderRoadmap();
      this.renderTicketsHistory();
      this.updateTicketBadgeCount();
      this.setRating(5);
    }

    // ── 1. كود كارت الفكرة ──
    generateTicketCode() {
      const rand = Math.floor(1000 + Math.random() * 9000);
      return `#WZK-${rand}`;
    }

    // ── 2. التبديل بين الأقسام ──
    bindTabs() {
      const tabBtns = document.querySelectorAll('.feedback-tab-btn');
      tabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const tabId = btn.getAttribute('data-tab');
          this.switchTab(tabId);
        });
      });
    }

    switchTab(tabId) {
      this.currentTab = tabId;
      document.querySelectorAll('.feedback-tab-btn').forEach((b) => {
        if (b.getAttribute('data-tab') === tabId) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });

      document.querySelectorAll('.feedback-tab-pane').forEach((pane) => {
        if (pane.id === tabId) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });

      if (tabId === 'roadmapTab') {
        this.renderRoadmap();
      } else if (tabId === 'ticketsTab') {
        this.renderTicketsHistory();
      }
    }

    // ── 3. التقييم والنجوم ──
    bindStars() {
      const stars = document.querySelectorAll('.feedback-star-btn');
      stars.forEach((star) => {
        star.addEventListener('click', () => {
          const val = parseInt(star.getAttribute('data-value'), 10);
          this.setRating(val);
        });

        star.addEventListener('mouseenter', () => {
          const val = parseInt(star.getAttribute('data-value'), 10);
          this.previewRating(val);
        });
      });

      const starsRow = document.querySelector('.feedback-stars-row');
      if (starsRow) {
        starsRow.addEventListener('mouseleave', () => {
          this.renderStars();
          this.updateRatingBadge(this.currentRating);
        });
      }
    }

    setRating(val) {
      this.currentRating = val;
      this.renderStars();
      this.updateRatingBadge(val);
      this.syncTicketPreview();
    }

    previewRating(val) {
      const stars = document.querySelectorAll('.feedback-star-btn');
      stars.forEach((star) => {
        const sVal = parseInt(star.getAttribute('data-value'), 10);
        if (sVal <= val) {
          star.classList.add('selected');
        } else {
          star.classList.remove('selected');
        }
      });
      this.updateRatingBadge(val);
    }

    renderStars() {
      const stars = document.querySelectorAll('.feedback-star-btn');
      stars.forEach((star) => {
        const sVal = parseInt(star.getAttribute('data-value'), 10);
        if (sVal <= this.currentRating) {
          star.classList.add('selected');
        } else {
          star.classList.remove('selected');
        }
      });
    }

    updateRatingBadge(val) {
      const badge = document.getElementById('feedbackRatingBadge');
      if (!badge) return;
      const info = this.ratingLabels[val] || this.ratingLabels[5];
      badge.innerHTML = `<span>${info.text}</span>`;
      badge.style.borderColor = info.color;
    }

    bindAspects() {
      const aspectStars = document.querySelectorAll('.aspect-star-mini');
      aspectStars.forEach((star) => {
        star.addEventListener('click', () => {
          const aspect = star.getAttribute('data-aspect');
          const val = parseInt(star.getAttribute('data-val'), 10);
          if (aspect && val) {
            this.aspectRatings[aspect] = val;
            this.renderAspect(aspect);
          }
        });
      });
    }

    renderAspect(aspect) {
      const stars = document.querySelectorAll(`.aspect-star-mini[data-aspect="${aspect}"]`);
      const val = this.aspectRatings[aspect] || 5;
      stars.forEach((s) => {
        const sVal = parseInt(s.getAttribute('data-val'), 10);
        if (sVal <= val) {
          s.classList.add('selected');
        } else {
          s.classList.remove('selected');
        }
      });
      const lbl = document.getElementById(`aspectScore_${aspect}`);
      if (lbl) lbl.textContent = `${val} / 5`;
    }

    // ── 4. التبديل بين الكتابة والتسجيل الصوتي ──
    bindInputMode() {
      const btns = document.querySelectorAll('.input-mode-btn');
      btns.forEach((btn) => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const mode = btn.getAttribute('data-mode');
          this.switchInputMode(mode);
        });
      });
    }

    switchInputMode(mode) {
      this.inputMode = mode;
      const textGroup = document.getElementById('feedbackTextFormGroup');
      const voiceStudio = document.getElementById('voiceStudioContainer');

      if (mode === 'voice') {
        if (textGroup) textGroup.style.display = 'none';
        if (voiceStudio) voiceStudio.classList.add('active');
      } else {
        if (textGroup) textGroup.style.display = 'flex';
        if (voiceStudio) voiceStudio.classList.remove('active');
      }
    }

    // ── 5. تسجيل الصوت والموجات ──
    initWaveformCanvas() {
      const canvas = document.getElementById('voiceWaveformCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.width = canvas.offsetWidth || 340;
      canvas.height = 50;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = '#D29571';
      ctx.lineWidth = 2;
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    }

    toggleVoiceRecord() {
      if (this.isRecording) {
        this.stopVoiceRecord();
      } else {
        this.startVoiceRecord();
      }
    }

    async startVoiceRecord() {
      const micBtn = document.getElementById('voiceMicBtn');
      const micPulse = document.getElementById('voiceMicPulse');
      const statusMsg = document.getElementById('voiceStatusMsg');

      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          this.mediaRecorder = new MediaRecorder(stream);
          this.audioChunks = [];

          this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) this.audioChunks.push(e.data);
          };

          this.mediaRecorder.onstop = () => {
            this.audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            this.audioUrl = URL.createObjectURL(this.audioBlob);
            this.showVoicePreview();
            stream.getTracks().forEach(t => t.stop());
          };

          this.mediaRecorder.start();
        } else {
          this.audioBlob = new Blob(['sample-audio'], { type: 'audio/webm' });
          this.audioUrl = 'https://server8.mp3quran.net/refat/001.mp3';
        }

        this.isRecording = true;
        if (micBtn) {
          micBtn.classList.add('recording');
          micBtn.innerHTML = '<i class="fa-solid fa-stop"></i>';
        }
        if (micPulse) micPulse.classList.add('pulsing');
        if (statusMsg) statusMsg.textContent = 'بيسجل دلوقتي... اتكلم براحتك وقول كل اللي نفسك فيه';

        this.startVoiceTimer();
        this.startWaveformAnimation();
      } catch (err) {
        console.warn('Mic access:', err);
        this.isRecording = true;
        if (micBtn) {
          micBtn.classList.add('recording');
          micBtn.innerHTML = '<i class="fa-solid fa-stop"></i>';
        }
        if (micPulse) micPulse.classList.add('pulsing');
        if (statusMsg) statusMsg.textContent = 'بيسجل تجريبي... اتكلم بوضوح';
        this.startVoiceTimer();
        this.startWaveformAnimation();
      }
    }

    stopVoiceRecord() {
      const micBtn = document.getElementById('voiceMicBtn');
      const micPulse = document.getElementById('voiceMicPulse');
      const statusMsg = document.getElementById('voiceStatusMsg');

      this.isRecording = false;
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      } else {
        this.audioUrl = 'https://server8.mp3quran.net/refat/001.mp3';
        this.showVoicePreview();
      }

      if (micBtn) {
        micBtn.classList.remove('recording');
        micBtn.innerHTML = '<img src="images/icons/recorde.png" style="width: 32px; height: 32px;" alt="Record">';
      }
      if (micPulse) micPulse.classList.remove('pulsing');
      if (statusMsg) statusMsg.textContent = 'وقفنا التسجيل! تقدر تسمع صوتك أو تسجل تاني لو حابب';

      clearInterval(this.recordTimerInterval);
      cancelAnimationFrame(this.animFrameId);
      this.initWaveformCanvas();
    }

    startVoiceTimer() {
      this.recordStartTime = Date.now();
      const timerEl = document.getElementById('voiceTimerDisplay');
      this.recordTimerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - this.recordStartTime) / 1000);
        const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const secs = String(elapsed % 60).padStart(2, '0');
        if (timerEl) timerEl.textContent = `${mins}:${secs}`;
        if (elapsed >= 120) this.stopVoiceRecord();
      }, 1000);
    }

    startWaveformAnimation() {
      const canvas = document.getElementById('voiceWaveformCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let step = 0;

      const draw = () => {
        if (!this.isRecording) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#9C3D32';

        const midY = canvas.height / 2;
        ctx.moveTo(0, midY);

        for (let x = 0; x < canvas.width; x += 4) {
          const amp = Math.sin((x * 0.05) + step) * Math.cos((x * 0.02) + step * 0.5) * 16;
          ctx.lineTo(x, midY + amp);
        }
        ctx.stroke();
        step += 0.12;

        this.animFrameId = requestAnimationFrame(draw);
      };

      draw();
    }

    showVoicePreview() {
      const previewCard = document.getElementById('voicePreviewCard');
      if (previewCard) previewCard.classList.add('active');
      this.syncTicketPreview();
    }

    toggleVoicePlayback() {
      const playBtn = document.getElementById('voicePlayToggleBtn');
      if (!this.audioPreviewObj) {
        this.audioPreviewObj = new Audio(this.audioUrl || 'https://server8.mp3quran.net/refat/001.mp3');
        this.audioPreviewObj.onended = () => {
          if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        };
      }

      if (this.audioPreviewObj.paused) {
        this.audioPreviewObj.play().then(() => {
          if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        }).catch(e => console.warn('Audio play error:', e));
      } else {
        this.audioPreviewObj.pause();
        if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      }
    }

    deleteVoiceRecord() {
      if (this.audioPreviewObj) {
        this.audioPreviewObj.pause();
        this.audioPreviewObj = null;
      }
      this.audioUrl = null;
      this.audioBlob = null;
      const previewCard = document.getElementById('voicePreviewCard');
      if (previewCard) previewCard.classList.remove('active');
      const timerEl = document.getElementById('voiceTimerDisplay');
      if (timerEl) timerEl.textContent = '00:00';
      const statusMsg = document.getElementById('voiceStatusMsg');
      if (statusMsg) statusMsg.textContent = 'دوس على المايك وسجل ملاحظتك بصوتك';
      this.syncTicketPreview();
    }

    // ── 6. معاينة كارت الفكرة المباشر ──
    bindTicketSync() {
      const subj = document.getElementById('feedbackSubject');
      const name = document.getElementById('feedbackUserName');
      const msg = document.getElementById('feedbackMessage');

      [subj, name, msg].forEach((el) => {
        if (el) el.addEventListener('input', () => this.syncTicketPreview());
      });
      this.syncTicketPreview();
    }

    syncTicketPreview() {
      const nameVal = document.getElementById('feedbackUserName')?.value.trim() || 'صاحب الفكرة';
      const subjVal = document.getElementById('feedbackSubject')?.value.trim() || this.categoryLabels[this.selectedCategory];
      const codeVal = this.ticketCode;

      const previewName = document.getElementById('ticketPreviewName');
      const previewSubj = document.getElementById('ticketPreviewSubject');
      const previewCode = document.getElementById('ticketPreviewCode');
      const previewCat = document.getElementById('ticketPreviewCategory');

      if (previewName) previewName.textContent = nameVal;
      if (previewSubj) previewSubj.textContent = subjVal;
      if (previewCode) previewCode.textContent = codeVal;
      if (previewCat) previewCat.textContent = this.categoryLabels[this.selectedCategory];
    }

    // ── 7. تصنيفات الملاحظة ──
    bindCategories() {
      const chips = document.querySelectorAll('.feedback-chip-btn');
      const textarea = document.getElementById('feedbackMessage');

      chips.forEach((chip) => {
        chip.addEventListener('click', () => {
          chips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          const cat = chip.getAttribute('data-category');
          this.selectedCategory = cat;

          if (textarea && !textarea.value.trim()) {
            textarea.placeholder = this.categoryPlaceholders[cat] || this.categoryPlaceholders.feature;
          }
          this.syncTicketPreview();
        });
      });
    }

    bindTextarea() {
      const textarea = document.getElementById('feedbackMessage');
      const counter = document.getElementById('feedbackCharCount');
      if (!textarea || !counter) return;

      textarea.addEventListener('input', () => {
        const len = textarea.value.length;
        counter.textContent = `${len} / 600`;
        if (len > 540) {
          counter.classList.add('warning');
        } else {
          counter.classList.remove('warning');
        }
      });
    }

    bindQuickTags() {
      const tags = document.querySelectorAll('.feedback-quick-tag-pill');
      const textarea = document.getElementById('feedbackMessage');
      if (!textarea) return;

      tags.forEach((tag) => {
        tag.addEventListener('click', () => {
          const text = tag.getAttribute('data-insert') || tag.textContent.replace('+', '').trim();
          if (!textarea.value.includes(text)) {
            textarea.value = textarea.value ? `${textarea.value}\n• ${text}` : `• ${text}`;
            textarea.dispatchEvent(new Event('input'));
            textarea.focus();
          }
        });
      });
    }

    // ── 8. رفع المرفقات والصور ──
    bindDropzone() {
      const dropzone = document.getElementById('feedbackDropzone');
      const fileInput = document.getElementById('feedbackFileInput');
      if (!dropzone || !fileInput) return;

      dropzone.addEventListener('click', (e) => {
        if (e.target.closest('.feedback-remove-thumb-btn')) return;
        fileInput.click();
      });

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleImageFile(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files[0]) {
          this.handleImageFile(fileInput.files[0]);
        }
      });
    }

    handleImageFile(file) {
      if (!file.type.startsWith('image/')) {
        if (window.showToast) window.showToast('اختار ملف صورة (PNG أو JPG)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.attachedImage = e.target.result;
        const thumbWrap = document.getElementById('feedbackPreviewThumbWrap');
        const thumbImg = document.getElementById('feedbackThumbImg');
        if (thumbWrap && thumbImg) {
          thumbImg.src = this.attachedImage;
          thumbWrap.style.display = 'block';
        }
      };
      reader.readAsDataURL(file);
    }

    removeAttachedImage() {
      this.attachedImage = null;
      const thumbWrap = document.getElementById('feedbackPreviewThumbWrap');
      const fileInput = document.getElementById('feedbackFileInput');
      if (thumbWrap) thumbWrap.style.display = 'none';
      if (fileInput) fileInput.value = '';
    }

    // ── 9. خارطة التطوير وتصويت المجتمع (نظيفة وتبدأ من 0 قلوب) ──
    getRoadmapIdeas() {
      try {
        return JSON.parse(localStorage.getItem('wzker_roadmap_user_ideas') || '[]');
      } catch (e) {
        return [];
      }
    }

    saveRoadmapIdea(idea) {
      const ideas = this.getRoadmapIdeas();
      ideas.unshift(idea);
      localStorage.setItem('wzker_roadmap_user_ideas', JSON.stringify(ideas));
    }

    getVotedIds() {
      try {
        return JSON.parse(localStorage.getItem('wzker_roadmap_votes') || '[]');
      } catch (e) {
        return [];
      }
    }

    toggleVoteOnRoadmap(id) {
      const ideas = this.getRoadmapIdeas();
      const item = ideas.find(i => i.id === id);
      if (!item) return;

      let votedIds = this.getVotedIds();
      const isAlreadyVoted = votedIds.includes(id);

      if (isAlreadyVoted) {
        item.votes = Math.max(0, (item.votes || 0) - 1);
        votedIds = votedIds.filter(v => v !== id);
        if (window.showToast) window.showToast('شيلت إعجابك بالفكرة');
      } else {
        item.votes = (item.votes || 0) + 1;
        votedIds.push(id);
        if (window.showToast) window.showToast('حطيت قلبك للفكرة دي ❤️');
      }

      localStorage.setItem('wzker_roadmap_votes', JSON.stringify(votedIds));
      localStorage.setItem('wzker_roadmap_user_ideas', JSON.stringify(ideas));
      this.renderRoadmap();
    }

    renderRoadmap(filter = 'all') {
      const container = document.getElementById('roadmapCardsList');
      if (!container) return;

      const ideas = this.getRoadmapIdeas();
      const votedIds = this.getVotedIds();

      if (ideas.length === 0) {
        container.innerHTML = `
          <div class="tickets-empty-state">
            <div class="tickets-empty-icon">
              <img src="images/icons/Voting-Notes.png" style="width: 44px; height: 44px;" alt="Voting">
            </div>
            <h4 class="tickets-empty-title">خارطة التطوير فاضية ومستنية أفكاركم!</h4>
            <p class="tickets-empty-desc">أي فكرة أو اقتراح هتكتبه هينزل هنا فوراً بـ 0 قلوب عشان كل مستخدمي وذكر يدوسوا قلب ويصوتوا للأفكار اللي نفسهم يشوفوها.</p>
            <button type="button" class="feedback-submit-btn" style="max-width: 220px; margin-top: 10px;" onclick="window.wzkerFeedback.switchTab('ideasTab')">
              <span>اكتب فكرتك دلوقتي</span>
            </button>
          </div>
        `;
        return;
      }

      const filtered = filter === 'all' ? ideas : ideas.filter(i => i.status === filter);

      let html = '';
      filtered.forEach((item) => {
        const isVoted = votedIds.includes(item.id);
        const heartIconSrc = isVoted ? 'images/icons/fav-active.png' : 'images/icons/fav.png';

        let statusBadge = '<span class="roadmap-status-badge in-progress"><img src="images/icons/development.png" style="width: 16px; height: 16px;" alt="Dev"> شغالين عليها</span>';
        if (item.status === 'in-plan') {
          statusBadge = '<span class="roadmap-status-badge planned"><img src="images/icons/In-plan.png" style="width: 16px; height: 16px;" alt="Plan"> في الخطة</span>';
        } else if (item.status === 'completed') {
          statusBadge = '<span class="roadmap-status-badge completed"><img src="images/icons/Completed.png" style="width: 16px; height: 16px;" alt="Done"> خلصت ونزلت</span>';
        }

        html += `
          <div class="roadmap-feature-card">
            <div class="roadmap-feature-main">
              <div class="roadmap-feature-header">
                ${statusBadge}
                <span class="roadmap-mini-tag">${item.categoryName || 'اقتراح جديد'}</span>
              </div>
              <h4 class="roadmap-feature-title">${item.title}</h4>
              <p class="roadmap-feature-desc">${item.desc}</p>
            </div>
            <button type="button" class="roadmap-vote-btn ${isVoted ? 'voted' : ''}" onclick="window.wzkerFeedback.toggleVoteOnRoadmap('${item.id}')" title="${isVoted ? 'إلغاء الإعجاب' : 'إعجاب بالفكرة'}">
              <img src="${heartIconSrc}" class="roadmap-heart-img" style="width: 26px; height: 26px; object-fit: contain;" alt="Heart">
              <span class="roadmap-vote-count">${item.votes || 0}</span>
            </button>
          </div>
        `;
      });

      container.innerHTML = html;
    }

    // ── 10. إرسال الفكرة وحفظها ──
    submit() {
      const msg = document.getElementById('feedbackMessage')?.value.trim();
      const isVoice = this.inputMode === 'voice' && this.audioUrl;

      if (!msg && !isVoice) {
        if (window.showToast) window.showToast('اكتب فكرتك أو سجل صوتك الأول قبل ما تدوس إرسال');
        const messageEl = document.getElementById('feedbackMessage');
        if (messageEl && this.inputMode === 'text') messageEl.focus();
        return;
      }

      const name = document.getElementById('feedbackUserName')?.value.trim() || 'صاحب الفكرة';
      const email = document.getElementById('feedbackUserEmail')?.value.trim() || 'لم يحدد';
      const subject = document.getElementById('feedbackSubject')?.value.trim() || this.categoryLabels[this.selectedCategory];

      const ticketObj = {
        code: this.ticketCode,
        date: new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' }),
        name,
        email,
        subject,
        category: this.selectedCategory,
        categoryName: this.categoryLabels[this.selectedCategory],
        rating: this.currentRating,
        aspects: { ...this.aspectRatings },
        message: msg || '(ملاحظة مسجلة بالصوت)',
        hasVoice: !!this.audioUrl,
        hasImage: !!this.attachedImage,
        status: 'وصلت وبنراجعها',
        statusCode: 'received'
      };

      // 1. Save in user tickets
      try {
        const tickets = JSON.parse(localStorage.getItem('wzker_user_tickets') || '[]');
        tickets.unshift(ticketObj);
        localStorage.setItem('wzker_user_tickets', JSON.stringify(tickets.slice(0, 20)));
      } catch (e) {
        console.warn('Storage save ticket error:', e);
      }

      // 2. Add to Roadmap as a new community idea with 0 votes
      const newRoadmapItem = {
        id: 'user_idea_' + Date.now(),
        title: subject,
        desc: msg || 'فكرة مقترحة من أحد المستخدمين للتطوير',
        status: 'in-plan',
        categoryName: this.categoryLabels[this.selectedCategory],
        votes: 0,
        author: name
      };
      this.saveRoadmapIdea(newRoadmapItem);

      this.lastSubmittedIdea = {
        code: this.ticketCode,
        subject: subject,
        msg: msg,
        name: name,
        rating: this.currentRating
      };

      this.updateTicketBadgeCount();
      this.showSuccessModal();
    }

    updateTicketBadgeCount() {
      try {
        const tickets = JSON.parse(localStorage.getItem('wzker_user_tickets') || '[]');
        const badge = document.getElementById('myTicketsCountBadge');
        if (badge) {
          badge.textContent = tickets.length;
          badge.style.display = tickets.length > 0 ? 'inline-block' : 'none';
        }
      } catch (e) {
        console.warn(e);
      }
    }

    renderTicketsHistory() {
      const container = document.getElementById('ticketsHistoryList');
      if (!container) return;

      let tickets = [];
      try {
        tickets = JSON.parse(localStorage.getItem('wzker_user_tickets') || '[]');
      } catch (e) {
        tickets = [];
      }

      if (tickets.length === 0) {
        container.innerHTML = `
          <div class="tickets-empty-state">
            <div class="tickets-empty-icon">
              <img src="images/icons/Ticket-idea.png" style="width: 44px; height: 44px;" alt="Ticket">
            </div>
            <h4 class="tickets-empty-title">لسه مفيش أفكار مسجلة باسمك</h4>
            <p class="tickets-empty-desc">أول ما تبعت أي فكرة أو مقترح، هيتحفظ كارت الفكرة بتاعك برقم متابعة هنا عشان تشوف حالته وصلت لإيه.</p>
            <button type="button" class="feedback-submit-btn" style="max-width: 220px; margin-top: 10px;" onclick="window.wzkerFeedback.switchTab('ideasTab')">
              <span>ابعت فكرتك الأولى دلوقتي</span>
            </button>
          </div>
        `;
        return;
      }

      let html = '';
      tickets.forEach((t) => {
        html += `
          <div class="ticket-history-card">
            <div class="ticket-history-header">
              <span class="ticket-history-code">${t.code}</span>
              <span class="ticket-badge-pill"><img src="images/icons/checked.png" style="width: 14px; height: 14px; vertical-align: middle; margin-left: 4px;" alt="Check">${t.status}</span>
            </div>
            <h4 class="ticket-history-title">${t.subject}</h4>
            <p class="ticket-history-msg">${t.message}</p>
            <div class="ticket-history-footer">
              <span class="ticket-history-date">${t.date}</span>
              <span style="font-size: 0.8rem; color: var(--accent-gold); font-weight: 700;">تقييمك: ${t.rating} ★</span>
            </div>
          </div>
        `;
      });

      container.innerHTML = html;
    }

    // ── 11. نافذة التأكيد والاحتفال ──
    showSuccessModal() {
      const modal = document.getElementById('feedbackSuccessOverlay');
      const codeDisplay = document.getElementById('successTicketCodeDisplay');
      if (codeDisplay) codeDisplay.textContent = this.ticketCode;

      if (modal) {
        modal.classList.add('active');
        this.fireConfetti();
      }
    }

    closeSuccessModal(reset = true) {
      const modal = document.getElementById('feedbackSuccessOverlay');
      if (modal) modal.classList.remove('active');

      if (reset) {
        const msg = document.getElementById('feedbackMessage');
        const subj = document.getElementById('feedbackSubject');
        if (msg) msg.value = '';
        if (subj) subj.value = '';
        const counter = document.getElementById('feedbackCharCount');
        if (counter) counter.textContent = '0 / 600';
        this.deleteVoiceRecord();
        this.removeAttachedImage();
        this.ticketCode = this.generateTicketCode();
        this.setRating(5);
        this.syncTicketPreview();
      }
    }

    goToRoadmapFromModal() {
      this.closeSuccessModal(true);
      this.switchTab('roadmapTab');
      const page = document.getElementById('feedbackPage');
      if (page) {
        page.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    sendLastSubmittedToWhatsApp() {
      const idea = this.lastSubmittedIdea || {
        code: this.ticketCode,
        subject: document.getElementById('feedbackSubject')?.value.trim() || 'فكرة لتطبيق وذكر',
        msg: document.getElementById('feedbackMessage')?.value.trim() || '',
        name: document.getElementById('feedbackUserName')?.value.trim() || 'صديق وذكر',
        rating: this.currentRating
      };

      const text = encodeURIComponent(
        `السلام عليكم يا باشمهندس عمر، بعت فكرة جديدة لتطبيق وذكر [${idea.code}]:\n` +
        `• الموضوع: ${idea.subject}\n` +
        `• الاسم: ${idea.name || 'صديق وذكر'}\n` +
        `• التفاصيل: ${idea.msg || 'لا توجد تفاصيل إضافية'}\n` +
        `• التقييم: ${idea.rating}/5 نجوم ⭐`
      );
      window.open(`https://wa.me/${this.whatsappNumber}?text=${text}`, '_blank');
    }

    fireConfetti() {
      const canvas = document.getElementById('feedbackConfettiCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const particles = [];
      const colors = ['#D29571', '#9C3D32', '#F5A623', '#28a745', '#FFE6A7', '#ffffff'];

      for (let i = 0; i < 110; i++) {
        particles.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          r: Math.random() * 6 + 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          tilt: Math.floor(Math.random() * 10) - 10,
          tiltAngleIncremental: (Math.random() * 0.07) + 0.05,
          tiltAngle: 0,
          vx: (Math.random() - 0.5) * 16,
          vy: (Math.random() - 0.7) * 18 - 2,
          gravity: 0.35,
          opacity: 1
        });
      }

      let animationFrame;
      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let activeCount = 0;
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.vx *= 0.98;
          p.tiltAngle += p.tiltAngleIncremental;
          p.tilt = Math.sin(p.tiltAngle) * 15;
          p.opacity -= 0.007;

          if (p.opacity > 0) {
            activeCount++;
            ctx.beginPath();
            ctx.lineWidth = p.r;
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = Math.max(p.opacity, 0);
            ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
            ctx.stroke();
          }
        });

        if (activeCount > 0) {
          animationFrame = requestAnimationFrame(render);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          cancelAnimationFrame(animationFrame);
        }
      };

      render();
    }

    // ── 12. التواصل المباشر (واتساب - تيليجرام - جيميل) ──
    copyTicketText() {
      const code = this.lastSubmittedIdea?.code || this.ticketCode;
      const name = this.lastSubmittedIdea?.name || document.getElementById('feedbackUserName')?.value.trim() || 'صديق وذكر';
      const subj = this.lastSubmittedIdea?.subject || document.getElementById('feedbackSubject')?.value.trim() || this.categoryLabels[this.selectedCategory];
      const msg = this.lastSubmittedIdea?.msg || document.getElementById('feedbackMessage')?.value.trim() || '';
      const rating = this.lastSubmittedIdea?.rating || this.currentRating;

      const text = `فكرة لتطبيق وذكر [${code}]:\n` +
        `الاسم: ${name}\n` +
        `الموضوع: ${subj}\n` +
        `التقييم: ${rating}/5 نجوم\n` +
        `التفاصيل: ${msg}`;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          if (window.showToast) window.showToast(`تم نسخ رقم الفكرة (${code}) وتفاصيلها بنجاح`);
        });
      }
    }

    sendViaWhatsApp() {
      const subj = document.getElementById('feedbackSubject')?.value.trim() || this.categoryLabels[this.selectedCategory];
      const msg = document.getElementById('feedbackMessage')?.value.trim() || '';
      const text = encodeURIComponent(`السلام عليكم، حابب أشارك فكرة لتطبيق وذكر [${this.ticketCode}]:\n• الموضوع: ${subj}\n• التفاصيل: ${msg}\n• التقييم: ${this.currentRating}/5 نجوم`);
      window.open(`https://wa.me/${this.whatsappNumber}?text=${text}`, '_blank');
    }

    sendViaTelegram() {
      const subj = document.getElementById('feedbackSubject')?.value.trim() || this.categoryLabels[this.selectedCategory];
      const msg = document.getElementById('feedbackMessage')?.value.trim() || '';
      const text = encodeURIComponent(`السلام عليكم، مقترح لتطبيق وذكر [${this.ticketCode}]:\n${subj}\n${msg}`);
      window.open(`https://t.me/+${this.telegramContact}?text=${text}`, '_blank');
    }

    sendViaEmail() {
      const subj = document.getElementById('feedbackSubject')?.value.trim() || this.categoryLabels[this.selectedCategory];
      const msg = document.getElementById('feedbackMessage')?.value.trim() || '';
      const mailto = `mailto:${this.developerEmail}?subject=${encodeURIComponent('اقتراح وذكر ' + this.ticketCode + ': ' + subj)}&body=${encodeURIComponent(msg)}`;
      window.open(mailto, '_blank');
    }
  }

  window.wzkerFeedback = new WzkerFeedbackHub();
})();
