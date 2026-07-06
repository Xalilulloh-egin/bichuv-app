// ==========================================
// BICHUV BAZA — APPS SCRIPT
// ==========================================
// 1. "Бичув база" spreadsheet → Extensions → Apps Script
// 2. Bu kodni joylashtiring
// 3. Deploy → New deployment → Web app
//    Execute as: Me | Access: Anyone
// 4. URL ni saytga kiriting
// ==========================================
//
// KERAKLI VARAQLAR:
// - "ТРИМКАРТА РЎЙХАТИ" — trimkarta ro'yxati (mavjud)
// - "Факт"               — partiya ma'lumotlari (mavjud)
// - "Razmerlar rejasi"   — YANGI: razmer bo'yicha reja
//       Ustunlar: Trimkarta | Razmer | Reja soni | SizeGroup
//       Masalan:  B26-146   | 128    | 250       | bola
//                 B26-146   | 134    | 280       | bola
//                 B26-153   | M      | 400       | harf
// - "Razmerlar fakt"     — avto yaratiladi: saytdan kiritilgan fakt
// ==========================================

const SS_ID = '1a-HRTEE6VgEmCgnbsEf9aPcthUtPMH9IhppNEDnyGiQ';

function doGet(e) {
  const action = e.parameter.action;
  if (action === 'getAllData') return json(getAllData());
  if (action === 'getTrimkartaList') return json(getTrimkartaList());
  return json({ status:'error', message:'Unknown action' });
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  if (data.action === 'savePartiya') return json(savePartiya(data));
  if (data.action === 'deletePartiya') return json(deletePartiya(data));
  if (data.action === 'saveFaktRazmer') return json(saveFaktRazmer(data));
  return json({ status:'error', message:'Unknown action' });
}

// ===== GET ALL DATA =====

function getAllData() {
  const ss = SpreadsheetApp.openById(SS_ID);

  // 1. Trimkarta ro'yxati
  const trimSheet = ss.getSheetByName('ТРИМКАРТА РЎЙХАТИ') || ss.getSheets()[0];
  const trimData = trimSheet.getDataRange().getValues();
  const trimkartalar = [];
  for (let i = 2; i < trimData.length; i++) {
    const id = String(trimData[i][0]).trim();
    if (!id) continue;
    trimkartalar.push({
      id, name: String(trimData[i][1]).trim(), color: String(trimData[i][2]).trim(),
      eni: parseNum(trimData[i][3]), grammaj: parseNum(trimData[i][4]),
      zakazKg: parseNum(trimData[i][5]), orderQty: parseNum(trimData[i][6]),
      mavjudKg: parseNum(trimData[i][9]), partiyaSoni: parseNum(trimData[i][10]),
      qolganKg: parseNum(trimData[i][11]), holat: String(trimData[i][12]||'').trim()
    });
  }

  // 2. Partiyalar (Факт)
  const faktSheet = ss.getSheetByName('Факт');
  const partiyalar = {};
  if (faktSheet) {
    const fd = faktSheet.getDataRange().getValues();
    for (let i = 4; i < fd.length; i++) {
      const trimId = String(fd[i][2]).trim();
      if (!trimId) continue;
      if (!partiyalar[trimId]) partiyalar[trimId] = [];
      partiyalar[trimId].push({
        rowIndex: i + 1,
        sana: formatDate(fd[i][0]),
        partiya: String(fd[i][1]).trim(),
        trimId, mahsulot: String(fd[i][3]).trim(), rangi: String(fd[i][4]).trim(),
        kunBoshiKg: parseNum(fd[i][5]), bichildiKg: parseNum(fd[i][6]),
        topBoshi: parseNum(fd[i][7]), otxod: parseNum(fd[i][8]),
        tozaBichilgan: parseNum(fd[i][9]), dona: parseNum(fd[i][10]),
        harBirIsh: parseNum(fd[i][11]), kunOxiriKg: parseNum(fd[i][12]),
      });
    }
  }

  // 3. Razmerlar REJA (faqat o'qish — Sheets dan)
  const rejaSheet = ss.getSheetByName('Razmerlar rejasi');
  const rejaMap = {};
  if (rejaSheet) {
    const rd = rejaSheet.getDataRange().getValues();
    for (let i = 1; i < rd.length; i++) {
      const trimId = String(rd[i][0]).trim();
      const size = String(rd[i][1]).trim();
      const qty = parseNum(rd[i][2]);
      const group = String(rd[i][3] || 'harf').trim();
      if (!trimId || !size) continue;
      if (!rejaMap[trimId]) rejaMap[trimId] = { sizes: [], reja: {}, sizeGroup: group };
      rejaMap[trimId].sizes.push(size);
      rejaMap[trimId].reja[size] = qty;
    }
  }

  // 4. Razmerlar FAKT (saytdan kiritilgan)
  const faktRazSheet = ss.getSheetByName('Razmerlar fakt');
  const faktRazMap = {};
  if (faktRazSheet) {
    const frd = faktRazSheet.getDataRange().getValues();
    for (let i = 1; i < frd.length; i++) {
      const trimId = String(frd[i][0]).trim();
      const size = String(frd[i][1]).trim();
      const qty = parseNum(frd[i][2]);
      if (!trimId || !size) continue;
      if (!faktRazMap[trimId]) faktRazMap[trimId] = {};
      faktRazMap[trimId][size] = qty;
    }
  }

  // Birlashtirish
  const result = trimkartalar.map(t => {
    const r = rejaMap[t.id];
    let sizes = null;
    if (r) {
      const fk = faktRazMap[t.id] || {};
      sizes = { group: r.sizeGroup, active: r.sizes, reja: r.reja, fakt: fk };
    }
    return { ...t, partiyalar: partiyalar[t.id] || [], sizes };
  });

  return { status: 'ok', data: result };
}

