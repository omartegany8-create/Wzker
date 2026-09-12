/**
 * ══════════════════════════════════════════════════════════════════
 * WZKER ROYAL TASBEEH DATA & MODELS (js/tasbeeh-data.js) - PRO EDITION
 * Perfectly synced with global app theme variables.
 * Bank of authentic adhkars, sequential chain playlists, session intentions (Niyyah),
 * digital tasbeeh shapes (Ring, Circle, Card) & habit tracking constants.
 * STRICT ZERO EMOJIS ADHERENCE
 * ══════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // 1. INDIVIDUAL DHIKR BANK WITH RICH ICONS
  const WZKER_TASBEEH_DHIKR_BANK = [
    {
      id: 'subhan_allah',
      category: 'tasbeeh',
      title: 'سُبْحَانَ اللَّهِ',
      shortName: 'التسبيح',
      fadl: 'تنزيهٌ للرب عن كل نقص، وكل تسبيحة صدقة وغرسٌ لشجرة طيبة في الجنة.',
      source: 'صحيح مسلم',
      defaultTarget: 33,
      targets: [33, 100, 300, 1000, 0],
      icon: 'images/icons/sabha1.png'
    },
    {
      id: 'alhamdulillah',
      category: 'tahmeed',
      title: 'الْحَمْدُ لِلَّهِ',
      shortName: 'التحميد',
      fadl: 'أفضل الدعاء الحمد لله، وهي تملأ الميزان بالخير والبركات والأجور.',
      source: 'سنن الترمذي',
      defaultTarget: 33,
      targets: [33, 100, 300, 1000, 0],
      icon: 'images/icons/prayer1.png'
    },
    {
      id: 'allahu_akbar',
      category: 'takbeer',
      title: 'اللَّهُ أَكْبَرُ',
      shortName: 'التكبير',
      fadl: 'إقرارٌ بعظمة الله فوق كل عظيم، وهي من الكلمات الأحب إلى الله تعالى.',
      source: 'صحيح البخاري',
      defaultTarget: 34,
      targets: [34, 100, 300, 1000, 0],
      icon: 'images/icons/mosque1.png'
    },
    {
      id: 'la_ilaha_illallah',
      category: 'تهليل',
      title: 'لَا إِلَهَ إِلَّا اللَّهُ',
      shortName: 'التهليل',
      fadl: 'أفضل الذكر لا إله إلا الله، كلمة التوحيد وحبل النجاة المتين.',
      source: 'سنن الترمذي',
      defaultTarget: 100,
      targets: [33, 100, 300, 1000, 0],
      icon: 'images/icons/quran1.png'
    },
    {
      id: 'astaghfirullah',
      category: 'istighfar',
      title: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
      shortName: 'الاستغفار',
      fadl: 'من لزم الاستغفار جعل الله له من كل هم فرجاً ومن كل ضيق مخرجاً ورزقه من حيث لا يحتسب.',
      source: 'مسند أحمد وأبو داود',
      defaultTarget: 100,
      targets: [33, 70, 100, 500, 1000, 0],
      icon: 'images/icons/prayers3.png'
    },
    {
      id: 'subhan_allah_bihamdihi',
      category: 'tasbeeh',
      title: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ • سُبْحَانَ اللَّهِ الْعَظِيمِ',
      shortName: 'الكلمتان الخفيفتان',
      fadl: 'كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن.',
      source: 'متفق عليه',
      defaultTarget: 100,
      targets: [33, 100, 300, 1000, 0],
      icon: 'images/icons/leaf-2.png'
    },
    {
      id: 'salawat',
      category: 'salawat',
      title: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
      shortName: 'الصلاة على النبي',
      fadl: 'من صلى علي صلاة صلى الله عليه بها عشراً، ومحا عنه عشر خطيئات ورفع له عشر درجات.',
      source: 'سنن النسائي',
      defaultTarget: 100,
      targets: [10, 33, 100, 300, 1000, 0],
      icon: 'images/icons/prayer4.png'
    },
    {
      id: 'hawqala',
      category: 'hawqala',
      title: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ',
      shortName: 'الحوقلة',
      fadl: 'كنزٌ من كنوز الجنة، وباب عظيم لدفع الهموم ورفع البلايا.',
      source: 'صحيح البخاري',
      defaultTarget: 100,
      targets: [33, 100, 300, 1000, 0],
      icon: 'images/icons/leaf-4.png'
    },
    {
      id: 'la_ilaha_illa_anta',
      category: 'istighfar',
      title: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
      shortName: 'دعوة ذي النون',
      fadl: 'ما دعا بها مكروب ولا مهموم في شيء قط إلا استجاب الله له وفرج كربه.',
      source: 'جامع الترمذي',
      defaultTarget: 100,
      targets: [33, 40, 100, 300, 1000, 0],
      icon: 'images/icons/prayers1.png'
    },
    {
      id: 'hasbi_allah',
      category: 'tawakkul',
      title: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
      shortName: 'التوكل والكفاية',
      fadl: 'قالها إبراهيم عليه السلام حين ألقي في النار، وقالها محمد ﷺ وأصحابه لما قالوا: إن الناس قد جمعوا لكم.',
      source: 'صحيح البخاري',
      defaultTarget: 100,
      targets: [33, 100, 300, 1000, 0],
      icon: 'images/icons/certificate1.png'
    }
  ];

  // 2. SEQUENTIAL CHAIN ROUTINES (قوائم الأوراد المتسلسلة)
  const WZKER_TASBEEH_CHAINS = [
    {
      id: 'chain_salah',
      title: 'ورد دبر الصلوات المكتوبة',
      subtitle: 'السنة النبوية عقب كل فريضة',
      description: 'التسبيح والتحميد والتكبير ثم ختم المائة بالتوحيد الخالص لمغفرة الخطايا.',
      badgeText: 'أعظم الأوراد',
      icon: 'images/icons/prayer-mat1.png',
      steps: [
        { dhikrId: 'subhan_allah', text: 'سُبْحَانَ اللَّهِ', target: 33 },
        { dhikrId: 'alhamdulillah', text: 'الْحَمْدُ لِلَّهِ', target: 33 },
        { dhikrId: 'allahu_akbar', text: 'اللَّهُ أَكْبَرُ', target: 34 },
        {
          dhikrId: 'khatm_salah',
          text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
          target: 1
        }
      ]
    },
    {
      id: 'chain_istighfar',
      title: 'سلسلة الاستغفار والتوبة الكبرى',
      subtitle: 'تطهير القلوب وتفريج الكروب',
      description: 'ملازمة الاستغفار النبوي المأثور ودعاء ذي النون لكشف الغموم.',
      badgeText: 'تفريج الهموم',
      icon: 'images/icons/prayers3.png',
      steps: [
        { dhikrId: 'astaghfirullah', text: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', target: 100 },
        { dhikrId: 'la_ilaha_illa_anta', text: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ', target: 100 },
        {
          dhikrId: 'sayyid_istighfar',
          text: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
          target: 3
        }
      ]
    },
    {
      id: 'chain_morning_evening',
      title: 'ورد التسبيح والبركة اليومي',
      subtitle: 'حبيبتان إلى الرحمن ومائة صلاة',
      description: 'مائة تسبيحة عظمى، ومائة صلاة على خير الأنام لنيل الشفاعة ومغفرة الذنوب.',
      badgeText: 'الورد اليومي',
      icon: 'images/icons/sunrise.png',
      steps: [
        { dhikrId: 'subhan_allah_bihamdihi', text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ • سُبْحَانَ اللَّهِ الْعَظِيمِ', target: 100 },
        { dhikrId: 'salawat', text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', target: 100 },
        { dhikrId: 'la_ilaha_illallah', text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', target: 100 }
      ]
    },
    {
      id: 'chain_relief',
      title: 'ورد الحوقلة وتيسير الأمور',
      subtitle: 'كنوز الجنة وتفويض الأمر لله',
      description: 'الاعتراف بالعجز أمام قدرة العلي الكبير، وحسن التوكل واليقين التام.',
      badgeText: 'كنوز العرش',
      icon: 'images/icons/leaf-5.png',
      steps: [
        { dhikrId: 'hawqala', text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ', target: 100 },
        { dhikrId: 'hasbi_allah', text: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', target: 100 },
        { dhikrId: 'subhan_allah_bihamdihi', text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ وَرِضَا نَفْسِهِ وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ', target: 33 }
      ]
    }
  ];

  // 3. NIYYAH / SESSION INTENTIONS (نظام الذكر)
  const WZKER_TASBEEH_INTENTIONS = [
    { id: 'general', label: 'ذكر عام وتقرب لله', icon: 'images/icons/sabha1.png' },
    { id: 'post_prayer', label: 'دبر الصلاة المكتوبة', icon: 'images/icons/prayer-mat1.png' },
    { id: 'morning_evening', label: 'ورد الصباح والمساء', icon: 'images/icons/sunrise.png' },
    { id: 'repentance', label: 'توبة ومغفرة للذنوب', icon: 'images/icons/prayers3.png' },
    { id: 'relief', label: 'تفريج كرب وقضاء حاجة', icon: 'images/icons/prayers1.png' },
    { id: 'parents', label: 'بر بالوالدين وإهداء الأجر', icon: 'images/icons/fav.png' }
  ];

  // 4. MODERN DIGITAL TASBEEH SHAPES (أشكال السبحة الرقمية العصرية)
  const WZKER_TASBEEH_SHAPES = [
    {
      id: 'shape_circle',
      name: 'العداد الدائري الملكي',
      subtext: 'حلقة تقدم دائرية ناعمة مع وميض ذهبي متوهج',
      icon: 'images/icons/sabha1.png'
    },
    {
      id: 'shape_ring',
      name: 'خاتم التسبيح الذكي',
      subtext: 'تصميم خاتم إلكتروني عصري بزر لمس رحب',
      icon: 'images/icons/sabha2.png'
    },
    {
      id: 'shape_card',
      name: 'كارت السكينة والتركيز',
      subtext: 'واجهة بسيطة رحبة خالية من أي شتات',
      icon: 'images/icons/Focus1.png'
    }
  ];

  // 5. STILLNESS REFLECTION CARDS (استراحة السكون)
  const WZKER_STILLNESS_QUOTES = [
    {
      verse: '« أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ »',
      reflection: 'توقف للحظات، تنفس بعمق واستشعر قرب الله منك في هذه الخلوة المباركة.'
    },
    {
      verse: '« فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ »',
      reflection: 'يكفيك شرفاً ورفعة أن رب السماوات والأرض يذكرك الآن في ملأ خير من ملئك.'
    },
    {
      verse: '« وَالذَّاكِرِينَ اللَّهَ كَثِيرًا وَالذَّاكِرَاتِ أَعَدَّ اللَّهُ لَهُمْ مَغْفِرَةً وَأَجْرًا عَظِيمًا »',
      reflection: 'كل تسبيحة واستغفار تمحو بها خطيئة وتبني لك قصراً وغراساً في جنات النعيم.'
    },
    {
      verse: '« ادْعُوا رَبَّكُمْ تَضَرُّعًا وَخُفْيَةً »',
      reflection: 'السكينة في الخلوات أرجى للقبول، سل الله ما في قلبك وسينجلي كل هم.'
    }
  ];

  // Expose to window/global namespace
  const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this);
  root.WZKER_TASBEEH_DATA = {
    dhikrs: WZKER_TASBEEH_DHIKR_BANK,
    chains: WZKER_TASBEEH_CHAINS,
    intentions: WZKER_TASBEEH_INTENTIONS,
    shapes: WZKER_TASBEEH_SHAPES,
    stillnessQuotes: WZKER_STILLNESS_QUOTES
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = root.WZKER_TASBEEH_DATA;
  }
})();
