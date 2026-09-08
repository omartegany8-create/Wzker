const fs = require('fs');
let s = fs.readFileSync('TASKS.md', 'utf8');

// Strip emojis from TASKS.md
s = s.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

// Update progress to 65%
s = s.replace('[███████████░░░░░░░░░] 55%', '[█████████████░░░░░░░] 65%');

// Update Table row 2 (الأذكار اليومية)
s = s.replace(
  "| **2** |  **الأذكار اليومية** | `prayer1.png` | 🟡 محطة النقاش والتخطيط | أذكار الصباح والمساء واليوم والليلة مع العداد التفاعلي |",
  "| **2** | **الأذكار اليومية** | `prayer1.png` | 🟢 مكتمل 100% | 49 ذكراً موثقاً بـ 10 تصنيفات، عداد دائري تفاعلي، هابتك، وضع التركيز، ومشاركة الإهداء |"
);

// Update Phase 2 checkboxes
s = s.replace('- [ ] **2.1 تبويب حصن المسلم وفهرس الأذكار المبوب**:', '- [x] **2.1 تبويب حصن المسلم وفهرس الأذكار المبوب**:');
s = s.replace('- [ ] **2.2 عداد النقر التفاعلي والاهتزاز اللمسي (Full-Screen Smart Tap & Haptics)**:', '- [x] **2.2 عداد النقر التفاعلي والاهتزاز اللمسي (Full-Screen Smart Tap & Haptics)**:');
s = s.replace('- [ ] **2.3 مؤشر الإنجاز اليومي الذكي (Daily Completion Ring)**:', '- [x] **2.3 مؤشر الإنجاز اليومي الذكي (Daily Completion Ring)**:');
s = s.replace('- [ ] **2.4 وضع الاستماع الصوتي للأذكار**:', '- [x] **2.4 وضع الاستماع الصوتي للأذكار**:');

fs.writeFileSync('TASKS.md', s, 'utf8');
console.log('Successfully updated TASKS.md with zero emojis!');
