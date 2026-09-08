# 9-V sinf o'quvchilari ma'lumot to'plash tizimi

## Fayllar
- `index.html` — o'quvchilar to'ldiradigan forma (F.I.Sh, manzil, ota-ona ma'lumoti, hujjat ma'lumoti). Ma'lumotlar Firestore'ga `oquvchilar` kolleksiyasiga yoziladi.
- `messages/index.html` — kelib tushgan ma'lumotlarni ro'yxat ko'rinishida ko'rsatadigan sahifa (real vaqtda yangilanadi, qidiruv bor).

## GitHub Pages orqali ishga tushirish
1. Ushbu papkani (yoki zip ichidagi barcha fayllarni) GitHub repository'ga yukla.
2. Repository → Settings → Pages → Source: `main` branch, `/ (root)` papkani tanla → Save.
3. Bir necha daqiqadan keyin sayt quyidagi manzillarda ishlaydi:
   - Forma: `https://<username>.github.io/<repo-nomi>/`
   - Natijalar: `https://<username>.github.io/<repo-nomi>/messages/`

## Muhim — Firebase sozlamalari
Ikkala faylda ham Firebase config allaqachon kiritilgan (`malumnotalr` loyihasi).

Firestore Security Rules quyidagicha bo'lishi kerak (Firebase Console → Firestore Database → Rules):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /oquvchilar/{docId} {
      allow create: if true;
      allow read: if true;
      allow update, delete: if false;
    }
  }
}
```

- `create: true` — forma orqali har kim yozishi mumkin (ismini tanlab).
- `read: true` — `messages/index.html` sahifasi ma'lumotlarni o'qishi uchun kerak.
- `update, delete: false` — hech kim mavjud yozuvni o'zgartira yoki o'chira olmaydi.