// ===== TRIMKARTA LIST =====

function getTrimkartaList() {
  const ss = SpreadsheetApp.openById(SS_ID);
  const sheet = ss.getSheetByName('ТРИМКАРТА РЎЙХАТИ') || ss.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  const result = [];
  for (let i = 2; i < data.length; i++) {
    const id = String(data[i][0]).trim();
    if (!id) continue;
    result.push({ id, name: String(data[i][1]).trim(), color: String(data[i][2]).trim(),
      orderQty: parseNum(data[i][6]), mavjudKg: parseNum(data[i][9]) });
  }
  return { status: 'ok', data: result };
}

// ===== SAVE / DELETE PARTIYA =====

function savePartiya(data) {
  const ss = SpreadsheetApp.openById(SS_ID);
  const sheet = ss.getSheetByName('Факт');
  if (!sheet) return { status:'error', message:'Факт varag\'i topilmadi' };

  if (data.rowIndex) {
    const row = data.rowIndex;
    sheet.getRange(row, 1).setValue(data.sana);
    sheet.getRange(row, 2).setValue(data.partiya);
    sheet.getRange(row, 7).setValue(data.bichildiKg);
    sheet.getRange(row, 8).setValue(data.topBoshi);
    sheet.getRange(row, 9).setValue(data.otxod);
    sheet.getRange(row, 10).setValue(data.tozaBichilgan);
    sheet.getRange(row, 11).setValue(data.dona);
  } else {
    const newRow = sheet.getLastRow() + 1;
    sheet.getRange(newRow, 1).setValue(data.sana);
    sheet.getRange(newRow, 2).setValue(data.partiya);
    sheet.getRange(newRow, 3).setValue(data.trimId);
    sheet.getRange(newRow, 4).setValue(data.mahsulot || '');
    sheet.getRange(newRow, 5).setValue(data.rangi || '');
    sheet.getRange(newRow, 7).setValue(data.bichildiKg);
    sheet.getRange(newRow, 8).setValue(data.topBoshi);
    sheet.getRange(newRow, 9).setValue(data.otxod);
    sheet.getRange(newRow, 10).setValue(data.tozaBichilgan);
    sheet.getRange(newRow, 11).setValue(data.dona);
  }
  return { status: 'ok' };
}

function deletePartiya(data) {
  const ss = SpreadsheetApp.openById(SS_ID);
  const sheet = ss.getSheetByName('Факт');
  if (!sheet || !data.rowIndex) return { status:'error', message:'Topilmadi' };
  sheet.deleteRow(data.rowIndex);
  return { status: 'ok' };
}

// ===== SAVE FAKT RAZMER (faqat fakt — reja o'zgarmaydi) =====

function saveFaktRazmer(data) {
  const ss = SpreadsheetApp.openById(SS_ID);
  let sheet = ss.getSheetByName('Razmerlar fakt');

  if (!sheet) {
    sheet = ss.insertSheet('Razmerlar fakt');
    sheet.getRange(1, 1, 1, 4).setValues([['Trimkarta', 'Razmer', 'Fakt', 'Sana']]);
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  // Eski fakt o'chirish
  const existing = sheet.getDataRange().getValues();
  for (let i = existing.length - 1; i >= 1; i--) {
    if (String(existing[i][0]).trim() === data.trimId) {
      sheet.deleteRow(i + 1);
    }
  }

  // Yangi fakt yozish
  const sizes = data.sizes || [];
  const today = Utilities.formatDate(new Date(), 'Asia/Tashkent', 'yyyy-MM-dd');
  const rows = [];
  sizes.forEach(sz => {
    const f = Number(data.fakt[sz]) || 0;
    if (f > 0) rows.push([data.trimId, sz, f, today]);
  });

  if (rows.length > 0) {
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, rows.length, 4).setValues(rows);
  }

  return { status: 'ok' };
}

// ===== HELPERS =====

function parseNum(val) {
  if (val === null || val === undefined || val === '') return 0;
  const n = Number(String(val).replace(/\s/g, '').replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

function formatDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, 'Asia/Tashkent', 'yyyy-MM-dd');
  }
  return String(val);
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
