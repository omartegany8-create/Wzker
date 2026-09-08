const fs = require('fs');
let s = fs.readFileSync('index.html', 'utf8');

s = s.replace('تجربة الرنّة 🔔', 'تجربة الرنّة')
     .replace('🌙 بعد 15 دقيقة', 'بعد 15 دقيقة')
     .replace('🌙 بعد 30 دقيقة', 'بعد 30 دقيقة')
     .replace('🌙 بعد 45 دقيقة', 'بعد 45 دقيقة')
     .replace('🌙 بعد 60 دقيقة (ساعة)', 'بعد 60 دقيقة (ساعة)')
     .replace('❌ إيقاف المؤقت', 'إيقاف المؤقت')
     .replace('إنشاء وحفظ 📋', 'إنشاء وحفظ')
     .replace('حفظ التعديل ✏️', 'حفظ التعديل')
     .replace('نعم، احذف 🗑️', 'نعم، احذف')
     .replace('🌸 الصلاة على النبي والذكر', 'الصلاة على النبي والذكر')
     .replace('💾 التحميلات أوفلاين', 'التحميلات أوفلاين')
     .replace('انقر على أي آية للقفز إليها 📖', 'انقر على أي آية للقفز إليها');

fs.writeFileSync('index.html', s, 'utf8');
console.log('Sanitized index.html emojis successfully.');
