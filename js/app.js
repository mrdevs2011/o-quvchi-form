  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
  import {
    getFirestore, collection, addDoc, serverTimestamp, onSnapshot, query
  } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyAVUpLzABT8o_-kDspxCVaAO3CMPUZII04",
    authDomain: "malumnotalr.firebaseapp.com",
    projectId: "malumnotalr",
    storageBucket: "malumnotalr.firebasestorage.app",
    messagingSenderId: "573521817927",
    appId: "1:573521817927:web:96bd83130dd1afe1c89c62"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const screens = ["welcome", "step-child", "step-mfy", "step-street", "step-house", "step-parent", "step-document", "success"];
  let current = 0;
  window.takenNames = new Set();

  const nextBtn = document.getElementById("nextBtn");
  const backBtn = document.getElementById("backBtn");
  const submitBtn = document.getElementById("submitBtn");
  const startBtn = document.getElementById("startBtn");
  const againBtn = document.getElementById("againBtn");
  const infoBtn = document.getElementById("infoBtn");
  const infoModal = document.getElementById("infoModal");
  const infoModalClose = document.getElementById("infoModalClose");
  const infoModalOk = document.getElementById("infoModalOk");

  function openInfoModal() { infoModal.classList.add("show"); }
  function closeInfoModal() { infoModal.classList.remove("show"); }
  infoBtn.addEventListener("click", openInfoModal);
  infoModalClose.addEventListener("click", closeInfoModal);
  infoModalOk.addEventListener("click", closeInfoModal);
  infoModal.addEventListener("click", (e) => { if (e.target === infoModal) closeInfoModal(); });
  const stepError = document.getElementById("stepError");
  const progressFill = document.getElementById("progressFill");
  const progressWrap = document.getElementById("progressWrap");
  const nav = document.getElementById("nav");

  function toLatin(str) {
    const map = {
      "А":"A","а":"a","Б":"B","б":"b","В":"V","в":"v","Г":"G","г":"g",
      "Д":"D","д":"d","Е":"E","е":"e","Ё":"Yo","ё":"yo","Ж":"J","ж":"j",
      "З":"Z","з":"z","И":"I","и":"i","Й":"Y","й":"y","К":"K","к":"k",
      "Л":"L","л":"l","М":"M","м":"m","Н":"N","н":"n","О":"O","о":"o",
      "П":"P","п":"p","Р":"R","р":"r","С":"S","с":"s","Т":"T","т":"t",
      "У":"U","у":"u","Ф":"F","ф":"f","Х":"X","х":"x","Ц":"Ts","ц":"ts",
      "Ч":"Ch","ч":"ch","Ш":"Sh","ш":"sh","Ъ":"'","ъ":"'","Ь":"","ь":"",
      "Э":"E","э":"e","Ю":"Yu","ю":"yu","Я":"Ya","я":"ya",
      "Ў":"O‘","ў":"o‘","Қ":"Q","қ":"q","Ғ":"G‘","ғ":"g‘","Ҳ":"H","ҳ":"h"
    };
    return (str || "").split("").map(ch => map[ch] ?? ch).join("");
  }

  function firstName(full) {
    const parts = (full || "").trim().split(/\s+/);
    return parts[1] || parts[0] || "";
  }

  const prettyNames = {
    "Абдурахимова Зулайхо Камолиддин Қизи": "Zulayho",
    "Абдухалилова Шукрона Акрамжон Қизи": "Shukrona",
    "Алиханова Муқаддасхон Хасанбой Қизи": "Muqaddasxon",
    "Ахмадалиев Муҳаммадризо Давронбек Ўғли": "Muhammadrizo",
    "Ахмаджонов Абдуллоҳ Уткирбек Ўғли": "Abdulloh",
    "Ахмадзулунов Абдуназар Адхамжон Ўғли": "Abdunazar",
    "Ашурбоев Саиджалол Азизбек Ўғли": "Saidjalol",
    "Бегижонова Робияхон Солохидин Қизи": "Robiyaxon",
    "Боходиржонова Сожидахон Бунёдбек Қизи": "Sojidaxon",
    "Зиёхитдинова Ойша Оятилло Қизи": "Oysha",
    "Ибрагимова Шохсанам Иззатбек Қизи": "Shohsanam",
    "Қобилжонова Моҳларойим Мухсинжон Қизи": "Mohlaroyim",
    "Қодиржонов Муҳаммад Али Санжарбек Ўғли": "Muhammadali",
    "Қосимов Муҳаммадрасул Хабибулло Ўғли": "Muhammadrasul",
    "Мадаминхўжаева Мунисахон Азизбек Қизи": "Munisaxon",
    "Маъруфжонов Набижон Шухратбек Ўғли": "Nabijon",
    "Мухторжонова Ойдиноя Абдушукур Қизи": "Oydinoy",
    "Низамов Муҳаммадазиз Мухиддин Ўғли": "Muhammadaziz",
    "Одилжонов Убайдулло Хасанбой Ўғли": "Ubaydullo",
    "Рафиқжонов Абдулборий Шерзодбек Ўғли": "Abdulboriy",
    "Рафиқжонов Абдурахмон Бекзодбек Ўғли": "Abdurahmon",
    "Собиров Муҳаммад Содиқ Шокиржон Ўғли": "Muhammadsodiq",
    "Тўлқинбоев Абдуллоҳ Акмалжон Ўғли": "Abdulloh",
    "Тўлқинбоева Ойшахон Сирожидин Қизи": "Oyshaxon",
    "Убайдуллаев Муҳаммадюсуф Илхомжон Ўғли": "Muhammadyusuf",
    "Ўктамова Шириной Хакимбек Қизи": "Shirinoy",
    "Яқубжонов Мўминжон Бобиржон Ўғли": "Mo‘minjon"
  };

  function firstNameLatin(full) {
    if (prettyNames[full]) return prettyNames[full];
    return toLatin(firstName(full));
  }

  function markTakenOptions() {
    const selected = document.getElementById("fullName").value;
    document.querySelectorAll("#fullNameDropdown .option").forEach(opt => {
      const taken = takenNames.has(opt.dataset.value);
      opt.hidden = false; // ro'yxatdan hech qachon yo'qolmaydi
      opt.classList.toggle("taken", taken); // gray + "Tayyor" belgisi shu klass orqali
      if (taken && selected === opt.dataset.value) {
        opt.classList.remove("selected");
        document.getElementById("fullName").value = "";
        document.getElementById("fullNameLabel").textContent = "Ismini tanlang";
        document.getElementById("fullNameBox").classList.add("placeholder");
      }
    });
  }

  function renderMarquee(names) {
    const wrap = document.getElementById("marqueeWrap");
    const track = document.getElementById("marqueeTrack");

    // 0 ta — lenta umuman ko'rsatilmaydi
    if (!names.length) {
      wrap.hidden = true;
      track.innerHTML = "";
      track.classList.remove("is-static");
      return;
    }

    wrap.hidden = false;

    // 1 ta — scroll qilishning hojati yo'q (aylanadigan narsa yo'q,
    // 2 nusxa qo'yib CSS animatsiya bersak ham vizual harakat sezilmaydi
    // yoki "sakrab" ko'rinadi — shuning uchun buni maxsus, statik holat
    // sifatida ko'rsatamiz: bitta pill, animatsiyasiz, o'rtada turadi)
    if (names.length === 1) {
      track.innerHTML = `<span class="pill">${names[0]}</span>`;
      track.classList.add("is-static");
      track.style.animationDuration = "";
      return;
    }

    // 2+ ta — cheksiz loop-scroll
    track.classList.remove("is-static");

    // ANIMATSIYA -50% BILAN ISHLAYDI — bu shuni anglatadiki, DOM'da
    // aylanadigan "BLOK" ANIQ 2 MARTA takrorlangan bo'lishi SHART
    // (blok1 + blok2, bir xil). 3, 4, 5 marta takrorlasak -50% notoʻgʻri
    // masofa boʻlib qoladi va loop sakraydi. Shuning uchun avval ismlar
    // ro'yxatini ICHKARIDA kerakli minimal enga yetguncha ko'paytamiz —
    // shu kengaytirilgan ro'yxat = "BLOK", va faqat BLOKni 2 marta qo'yamiz.
    let namesForBlock = names.slice();
    const wrapWidth = wrap.clientWidth || 320;
    const minBlockWidth = Math.max(wrapWidth, 320);

    // Taxminiy o'lchash uchun bitta aylanishda joylab ko'ramiz
    track.classList.remove("is-static");
    track.innerHTML = namesForBlock.map(n => `<span class="pill">${n}</span>`).join("");
    let blockWidth = track.scrollWidth || 1;

    // Ism-ro'yxatini blok yetarlicha keng bo'lguncha o'ziga qo'shib boramiz
    let guard = 0; // cheksiz loopdan himoya
    while (blockWidth < minBlockWidth && guard < 20) {
      namesForBlock = namesForBlock.concat(names);
      track.innerHTML = namesForBlock.map(n => `<span class="pill">${n}</span>`).join("");
      blockWidth = track.scrollWidth || 1;
      guard++;
    }

    const blockHTML = namesForBlock.map(n => `<span class="pill">${n}</span>`).join("");
    track.innerHTML = blockHTML + blockHTML; // aniq 2x — -50% shu bilan mos

    // Tezlik: blok qancha uzun bo'lsa, shuncha sekin (bir xil "oqim tezligi"
    // hissi bo'lishi uchun) — lekin min/max chegara bilan.
    const seconds = Math.min(180, Math.max(54, namesForBlock.length * 7.2)); // 3x sekin (edi: 60/18/2.4)
    track.style.animationDuration = seconds + "s";
  }

  // 1) "lenta" dan taken-name tekshiruvi — "oquvchilar" o'rniga shu ishlatiladi,
  // chunki "oquvchilar" login talab qiladi va anonim foydalanuvchi uni o'qiy
  // olmaydi (permission-denied). "lenta" esa hammaga ochiq va har bir forma
  // yuborilganda fullName shu yerga ham yoziladi — shuning uchun band ismlarni
  // aniqlash uchun ishonchli manba.
  try {
    const q = query(collection(db, "lenta"));
    onSnapshot(q, (snap) => {
      window.takenNames = new Set(
        snap.docs.map(d => (d.data().fullName || "").trim()).filter(Boolean)
      );
      markTakenOptions();
    }, () => {
      // Kutilmagan xato — taken-check ixtiyoriy funksiya, forma davom etadi.
    });
  } catch (e) {
    // e'tiborsiz qoldiramiz — taken-check ixtiyoriy funksiya
  }

  // 2) "lenta" dan marquee — bu ATAYLAB OCHIQ collection (faqat ism saqlanadi,
  // rules'da "allow read: if true"), shuning uchun login qilmagan foydalanuvchi
  // uchun ham ishlashi SHART. Welcome page bu queryga bog'liq bo'lib qoladi.
  try {
    const lentaQ = query(collection(db, "lenta"));
    onSnapshot(lentaQ, (snap) => {
      const unique = [];
      const seen = new Set();
      snap.docs.forEach(d => {
        const latin = firstNameLatin(d.data().fullName || "");
        if (latin && !seen.has(latin.toLowerCase())) {
          seen.add(latin.toLowerCase());
          unique.push(latin);
        }
      });
      renderMarquee(unique);
      revealApp();
    }, () => {
      document.getElementById("marqueeWrap").hidden = true;
      revealApp();
    });
  } catch (e) {
    document.getElementById("marqueeWrap").hidden = true;
    revealApp();
  }

  function revealApp() {
    if (window.__appReady) return;
    window.__appReady = true;
    const boot = document.getElementById("boot");
    if (boot) boot.remove();
    document.getElementById("appCard").hidden = false;
    showScreen(0);
  }

  function showScreen(index) {
    current = index;
    screens.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle("active", i === index);
    });

    const isWelcome = index === 0;
    const isSuccess = index === screens.length - 1;
    const isLastQuestion = index === screens.length - 2;

    progressWrap.style.display = (isWelcome || isSuccess) ? "none" : "block";
    nav.style.display = (isWelcome || isSuccess) ? "none" : "flex";

    if (!isWelcome && !isSuccess) {
      progressFill.style.width = ((index / 6) * 100) + "%";
    }

    const n = firstNameLatin(document.getElementById("fullName").value);
    if (index === 2) {
      document.getElementById("mfyAsk").textContent = n
        ? `${n} qaysi MFYda yashaydi?`
        : "Qaysi MFYdansiz?";
    }
    if (index === 3) {
      const mfy = document.getElementById("mfy").value;
      document.getElementById("streetAsk").textContent = mfy
        ? `${mfy}da qaysi ko‘chada yashaysiz?`
        : "Qaysi ko‘chada yashaysiz?";
    }
    if (index === 4) {
      document.getElementById("houseAsk").textContent = "Uy raqami nechchi?";
    }
    if (index === 5) {
      document.getElementById("parentAsk").textContent = n
        ? `${n}ning otasi va onasining ismini yozamiz`
        : "Otasi va onasining ismini yozamiz";
    }
    if (index === 6) {
      document.getElementById("docAsk").textContent = n
        ? `${n}ning metrikasi bormi?`
        : "Farzandingizning metrikasi bormi?";
    }

    backBtn.style.visibility = index > 1 ? "visible" : "hidden";
    nextBtn.style.display = isLastQuestion ? "none" : "block";
    submitBtn.style.display = isLastQuestion ? "block" : "none";
    stepError.textContent = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validateCurrent() {
    if (current === 1) {
      const name = document.getElementById("fullName").value.trim();
      if (!name) {
        stepError.textContent = "Iltimos, avval farzandingizni tanlab qo‘ying.";
        return false;
      }
      if (takenNames.has(name)) {
        stepError.textContent = "Bu farzand uchun allaqachon yozilgan.";
        return false;
      }
    }
    if (current === 2) {
      if (!document.getElementById("mfy").value.trim()) {
        stepError.textContent = "Komakay yoki Saddadan birini bosing.";
        return false;
      }
    }
    if (current === 3) {
      if (!document.getElementById("street").value.trim()) {
        stepError.textContent = "Ko‘cha nomini yozing.";
        return false;
      }
    }
    if (current === 4) {
      if (!document.getElementById("house").value.trim()) {
        stepError.textContent = "Uy raqamini yozing.";
        return false;
      }
    }
    if (current === 5) {
      const father = document.getElementById("fatherName").value.trim();
      const mother = document.getElementById("motherName").value.trim();
      if (!father || !mother) {
        stepError.textContent = "Otasi va onasining ismini alohida yozing.";
        return false;
      }
    }
    if (current === 6) {
      const number = document.getElementById("metrikaNumber").value.trim();
      if (!/^\d{7}$/.test(number)) {
        stepError.textContent = "Metrika raqami 7 ta raqam bo‘lishi kerak.";
        return false;
      }
    }
    return true;
  }

  startBtn.addEventListener("click", () => showScreen(1));
  nextBtn.addEventListener("click", () => {
    if (!validateCurrent()) return;
    showScreen(current + 1);
  });
  backBtn.addEventListener("click", () => {
    if (current > 1) showScreen(current - 1);
  });
  againBtn.addEventListener("click", () => {
    document.getElementById("fullName").value = "";
    document.getElementById("fullNameLabel").textContent = "Ismini tanlang";
    document.getElementById("fullNameBox").classList.add("placeholder");
    document.getElementById("fullNameDropdown").querySelectorAll(".option").forEach(o => o.classList.remove("selected"));
    document.getElementById("mfy").value = "";
    document.getElementById("street").value = "";
    document.getElementById("house").value = "";
    document.querySelectorAll(".place-card").forEach(c => c.classList.remove("on"));
    document.getElementById("fatherName").value = "";
    document.getElementById("motherName").value = "";
    document.getElementById("metrikaNumber").value = "";
    document.getElementById("metrikaNumber").classList.remove("filled");
    document.querySelectorAll("#otpBoxes .otp-box").forEach(b => {
      b.value = "";
      b.classList.remove("filled");
    });
    showScreen(0);
  });

  submitBtn.addEventListener("click", async () => {
    if (!validateCurrent()) return;
    submitBtn.disabled = true;
    nextBtn.disabled = true;
    stepError.textContent = "";
    submitBtn.textContent = "Bir daqiqa...";

    try {
      const fullName = document.getElementById("fullName").value.trim();
      const mfyName = document.getElementById("mfy").value.trim();
      const street = document.getElementById("street").value.trim();
      const house = document.getElementById("house").value.trim();
      const address = `Andijon viloyati, Oltinko‘l tumani, ${mfyName} MFY, ${street} ko‘chasi, ${house}-uy`;
      const fatherName = document.getElementById("fatherName").value.trim();
      const motherName = document.getElementById("motherName").value.trim();
      const parentInfo = `Otasi: ${fatherName} / Onasi: ${motherName}`;
      const number = document.getElementById("metrikaNumber").value.trim();
      const documentInfo = `AA ${number}`;

      await addDoc(collection(db, "oquvchilar"), {
        fullName,
        address,
        parentInfo,
        fatherName,
        motherName,
        mfy: mfyName,
        street,
        house,
        documentInfo,
        createdAt: serverTimestamp()
      });

      // Welcome page'dagi ochiq lenta uchun — faqat ism, shaxsiy ma'lumot yo'q.
      // Bu alohida yozish, chunki "lenta" collection'i hammaga o'qiladigan
      // qilib ochilgan (rules'da), "oquvchilar" esa yopiq qoladi.
      try {
        await addDoc(collection(db, "lenta"), {
          fullName,
          createdAt: serverTimestamp()
        });
      } catch (lentaErr) {
        // Lenta yozuvi muvaffaqiyatsiz bo'lsa ham, asosiy forma
        // yuborilgani muhim — bu yerda foydalanuvchini to'xtatmaymiz.
      }

      const n = firstNameLatin(fullName);
      document.getElementById("successText").textContent = n
        ? `Rahmat. ${n} haqida aytganlaringiz yetarli. Sizni bezovta qilganimiz uchun uzr.`
        : "Rahmat. Aytganlaringiz yetarli. Sizni bezovta qilganimiz uchun uzr.";
      showScreen(screens.length - 1);
    } catch (err) {
      console.error(err);
      stepError.textContent = "Kechirasiz, hozir ulanib bo‘lmadi. Birozdan so‘ng yana urinib ko‘ring.";
    } finally {
      submitBtn.disabled = false;
      nextBtn.disabled = false;
      submitBtn.textContent = "Tayyor";
    }
  });

  setTimeout(revealApp, 2500);

  const numberEl = document.getElementById("metrikaNumber");
  const houseEl = document.getElementById("house");
  const streetEl = document.getElementById("street");
  const fatherEl = document.getElementById("fatherName");
  const motherEl = document.getElementById("motherName");

  function onlyDigits(el, max) {
    el.addEventListener("input", () => {
      el.value = el.value.replace(/\D/g, "").slice(0, max);
      if (el === numberEl) {
        el.classList.toggle("filled", el.value.length === 7);
      }
    });
    el.addEventListener("keypress", (e) => {
      if (e.key && !/\d/.test(e.key)) e.preventDefault();
    });
    el.addEventListener("paste", (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "").slice(0, max);
      el.value = text;
      if (el === numberEl) el.classList.toggle("filled", el.value.length === 7);
    });
  }
  function onlyLetters(el) {
    el.addEventListener("input", () => {
      el.value = el.value.replace(/[0-9]/g, "");
    });
    el.addEventListener("keypress", (e) => {
      if (e.key && /[0-9]/.test(e.key)) e.preventDefault();
    });
  }
  onlyDigits(houseEl, 3);
  onlyLetters(streetEl);
  onlyLetters(fatherEl);
  onlyLetters(motherEl);

  const otpBoxes = Array.from(document.querySelectorAll("#otpBoxes .otp-box"));
  function syncOtpToHidden() {
    const value = otpBoxes.map(b => b.value).join("");
    numberEl.value = value;
    numberEl.classList.toggle("filled", value.length === 7);
  }
  otpBoxes.forEach((box, i) => {
    box.addEventListener("input", () => {
      box.value = box.value.replace(/\D/g, "").slice(0, 1);
      box.classList.toggle("filled", box.value.length === 1);
      if (box.value && i < otpBoxes.length - 1) otpBoxes[i + 1].focus();
      syncOtpToHidden();
    });
    box.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !box.value && i > 0) {
        otpBoxes[i - 1].focus();
        otpBoxes[i - 1].value = "";
        otpBoxes[i - 1].classList.remove("filled");
        syncOtpToHidden();
      }
      if (e.key === "ArrowLeft" && i > 0) otpBoxes[i - 1].focus();
      if (e.key === "ArrowRight" && i < otpBoxes.length - 1) otpBoxes[i + 1].focus();
    });
    box.addEventListener("paste", (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "").slice(0, otpBoxes.length);
      text.split("").forEach((ch, idx) => {
        if (otpBoxes[idx]) {
          otpBoxes[idx].value = ch;
          otpBoxes[idx].classList.add("filled");
        }
      });
      const next = otpBoxes[Math.min(text.length, otpBoxes.length - 1)];
      if (next) next.focus();
      syncOtpToHidden();
    });
  });

  document.querySelectorAll(".place-card").forEach(card => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".place-card").forEach(c => c.classList.remove("on"));
      card.classList.add("on");
      document.getElementById("mfy").value = card.dataset.mfy;
      stepError.textContent = "";
      showScreen(3);
    });
  });
