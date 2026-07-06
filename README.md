# ✂️ Bichuv Boshqaruv Tizimi

To'qimachilik korxonasi uchun bichuv jarayonini kuzatish tizimi.

## Imkoniyatlari

- **Dashboard** — umumiy statistika: bichildi, qolgan, otxod, top boshi
- **Trimkartalar** — har bir trimkarta bo'yicha partiya boshqaruvi
- **Razmerlar** — reja (Sheets dan) va fakt (saytdan) solishtirish
- **Hisobot** — trimkarta va partiya bo'yicha jadval hisobotlari
- **Google Sheets** bilan to'liq sinxronizatsiya

## Sheets Tuzilishi

### Mavjud varaqlar:
- `ТРИМКАРТА РЎЙХАТИ` — trimkarta ro'yxati
- `Факт` — partiya bo'yicha bichilish ma'lumotlari

### Yangi yaratish kerak:

#### `Razmerlar rejasi` varag'i:
| Trimkarta | Razmer | Reja soni | SizeGroup |
|-----------|--------|-----------|-----------|
| B26-146   | 128    | 250       | bola      |
| B26-146   | 134    | 280       | bola      |
| B26-153   | M      | 400       | harf      |
| B26-153   | L      | 600       | harf      |

SizeGroup turlari: `harf` (S-5XL), `son` (40-70), `bola` (72-164)

#### `Razmerlar fakt` varag'i:
Avtomatik yaratiladi — saytdan kiritilgan fakt sonlar shu yerga yoziladi.

## O'rnatish

1. Spreadsheet → Extensions → Apps Script
2. `apps_script.js` kodini joylashtiring
3. Deploy → New deployment → Web app (Execute as: Me, Access: Anyone)
4. URL ni saytga kiriting

## Fayllar

- `bichuv_app.jsx` — React frontend
- `apps_script.js` — Google Apps Script backend
