# ⚡ ReyadConvert — Smart Image Converter & Optimizer

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.5%20PRO-emerald?style=for-the-badge&logo=rocket" alt="Version" />
  <img src="https://img.shields.io/badge/Author-Mohamed%20Reyad-blue?style=for-the-badge&logo=github" alt="Author" />
  <img src="https://img.shields.io/badge/License-MIT-purple?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/Privacy-100%25%20Client--Side-green?style=for-the-badge&logo=lock" alt="Client Side Privacy" />
  <img src="https://img.shields.io/badge/Target%20Size-%E2%89%A4%20130%20KB-success?style=for-the-badge" alt="Target Size" />
</p>

<p align="center">
  <strong>أداة ويب احترافية فائقة السرعة لتحويل وضغط الصور محلياً مع خوارزمية ذكية لضبط الحجم عند 130 كيلوبايت أو أقل بأقصى نقاء بصري.</strong><br>
  <em>Next-Generation Client-Side Image Converter & Optimizer with Adaptive ≤ 130KB Compression Engine.</em>
</p>

---

## 🌟 نظرة عامة | Overview

**ReyadConvert** هو استوديو ويب متكامل طُوّر بواسطة **Mohamed Reyad** لتحويل وضغط الصور بكفاءة خارقة دون الحاجة لأي خوادم خارجية (معالجة داخلية 100% داخل المتصفح). 

صُمم التطبيق خصيصاً لمطوري المواقع، مصممي واجهات المستخدم، وصنّاع المحتوى الذين يحتاجون إلى تسريع تحميل مواقعهم وضمان الامتثال التام لمعايير **Google Core Web Vitals**، مع الحفاظ على خصوصية بياناتهم بالكامل.

---

## ✨ المميزات الرئيسية | Key Features

- 🎯 **خوارزمية الضغط الذكي التكيفية (Adaptive ≤ 130 KB Formula)**:
  - تضمن بقاء أي صورة عالية الدقة أو كبيرة الحجم عند **130 كيلوبايت أو أقل** بشكل قطعي دون أي تشويش بصري.
  - تعتمد على **البحث الثنائي للجودة (Binary Search)** وتقليص الأبعاد التناسبي الذكي عند الضرورة فقط.
- 🔄 **دعم التحويل لصيغ متعددة (Multi-Format Support)**:
  - **WebP**: الصيغة القياسية للويب الحديث لتوفير أكثر من 85% من الحجم.
  - **AVIF**: أحدث صيغة ضغط عصرية مبنية على معيار AV1.
  - **JPEG / JPG**: أعلى درجات التوافق مع كافة الأجهزة والأنظمة.
  - **PNG**: ضغط بدون فقدان جودة مع دعم الشفافية الكاملة (Alpha Transparency).
- 👁️ **منزلق المقارنة التفاعلي قبل وبعد (Interactive Split Slider)**:
  - فحص فوري ومباشر لنقاء الصورة المضغوطة مقارنة بالأصل بدقة 1:1.
- 📦 **تحميل دفعات بملف مضغوط (Batch ZIP Download)**:
  - معالجة عشرات الصور دفعة واحدة وتحميلها بنقرة واحدة في ملف `ReyadConvert_Batch.zip` عبر مكتبة `JSZip`.
- 🎨 **تصميم فخم وعصري (Obsidian & Modern Glass Aesthetics)**:
  - واجهة احترافية سلسة تدعم **الوضع الفاتح (Light Mode كافتراضي)** والوضع المظلم (Dark Mode).
  - خطوط طباعية عربية أنيقة (**Alexandria**) وأرقام هندسية عصرية (**Plus Jakarta Sans**).
- 🔒 **أمان وخصوصية 100% (Zero-Server Architecture)**:
  - تعمل الأداة بالكامل في ذاكرة المتصفح عبر HTML5 Canvas API و Blob API؛ لا تُرفع أي صورة لأي خادم.
