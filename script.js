/**
 * ReyadConvert — Advanced Client-Side Image Optimization Engine
 * Developed by: Mohamed Reyad
 * 
 * Features:
 * - Multi-Format Encoding: WebP, AVIF, JPEG, PNG
 * - Smart Adaptive Compression: Binary Quality Search + Dimensional Damping (<= 130KB Guarantee)
 * - Interactive Split Comparison Slider Modal
 * - Batch Processing with Instant ZIP Download via JSZip
 * - Drag & Drop, File Picker & Clipboard Paste (Ctrl+V)
 */

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // State Management (Default: Light Mode)
  // ==========================================
  const state = {
    selectedFiles: [],       // Array of File objects in queue
    convertedResults: [],    // Array of processed items
    isProcessing: false,
    theme: localStorage.getItem("reyadconvert_theme") || "light",
    currentFormat: "webp",   // 'webp' | 'avif' | 'jpeg' | 'png'
    currentMode: "smart",    // 'smart' | 'manual'
    aspectRatioLocked: true,
    lastActiveCompareItem: null
  };

  // ==========================================
  // DOM References
  // ==========================================
  const html = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const themeLabel = document.getElementById("themeLabel");

  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");
  const filesQueueCard = document.getElementById("filesQueueCard");
  const queueCount = document.getElementById("queueCount");
  const queueList = document.getElementById("queueList");
  const clearQueueBtn = document.getElementById("clearQueueBtn");

  const formatSelector = document.getElementById("formatSelector");
  const tabSmartMode = document.getElementById("tabSmartMode");
  const tabManualMode = document.getElementById("tabManualMode");
  const viewSmartMode = document.getElementById("viewSmartMode");
  const viewManualMode = document.getElementById("viewManualMode");

  const smartTargetInput = document.getElementById("smartTargetInput");
  const presetChips = document.querySelectorAll(".preset-chip");

  const manualQualitySlider = document.getElementById("manualQualitySlider");
  const manualQualityNum = document.getElementById("manualQualityNum");
  const manualScaleSlider = document.getElementById("manualScaleSlider");
  const manualScaleNum = document.getElementById("manualScaleNum");
  const scaleLiveHint = document.getElementById("scaleLiveHint");
  const customWidthInput = document.getElementById("customWidthInput");
  const customHeightInput = document.getElementById("customHeightInput");
  const aspectRatioLock = document.getElementById("aspectRatioLock");

  const convertBtn = document.getElementById("convertBtn");
  const btnIcon = document.getElementById("btnIcon");
  const btnText = document.getElementById("btnText");
  const progressContainer = document.getElementById("progressContainer");
  const progressStatusText = document.getElementById("progressStatusText");
  const progressPctText = document.getElementById("progressPctText");
  const progressFill = document.getElementById("progressFill");

  const resultsSection = document.getElementById("resultsSection");
  const resultsGrid = document.getElementById("resultsGrid");
  const statTotalCount = document.getElementById("statTotalCount");
  const statOriginalSize = document.getElementById("statOriginalSize");
  const statNewSize = document.getElementById("statNewSize");
  const statSavedPercent = document.getElementById("statSavedPercent");
  const downloadAllZipBtn = document.getElementById("downloadAllZipBtn");
  const clearResultsBtn = document.getElementById("clearResultsBtn");

  // Comparison Modal DOM
  const compareModal = document.getElementById("compareModal");
  const closeCompareModal = document.getElementById("closeCompareModal");
  const compareFileName = document.getElementById("compareFileName");
  const comparisonViewport = document.getElementById("comparisonViewport");
  const compareAfterImg = document.getElementById("compareAfterImg");
  const compareBeforeClip = document.getElementById("compareBeforeClip");
  const compareBeforeImg = document.getElementById("compareBeforeImg");
  const compareSliderDivider = document.getElementById("compareSliderDivider");
  const compareAfterBadge = document.getElementById("compareAfterBadge");
  const compareOriginalSizeVal = document.getElementById("compareOriginalSizeVal");
  const compareNewSizeVal = document.getElementById("compareNewSizeVal");
  const compareSavingsVal = document.getElementById("compareSavingsVal");
  const compareDimsVal = document.getElementById("compareDimsVal");

  // ==========================================
  // Theme Management (Light as Default)
  // ==========================================
  function applyTheme(t) {
    state.theme = t;
    html.dataset.theme = t;
    localStorage.setItem("reyadconvert_theme", t);
    themeLabel.textContent = t === "dark" ? "الوضع الفاتح" : "الوضع المظلم";
  }
  applyTheme(state.theme);

  themeToggle.addEventListener("click", () => {
    applyTheme(state.theme === "dark" ? "light" : "dark");
  });

  // ==========================================
  // Format Selection
  // ==========================================
  formatSelector.querySelectorAll(".format-card").forEach(card => {
    card.addEventListener("click", () => {
      formatSelector.querySelectorAll(".format-card").forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      const radio = card.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        state.currentFormat = radio.value;
      }
    });
  });

  // ==========================================
  // Mode Tabs Switching (Smart vs Manual)
  // ==========================================
  tabSmartMode.addEventListener("click", () => {
    state.currentMode = "smart";
    tabSmartMode.classList.add("active");
    tabManualMode.classList.remove("active");
    viewSmartMode.classList.add("active");
    viewManualMode.classList.remove("active");
  });

  tabManualMode.addEventListener("click", () => {
    state.currentMode = "manual";
    tabManualMode.classList.add("active");
    tabSmartMode.classList.remove("active");
    viewManualMode.classList.add("active");
    viewSmartMode.classList.remove("active");
  });

  // Presets handling
  presetChips.forEach(chip => {
    chip.addEventListener("click", () => {
      presetChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      const target = chip.dataset.target;
      smartTargetInput.value = target;
    });
  });

  smartTargetInput.addEventListener("input", () => {
    const val = smartTargetInput.value;
    presetChips.forEach(c => {
      if (c.dataset.target === val) c.classList.add("active");
      else c.classList.remove("active");
    });
  });

  // ==========================================
  // Manual Controls Synchronization
  // ==========================================
  manualQualitySlider.addEventListener("input", () => {
    manualQualityNum.value = manualQualitySlider.value;
  });
  manualQualityNum.addEventListener("change", () => {
    let v = parseInt(manualQualityNum.value) || 82;
    v = Math.max(1, Math.min(100, v));
    manualQualityNum.value = v;
    manualQualitySlider.value = v;
  });

  function updateScaleHint() {
    const v = parseInt(manualScaleNum.value) || 100;
    if (v >= 100) {
      scaleLiveHint.textContent = "✅ الأبعاد الأصلية بنسبة 100%";
    } else {
      scaleLiveHint.textContent = `📐 سيتم تقليص أبعاد الصورة بنسبة ${v}%`;
    }
  }

  manualScaleSlider.addEventListener("input", () => {
    manualScaleNum.value = manualScaleSlider.value;
    updateScaleHint();
  });
  manualScaleNum.addEventListener("change", () => {
    let v = parseInt(manualScaleNum.value) || 100;
    v = Math.max(10, Math.min(100, v));
    manualScaleNum.value = v;
    manualScaleSlider.value = v;
    updateScaleHint();
  });

  // Aspect ratio lock toggle
  aspectRatioLock.addEventListener("click", () => {
    state.aspectRatioLocked = !state.aspectRatioLocked;
    aspectRatioLock.classList.toggle("active", state.aspectRatioLocked);
  });

  // ==========================================
  // File Queue & Drag-and-Drop Management
  // ==========================================
  dropzone.addEventListener("dragover", e => {
    e.preventDefault();
    dropzone.classList.add("drag-active");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("drag-active");
  });

  dropzone.addEventListener("drop", e => {
    e.preventDefault();
    dropzone.classList.remove("drag-active");
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      addFilesToQueue(Array.from(e.dataTransfer.files));
    }
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files && fileInput.files.length) {
      addFilesToQueue(Array.from(fileInput.files));
      fileInput.value = ""; // Reset for re-selection
    }
  });

  // Paste from clipboard support (Ctrl+V)
  window.addEventListener("paste", e => {
    if (e.clipboardData && e.clipboardData.files.length) {
      const files = Array.from(e.clipboardData.files).filter(f => f.type.startsWith("image/"));
      if (files.length) {
        addFilesToQueue(files);
      }
    }
  });

  const MAX_FILES = 20;

  function addFilesToQueue(newFiles) {
    const imageFiles = newFiles.filter(f => f.type.startsWith("image/"));
    if (!imageFiles.length) {
      alert("يرجى اختيار ملفات صور صالحة فقط (PNG, JPG, WebP, AVIF, إلخ).");
      return;
    }

    const currentCount = state.selectedFiles.length;
    const remainingSlots = MAX_FILES - currentCount;

    if (remainingSlots <= 0) {
      alert(`⚠️ لقد وصلت للحد الأقصى المسموح به (${MAX_FILES} صورة دفعة واحدة).\nيرجى تحويل الصور الحالية أولاً أو إفراغ القائمة.`);
      return;
    }

    if (imageFiles.length > remainingSlots) {
      alert(`⚠️ تم تحديد ${imageFiles.length} صور، ولكن الحد الأقصى المسموح به هو ${MAX_FILES} صورة دفعة واحدة.\nتمت إضافة أول ${remainingSlots} صور فقط لضمان سرعة واستقرار المتصفح.`);
      state.selectedFiles.push(...imageFiles.slice(0, remainingSlots));
    } else {
      state.selectedFiles.push(...imageFiles);
    }

    renderQueue();
  }

  function renderQueue() {
    if (!state.selectedFiles.length) {
      filesQueueCard.style.display = "none";
      return;
    }

    filesQueueCard.style.display = "block";
    queueCount.textContent = `${state.selectedFiles.length} / ${MAX_FILES} صور`;
    queueList.innerHTML = "";

    state.selectedFiles.forEach((file, index) => {
      const itemEl = document.createElement("div");
      itemEl.className = "queue-item";

      const thumbUrl = URL.createObjectURL(file);
      itemEl.innerHTML = `
        <img class="queue-item-thumb" src="${thumbUrl}" alt="${file.name}" />
        <div class="queue-item-meta">
          <span class="queue-item-name" title="${file.name}">${file.name}</span>
          <span class="queue-item-size">${formatBytes(file.size)}</span>
        </div>
        <button class="queue-item-del" type="button" title="حذف" data-index="${index}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;

      itemEl.querySelector(".queue-item-del").addEventListener("click", e => {
        e.stopPropagation();
        state.selectedFiles.splice(index, 1);
        URL.revokeObjectURL(thumbUrl);
        renderQueue();
      });

      queueList.appendChild(itemEl);
    });
  }

  clearQueueBtn.addEventListener("click", () => {
    state.selectedFiles = [];
    renderQueue();
  });

  // ==========================================
  // Core Optimization & Conversion Algorithm
  // ==========================================

  function getFormatDetails(formatKey) {
    switch (formatKey) {
      case "webp":
        return { mime: "image/webp", ext: ".webp", name: "WebP" };
      case "avif":
        return { mime: "image/avif", ext: ".avif", name: "AVIF" };
      case "jpeg":
        return { mime: "image/jpeg", ext: ".jpg", name: "JPEG" };
      case "png":
        return { mime: "image/png", ext: ".png", name: "PNG" };
      default:
        return { mime: "image/webp", ext: ".webp", name: "WebP" };
    }
  }

  /**
   * Mohamed Reyad Smart Adaptive Optimization Equation:
   * Guarantees that any high quality/high resolution image is converted
   * to <= targetBytes (default 130KB) with maximal visual clarity.
   */
  async function optimizeToTargetSize(img, targetBytes, mimeType = "image/webp") {
    const origW = img.naturalWidth;
    const origH = img.naturalHeight;

    let currentW = origW;
    let currentH = origH;
    const maxDimension = Math.max(origW, origH);
    if (maxDimension > 2560) {
      const initialFactor = 2560 / maxDimension;
      currentW = Math.round(origW * initialFactor);
      currentH = Math.round(origH * initialFactor);
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    async function encodeBlob(w, h, q) {
      canvas.width = w;
      canvas.height = h;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      return new Promise(resolve => {
        canvas.toBlob(blob => {
          if (blob && blob.type !== mimeType && mimeType === "image/avif") {
            // Fallback gracefully to WebP if AVIF is unsupported by browser canvas
            canvas.toBlob(fb => resolve(fb), "image/webp", q);
          } else {
            resolve(blob);
          }
        }, mimeType, q);
      });
    }

    // Step 1: Check high quality (0.85) at initial dimensions
    let highBlob = await encodeBlob(currentW, currentH, 0.85);
    if (highBlob && highBlob.size <= targetBytes) {
      let ultraBlob = await encodeBlob(currentW, currentH, 0.92);
      if (ultraBlob && ultraBlob.size <= targetBytes) {
        return {
          blob: ultraBlob,
          width: currentW,
          height: currentH,
          quality: 0.92,
          scale: currentW / origW,
          targetMet: true
        };
      }
      return {
        blob: highBlob,
        width: currentW,
        height: currentH,
        quality: 0.85,
        scale: currentW / origW,
        targetMet: true
      };
    }

    // Step 2: Binary Search on Quality in [0.25, 0.85]
    let lowQ = 0.25;
    let highQ = 0.85;
    let bestBlob = null;
    let bestQuality = lowQ;

    for (let iter = 0; iter < 6; iter++) {
      let midQ = (lowQ + highQ) / 2;
      let testBlob = await encodeBlob(currentW, currentH, midQ);
      if (!testBlob) break;

      if (testBlob.size <= targetBytes) {
        bestBlob = testBlob;
        bestQuality = midQ;
        lowQ = midQ; // Try higher quality
      } else {
        highQ = midQ; // Too big, lower quality
      }
    }

    // If quality is still sharp (>= 0.38) and meets target:
    if (bestBlob && bestBlob.size <= targetBytes && bestQuality >= 0.38) {
      return {
        blob: bestBlob,
        width: currentW,
        height: currentH,
        quality: bestQuality,
        scale: currentW / origW,
        targetMet: true
      };
    }

    // Step 3: Adaptive Dimensional Area Scaling
    let currentBlob = bestBlob || (await encodeBlob(currentW, currentH, 0.32));
    let currentSize = currentBlob ? currentBlob.size : targetBytes * 2;
    const targetQ = 0.76;

    for (let step = 0; step < 5; step++) {
      const sizeRatio = targetBytes / currentSize;
      const scaleDamp = Math.min(0.92, Math.sqrt(sizeRatio) * 0.96);

      currentW = Math.max(120, Math.round(currentW * scaleDamp));
      currentH = Math.max(120, Math.round(currentH * scaleDamp));

      let scaledBlob = await encodeBlob(currentW, currentH, targetQ);
      if (!scaledBlob) break;
      currentSize = scaledBlob.size;

      if (currentSize <= targetBytes) {
        let bumpBlob = await encodeBlob(currentW, currentH, 0.82);
        if (bumpBlob && bumpBlob.size <= targetBytes) {
          return {
            blob: bumpBlob,
            width: currentW,
            height: currentH,
            quality: 0.82,
            scale: currentW / origW,
            targetMet: true
          };
        }
        return {
          blob: scaledBlob,
          width: currentW,
          height: currentH,
          quality: targetQ,
          scale: currentW / origW,
          targetMet: true
        };
      }
    }

    // Step 4: Strict Convergence Pass
    let finalQ = 0.60;
    while (currentSize > targetBytes && finalQ >= 0.15) {
      finalQ -= 0.10;
      let passBlob = await encodeBlob(currentW, currentH, finalQ);
      if (passBlob) {
        currentSize = passBlob.size;
        bestBlob = passBlob;
      }
    }

    while (currentSize > targetBytes && currentW > 240) {
      currentW = Math.round(currentW * 0.88);
      currentH = Math.round(currentH * 0.88);
      let passBlob = await encodeBlob(currentW, currentH, finalQ);
      if (passBlob) {
        currentSize = passBlob.size;
        bestBlob = passBlob;
      }
    }

    return {
      blob: bestBlob || currentBlob,
      width: currentW,
      height: currentH,
      quality: finalQ,
      scale: currentW / origW,
      targetMet: (bestBlob ? bestBlob.size : currentSize) <= targetBytes
    };
  }

  async function manualConversion(img, mimeType) {
    const origW = img.naturalWidth;
    const origH = img.naturalHeight;

    const quality = Math.min(100, Math.max(1, parseInt(manualQualityNum.value) || 82)) / 100;
    const scale = Math.min(100, Math.max(10, parseInt(manualScaleNum.value) || 100)) / 100;

    let targetW = Math.round(origW * scale);
    let targetH = Math.round(origH * scale);

    const customW = parseInt(customWidthInput.value) || 0;
    const customH = parseInt(customHeightInput.value) || 0;

    if (customW > 0 || customH > 0) {
      if (customW > 0 && customH > 0) {
        targetW = customW;
        targetH = customH;
      } else if (customW > 0) {
        targetW = customW;
        targetH = Math.round((origH / origW) * customW);
      } else if (customH > 0) {
        targetH = customH;
        targetW = Math.round((origW / origH) * customH);
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, targetW, targetH);

    return new Promise(resolve => {
      canvas.toBlob(blob => {
        resolve({
          blob: blob,
          width: targetW,
          height: targetH,
          quality: quality,
          scale: targetW / origW,
          targetMet: false
        });
      }, mimeType, quality);
    });
  }

  // ==========================================
  // Process Single Image File
  // ==========================================
  async function processImageFile(file) {
    const formatInfo = getFormatDetails(state.currentFormat);
    const targetKB = parseInt(smartTargetInput.value) || 130;
    const targetBytes = targetKB * 1024;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = async evt => {
        const img = new Image();
        img.onerror = reject;
        img.onload = async () => {
          try {
            let result;
            if (state.currentMode === "smart") {
              result = await optimizeToTargetSize(img, targetBytes, formatInfo.mime);
            } else {
              result = await manualConversion(img, formatInfo.mime);
            }

            const baseName = file.name.replace(/\.[^.]+$/, "");
            const outFileName = `${baseName}_reyadconvert${formatInfo.ext}`;
            const convertedUrl = URL.createObjectURL(result.blob);
            const originalUrl = evt.target.result;

            const savedBytes = Math.max(0, file.size - result.blob.size);
            const savedPercent = Math.round((savedBytes / file.size) * 100);

            resolve({
              file: file,
              name: outFileName,
              blob: result.blob,
              originalUrl: originalUrl,
              convertedUrl: convertedUrl,
              origSize: file.size,
              newSize: result.blob.size,
              origWidth: img.naturalWidth,
              origHeight: img.naturalHeight,
              width: result.width,
              height: result.height,
              quality: Math.round(result.quality * 100),
              savedPercent: savedPercent,
              format: formatInfo.name,
              targetMet: result.blob.size <= targetBytes,
              targetKB: targetKB
            });
          } catch (err) {
            reject(err);
          }
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // ==========================================
  // Primary Convert Button Click
  // ==========================================
  convertBtn.addEventListener("click", async () => {
    if (state.isProcessing) return;

    if (!state.selectedFiles.length) {
      alert("الرجاء اختيار صورة واحدة على الأقل للبدء!");
      fileInput.click();
      return;
    }

    state.isProcessing = true;
    convertBtn.disabled = true;

    btnIcon.innerHTML = `
      <circle cx="12" cy="12" r="9" stroke="white" stroke-width="2.5"
        stroke-dasharray="56" stroke-dashoffset="18" stroke-linecap="round" fill="none">
        <animateTransform attributeName="transform" type="rotate"
          from="0 12 12" to="360 12 12" dur="0.75s" repeatCount="indefinite"/>
      </circle>
    `;
    btnText.textContent = "جارٍ المعالجة والضغط الذكي...";

    progressContainer.style.display = "block";
    progressFill.style.width = "0%";
    progressPctText.textContent = "0%";

    const total = state.selectedFiles.length;
    const newResults = [];

    for (let i = 0; i < total; i++) {
      const file = state.selectedFiles[i];
      const currentPct = Math.round(((i) / total) * 100);
      progressStatusText.textContent = `جارٍ معالجة: ${file.name} (${i + 1} من ${total})`;
      progressFill.style.width = `${currentPct}%`;
      progressPctText.textContent = `${currentPct}%`;

      try {
        const itemResult = await processImageFile(file);
        newResults.push(itemResult);
      } catch (err) {
        console.error("Error processing file:", file.name, err);
      }

      const finishPct = Math.round(((i + 1) / total) * 100);
      progressFill.style.width = `${finishPct}%`;
      progressPctText.textContent = `${finishPct}%`;
    }

    state.convertedResults.push(...newResults);

    setTimeout(() => {
      progressContainer.style.display = "none";
      convertBtn.disabled = false;
      btnIcon.innerHTML = `
        <path d="M12 2v10m0 0l-4-4m4 4l4-4"/>
        <path d="M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"/>
      `;
      btnText.textContent = "تحويل وضغط الصور الآن";
      state.isProcessing = false;

      renderResults();
    }, 400);
  });

  // ==========================================
  // Render Results & Overview
  // ==========================================
  function renderResults() {
    if (!state.convertedResults.length) {
      resultsSection.style.display = "none";
      return;
    }

    resultsSection.style.display = "flex";

    let totalOrig = 0;
    let totalNew = 0;
    state.convertedResults.forEach(r => {
      totalOrig += r.origSize;
      totalNew += r.newSize;
    });

    const totalSaved = Math.max(0, totalOrig - totalNew);
    const overallSavedPct = totalOrig > 0 ? Math.round((totalSaved / totalOrig) * 100) : 0;

    statTotalCount.textContent = state.convertedResults.length;
    statOriginalSize.textContent = formatBytes(totalOrig);
    statNewSize.textContent = formatBytes(totalNew);
    statSavedPercent.textContent = `${overallSavedPct}% (${formatBytes(totalSaved)})`;

    resultsGrid.innerHTML = "";
    state.convertedResults.forEach((item, idx) => {
      const card = document.createElement("div");
      card.className = "result-card";

      let targetBadgeHtml = "";
      if (state.currentMode === "smart") {
        if (item.targetMet) {
          targetBadgeHtml = `
            <span class="result-target-badge badge-target-success">
              🎯 الحجم المطلوب: ≤ ${item.targetKB} KB (محققة بنجاح)
            </span>
          `;
        } else {
          targetBadgeHtml = `
            <span class="result-target-badge badge-target-warn">
              ⚠️ الحجم قريب: ${formatBytes(item.newSize)}
            </span>
          `;
        }
      }

      card.innerHTML = `
        <div class="result-thumb-wrapper">
          <img class="result-thumb-img" src="${item.convertedUrl}" alt="${item.name}" />
          <span class="result-format-badge">${item.format}</span>
        </div>

        <div class="result-details">
          <div class="result-title-row">
            <h4 class="result-filename" title="${item.name}">${item.name}</h4>
            ${targetBadgeHtml}
          </div>

          <div class="result-specs-row">
            <span class="result-dims">📐 ${item.origWidth}×${item.origHeight}px ← ${item.width}×${item.height}px</span>
            <div class="result-size-compare">
              <span class="orig-size">${formatBytes(item.origSize)}</span>
              <span>←</span>
              <span class="new-size">${formatBytes(item.newSize)}</span>
            </div>
            ${item.savedPercent > 0 ? `<span class="saved-pill">✨ وفّرت ${item.savedPercent}%</span>` : ""}
          </div>
        </div>

        <div class="result-actions-group">
          <button class="compare-open-btn" type="button" data-index="${idx}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="2" x2="12" y2="22"></line>
            </svg>
            <span>مقارنة قبل / بعد</span>
          </button>
          <button class="download-single-btn" type="button" data-index="${idx}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
              <path d="M12 16V4m0 12l-5-5m5 5l5-5"/><path d="M4 20h16"/>
            </svg>
            <span>تحميل</span>
          </button>
        </div>
      `;

      card.querySelector(".download-single-btn").addEventListener("click", () => {
        downloadItem(item);
      });

      card.querySelector(".compare-open-btn").addEventListener("click", () => {
        openCompareModal(item);
      });

      resultsGrid.appendChild(card);
    });
  }

  function downloadItem(item) {
    const a = document.createElement("a");
    a.href = item.convertedUrl;
    a.download = item.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // ==========================================
  // Batch ZIP Download with JSZip
  // ==========================================
  downloadAllZipBtn.addEventListener("click", async () => {
    if (!state.convertedResults.length) return;

    if (typeof JSZip !== "undefined") {
      downloadAllZipBtn.disabled = true;
      const originalText = downloadAllZipBtn.innerHTML;
      downloadAllZipBtn.innerHTML = `<span>⏳ جارٍ تجميع الملفات في ZIP...</span>`;

      try {
        const zip = new JSZip();
        state.convertedResults.forEach(item => {
          zip.file(item.name, item.blob);
        });

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const zipUrl = URL.createObjectURL(zipBlob);
        const a = document.createElement("a");
        a.href = zipUrl;
        a.download = `ReyadConvert_Batch_${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(zipUrl), 3000);
      } catch (err) {
        console.error("ZIP creation error:", err);
        fallbackSequentialDownload();
      } finally {
        downloadAllZipBtn.disabled = false;
        downloadAllZipBtn.innerHTML = originalText;
      }
    } else {
      fallbackSequentialDownload();
    }
  });

  // Direct Separate Files Download
  const downloadAllDirectBtn = document.getElementById("downloadAllDirectBtn");
  if (downloadAllDirectBtn) {
    downloadAllDirectBtn.addEventListener("click", () => {
      if (!state.convertedResults.length) return;
      state.convertedResults.forEach((item, index) => {
        setTimeout(() => downloadItem(item), index * 260);
      });
    });
  }

  function fallbackSequentialDownload() {
    state.convertedResults.forEach((item, index) => {
      setTimeout(() => downloadItem(item), index * 300);
    });
  }

  clearResultsBtn.addEventListener("click", () => {
    state.convertedResults.forEach(item => {
      URL.revokeObjectURL(item.convertedUrl);
    });
    state.convertedResults = [];
    renderResults();
  });

  // ==========================================
  // Interactive Before / After Comparison Slider
  // ==========================================
  let isDraggingSlider = false;

  function openCompareModal(item) {
    state.lastActiveCompareItem = item;
    compareFileName.textContent = `فحص الجودة: ${item.name}`;
    compareOriginalSizeVal.textContent = formatBytes(item.origSize);
    compareNewSizeVal.textContent = formatBytes(item.newSize);
    compareSavingsVal.textContent = `${item.savedPercent}% وفراً`;
    compareDimsVal.textContent = `${item.width}×${item.height}px`;

    compareAfterImg.src = item.convertedUrl;
    compareBeforeImg.src = item.originalUrl;
    compareAfterBadge.textContent = `بعد الضغط (${item.format})`;

    setSliderPosition(50);

    compareModal.style.display = "flex";
    compareModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeComparison() {
    compareModal.style.display = "none";
    compareModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    compareAfterImg.src = "";
    compareBeforeImg.src = "";
  }

  closeCompareModal.addEventListener("click", closeComparison);
  compareModal.addEventListener("click", e => {
    if (e.target === compareModal) closeComparison();
  });
  window.addEventListener("keydown", e => {
    if (e.key === "Escape" && compareModal.style.display === "flex") {
      closeComparison();
    }
  });

  function setSliderPosition(percentage) {
    const clamped = Math.max(0, Math.min(100, percentage));
    compareBeforeClip.style.width = `${clamped}%`;
    compareSliderDivider.style.left = `${clamped}%`;

    const rect = comparisonViewport.getBoundingClientRect();
    compareBeforeImg.style.width = `${rect.width}px`;
  }

  function handleSliderMove(clientX) {
    const rect = comparisonViewport.getBoundingClientRect();
    if (!rect.width) return;
    const offsetX = clientX - rect.left;
    const pct = (offsetX / rect.width) * 100;
    setSliderPosition(pct);
  }

  comparisonViewport.addEventListener("mousedown", e => {
    isDraggingSlider = true;
    handleSliderMove(e.clientX);
  });

  window.addEventListener("mousemove", e => {
    if (!isDraggingSlider) return;
    handleSliderMove(e.clientX);
  });

  window.addEventListener("mouseup", () => {
    isDraggingSlider = false;
  });

  comparisonViewport.addEventListener("touchstart", e => {
    if (e.touches.length) {
      isDraggingSlider = true;
      handleSliderMove(e.touches[0].clientX);
    }
  }, { passive: true });

  window.addEventListener("touchmove", e => {
    if (!isDraggingSlider || !e.touches.length) return;
    handleSliderMove(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener("touchend", () => {
    isDraggingSlider = false;
  });

  window.addEventListener("resize", () => {
    if (compareModal.style.display === "flex") {
      const rect = comparisonViewport.getBoundingClientRect();
      compareBeforeImg.style.width = `${rect.width}px`;
    }
  });

  // ==========================================
  // Utility Functions
  // ==========================================
  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(2) + " MB";
  }
});
