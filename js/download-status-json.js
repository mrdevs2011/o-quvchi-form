// api/download-status-json.js
//
// Bu — "serverless function". Oddiy .js fayl emas, balki Vercel buni
// avtomatik ravishda "so'rov kelganda ishga tushadigan kichik server"ga
// aylantirib qo'yadi. Fayl nomi = URL manzili:
//   api/download-status-json.js  -->  https://meabout.vercel.app/api/download-status-json
//
// Mantiq ai-checkin skriptidagi cmd_view() funksiyasi bilan bir xil,
// faqat Python o'rniga JavaScript'da yozilgan:
//   1. Firebase'ga anonim login qilib token olamiz
//   2. Firestore'dan checkins collection'ini o'qib olamiz
//   3. Natijani JSON qilib qaytaramiz

import crypto from "crypto";

const FIREBASE_PROJECT_ID = "mrabout";
const FIREBASE_API_KEY = "AIzaSyAvvkcbKlbrplbh29m2MmVfiypvlGAEglg";
const AUTH_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;
const BASE_DOCS_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

async function getIdToken() {
  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ returnSecureToken: true }),
  });
  if (!res.ok) throw new Error(`auth xato: ${res.status}`);
  const data = await res.json();
  return data.idToken;
}

function sha256Hex(str) {
  return crypto.createHash("sha256").update(str, "utf8").digest("hex");
}

export default async function handler(req, res) {
  try {
    const idToken = await getIdToken();

    // saytdagi bilan bir xil parol tekshiruvi
    const configRes = await fetch(
      `${BASE_DOCS_URL}/config/access?key=${FIREBASE_API_KEY}`,
      { headers: { Authorization: `Bearer ${idToken}` } }
    );
    if (configRes.ok) {
      const configData = await configRes.json();
      const correctHash = configData?.fields?.hash?.stringValue;
      if (correctHash) {
        const pass = req.query.pass;
        if (!pass || sha256Hex(pass) !== correctHash) {
          res.status(401).json({ xato: "parol noto'g'ri yoki yo'q. ?pass=... qo'sh" });
          return;
        }
      }
    }

    // MUHIM: bu yerda `orderBy` va `pageSize` parametrlarini Firestore
    // "list documents" REST endpoint'iga BERMAYMIZ. Sabab: bu endpoint
    // orderBy'ni ba'zan eski/qisman natija bilan qaytaradi (eng yangi
    // yozilgan hujjatlar tushib qolishi mumkin). Shuning uchun HAMMA
    // hujjatni oddiy holda olib, sort/limit'ni o'zimiz JS'da qilamiz —
    // bu ishonchli va bug'siz.
    let allDocs = [];
    let pageToken = undefined;
    do {
      const url = new URL(`${BASE_DOCS_URL}/checkins`);
      url.searchParams.set("key", FIREBASE_API_KEY);
      url.searchParams.set("pageSize", "300");
      if (pageToken) url.searchParams.set("pageToken", pageToken);

      const docsRes = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!docsRes.ok) {
        res.status(502).json({ xato: `Firestore xato: ${docsRes.status}` });
        return;
      }
      const data = await docsRes.json();
      allDocs = allDocs.concat(data.documents || []);
      pageToken = data.nextPageToken;
    } while (pageToken);

    const checkins = allDocs
      .map((d) => {
        const f = d.fields || {};
        // timestamp Firestore REST'da `{ timestampValue: "2026-09-18T12:47:58.123Z" }`
        // ko'rinishida keladi — sort uchun shuni ishlatamiz.
        const ts = f.timestamp?.timestampValue
          ? new Date(f.timestamp.timestampValue).getTime()
          : 0;
        return {
          vaqt: f.vaqt?.stringValue || "",
          holat: f.holat?.stringValue || "",
          _ts: ts,
        };
      })
      // eng yangi birinchi
      .sort((a, b) => b._ts - a._ts)
      .slice(0, 300)
      .map(({ _ts, ...rest }) => rest);

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ checkins });
  } catch (e) {
    res.status(500).json({ xato: String(e) });
  }
}