- 📋 **سحب وإفلات ولصق مباشر (Drag & Drop & Clipboard Paste)**:
  - اسحب ملفاتك مباشرة أو الصقها فوراً عبر الحافظة (<kbd>Ctrl</kbd> + <kbd>V</kbd>).

---

## 📐 خوارزمية ومعادلة الضغط الذكي | The 130KB Algorithm

تم ابتكار معادلة تكيفية متعددة المراحل داخل محرك التحسين:

$$\text{Target Size} \le 130 \times 1024 = 133,120 \text{ Bytes}$$

### مراحل الخوارزمية:
1. **الفحص الأولي عالي النقاء**:
   اختبار الصورة عند جودة عالية ($Q = 0.85$ أو $0.92$)؛ إذا كان الحجم أقل من 130KB تُعتمد فوراً دون أي تخفيض غير ضروري.
2. **البحث الثنائي لمعامل الجودة (Binary Quality Search)**:
   إذا كان الحجم يتجاوز 130KB، يبحث المحرك بدقة في المجال $[0.25, 0.85]$ خلال 6 دورات حسابية سريعة لتحديد أعلى جودة ممكنة تحقق الشرط.
3. **التخميد المساحي التناسبي (Dimensional Area Damping)**:
   إذا كانت تفاصيل الصورة عالية جداً لدرجة تتطلب جودة أقل من $0.35$، تطبق المعادلة تصغيراً متزناً للأبعاد بدلاً من حرق الجودة:
   $$\text{Scale Ratio} = \min\left(0.92, \sqrt{\frac{\text{TargetBytes}}{\text{CurrentSize}}} \times 0.96\right)$$
   ثم تثبت الجودة في نطاق النقاء البصري العالي ($0.75 - 0.82$). هذا يحافظ على حدة الحواف ووضوح النص والألوان.

---

## 🚀 طريقة التشغيل محلياً | Quick Start

لا يتطلب المشروع أي بيئة تشغيل معقدة، فقط افتح الملف في أي متصفح حديث:

```bash
# 1. استنساخ المستودع | Clone repository
git clone https://github.com/mmagdym1/ReyadConvert.git

# 2. الانتقال إلى مجلد المشروع | Navigate to folder
cd ReyadConvert

# 3. تشغيل خادم محلي اختياري أو فتح index.html مباشرة
# عبر Node.js:
npx serve .
# أو ببساطة انقر نقراً مزدوجاً على index.html في جهازك!
```

---

## 🛠️ التقنيات المستخدمة | Technologies

- **HTML5 Semantic Markup** (مهيأ بالكامل لمعايير محركات البحث SEO و Schema.org).
- **Vanilla CSS3** (نظام تصميم حديث، متغيرات CSS، متوافق مع كافة أحجام الشاشات).
- **Pure JavaScript ES6+** (بدون أطر عمل ثقيلة، أداء فائق السرعة).
- **HTML5 Canvas & Blob API** (المعالجة والترميز الداخلي للصور).
- **JSZip** (تجميع وتنزيل الملفات المضغوطة).
- **Google Fonts** (`Alexandria` & `Plus Jakarta Sans`).

---

## 🔍 الكلمات الدلالية ومحركات البحث | SEO Keywords

`ReyadConvert`, `Mohamed Reyad`, `WebP Converter`, `Compress WebP to 130KB`, `AVIF Converter`, `Client Side Image Optimizer`, `Batch Image Resizer`, `Google Core Web Vitals`, `محول الصور إلى WebP`, `ضغط الصور الذكي`, `تقليل حجم الصور أونلاين`, `أداة تحويل الصور محمد رياض`, `تحويل PNG إلى WebP`, `ضغط الصور بدون فقدان الجودة`.

---

## 👨‍💻 المطور | Author

**Mohamed Reyad (محمد رياض)**  
- GitHub: [@mmagdym1](https://github.com/mmagdym1)
- Project Repository: [https://github.com/mmagdym1/ReyadConvert](https://github.com/mmagdym1/ReyadConvert)

---

## 📄 الترخيص | License

هذا المشروع مرخص تحت رخصة [MIT License](LICENSE).
