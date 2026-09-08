# 9-V sinf o'quvchilari ma'lumot to'plash tizimi

## Fayllar
- `index.html` — ota-onalar to'ldiradigan bosqichma-bosqich forma (welcome → farzandni tanlash → manzil → ota-ona ma'lumoti → hujjat → muvaffaqiyat xabari). Ma'lumotlar Firestore'ga `oquvchilar` kolleksiyasiga yoziladi.
- `messages/index.html` — kelib tushgan ma'lumotlarni ro'yxat ko'rinishida ko'rsatadigan sahifa (real vaqtda yangilanadi, qidiruv bor).

## GitHub Pages orqali ishga tushirish
1. Ushbu papkani (yoki zip ichidagi barcha fayllarni) GitHub repository'ga yukla.
2. Repository → Settings → Pages → Source: `main` branch, `/ (root)` papkani tanla → Save.
3. Bir necha daqiqadan keyin sayt quyidagi manzillarda ishlaydi:
   - Forma: `https://<username>.github.io/<repo-nomi>/`
   - Natijalar: `https://<username>.github.io/<repo-nomi>/messages/`

## Muhim — Firebase sozlamalari
Ikkala faylda ham Firebase config allaqachon kiritilgan (`malumnotalr` loyihasi).

### 1. Firestore Security Rules (majburiy!)
Firebase Console → Firestore Database → Rules bo'limiga o'ting va quyidagini joylashtiring
(fayl sifatida ham loyihada bor: `firestore.rules`):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /oquvchilar/{docId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

- `create: true` — forma orqali har kim yozishi mumkin.
- `read: if request.auth != null` — ma'lumotlarni **faqat tizimga kirgan** kishi (sinf rahbari) o'qiy oladi. Login qilmagan hech kim, hatto Firebase konfiguratsiyasini bilsa ham, ma'lumotlarni to'g'ridan-to'g'ri o'qiy olmaydi.
- `update, delete: false` — hech kim mavjud yozuvni o'zgartira yoki o'chira olmaydi.
- Boshqa har qanday collection — hech kimga hech qanday ruxsat yo'q.

### 2. Firebase Authentication — sinf rahbari akkaunti yaratish
`messages/index.html` sahifasi endi parol o'rniga **haqiqiy Firebase login** so'raydi. Buning uchun:
1. Firebase Console → Authentication → Sign-in method → **Email/Password**'ni yoqing.
2. Authentication → Users → **Add user** — sinf rahbarining email va parolini kiriting.
3. Shu email/parol bilan `messages/index.html` sahifasiga kirish mumkin bo'ladi.

Eski `PASS` collection endi ishlatilmaydi — uni Firestore'dan xohlasangiz o'chirib tashlashingiz mumkin, u baribir yangi qoidalar bo'yicha hech kimga ochiq emas.
