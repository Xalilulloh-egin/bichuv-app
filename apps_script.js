// ==========================================
// BICHUV BAZA — APPS SCRIPT v3
// ==========================================
const SS_ID = '1a-HRTEE6VgEmCgnbsEf9aPcthUtPMH9IhppNEDnyGiQ';

const HARF_SIZES = ['XXS','XS','S','M','L','XL','XXL','3XL','4XL','5XL'];
const SON_SIZES = ['40','42','44','46','48','50','52','54','56','58','60','62','64','66','68','70','72','74','76','78','80','82','84','86'];
const BOLA_SIZES = ['120','122','124','126','128','130','132','134','136','138','140','142','144','146','148','150','152','154','156','158','160','162','164','166'];

function getSizeGroup(razmer) {
  const r = String(razmer).trim().toUpperCase();
  if (HARF_SIZES.includes(r)) return 'harf';
  const num = parseInt(r);
  if (isNaN(num)) return 'harf';
  if (num >= 120 && num <= 166) return 'bola';
  return 'son';
}

// ===== onEdit: SizeGroup → Razmer dropdown =====
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const nm = sheet.getName();
  if (nm !== 'Razmerlar rejasi' && nm !== 'Таблица2') return;
  const col = e.range.getColumn(), row = e.range.getRow();
  if (row < 2) return;
  
  if (col === 2) { // B=SizeGroup → C=Razmer dropdown
    const g = String(e.range.getValue()).trim().toLowerCase();
    let sizes = [];
    if (g === 'harf' || g === 'харфли') sizes = HARF_SIZES;
    else if (g === 'son' || g === 'сон') sizes = SON_SIZES;
    else if (g === 'bola' || g === 'детский' || g === 'болалар') sizes = BOLA_SIZES;
    if (sizes.length > 0) {
      sheet.getRange(row, 3).setDataValidation(
        SpreadsheetApp.newDataValidation().requireValueInList(sizes, true).setAllowInvalid(false).build()
      ).setValue('');
    }
  }
  if (col === 3) { // C=Razmer → B=SizeGroup avto
    const razmer = e.range.getValue();
    if (razmer) sheet.getRange(row, 2).setValue(getSizeGroup(razmer));
  }
}

// ===== HANDLERS =====
function doGet(e) {
  const action = e.parameter.action;
  if (action === 'getAllData') return json(getAllData());
  return json({ status:'error', message:'Unknown action' });
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  if (data.action === 'saveFaktRazmer') return json(saveFaktRazmer(data));
  return json({ status:'error', message:'Unknown action' });
}

// ===== GET ALL DATA =====
function getAllData() {
  const ss = SpreadsheetApp.openById(SS_ID);

  // 1. TRIMKARTALAR
  const trimSheet = ss.getSheetByName('Тримкарталар') || ss.getSheetByName('ТРИМКАРТА РЎЙХАТИ') || ss.getSheets()[0];
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

  // 2. ПАРТИЯЛАР — "Партиялар" varag'idan
  // A=Сана | B=Тримкарта № | C=Махсулот номи | D=Ранги | E=Партия рақами | F=Партия кг | G=Бичилган кг | H=Қолдиқ кг | I=# | J=Холат
  const partSheet = ss.getSheetByName('Партиялар');
  const partiyalar = {};
  if (partSheet) {
    const pd = partSheet.getDataRange().getValues();
    for (let i = 3; i < pd.length; i++) { // row 3 = header, data from row 4
      const trimId = String(pd[i][1]).trim(); // B - Тримкарта №
      if (!trimId) continue;
      const sana = formatDate(pd[i][0]);      // A - Сана
      const partRaqam = String(pd[i][4]).trim(); // E - Партия рақами
      if (!partRaqam) continue;
      
      if (!partiyalar[trimId]) partiyalar[trimId] = [];
      partiyalar[trimId].push({
        rowIndex: i + 1,
        sana: sana,
        trimId: trimId,
        mahsulot: String(pd[i][2]).trim(),     // C - Махсулот номи
        rangi: String(pd[i][3]).trim(),         // D - Ранги
        partiya: partRaqam,                     // E - Партия рақами
        partiyaKg: parseNum(pd[i][5]),          // F - Партия кг
        bichildiKg: parseNum(pd[i][6]),         // G - Бичилган кг
        qoldiqKg: parseNum(pd[i][7]),           // H - Қолдиқ кг
        holat: String(pd[i][9]||'').trim(),     // J - Холат
      });
    }
  }

  // 3. RAZMERLAR REJASI — A=Trimkarta | B=SizeGroup | C=Razmer | D=Reja soni
  const rejaSheet = ss.getSheetByName('Razmerlar rejasi') || ss.getSheetByName('Таблица2');
  const rejaMap = {};
  if (rejaSheet) {
    const rd = rejaSheet.getDataRange().getValues();
    for (let i = 1; i < rd.length; i++) {
      const trimId = String(rd[i][0]).trim();
      const group = String(rd[i][1]||'').trim();
      const size = String(rd[i][2]).trim();
      const qty = parseNum(rd[i][3]);
      if (!trimId || !size) continue;
      const sg = group || getSizeGroup(size);
      if (!rejaMap[trimId]) rejaMap[trimId] = { sizes: [], reja: {}, sizeGroup: sg };
      rejaMap[trimId].sizes.push(size);
      rejaMap[trimId].reja[size] = qty;
    }
  }

  // 4. RAZMERLAR FAKT
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

  // BIRLASHTIRISH
  const result = trimkartalar.map(t => {
    const r = rejaMap[t.id];
    let sizes = null;
    if (r) {
      sizes = { group: r.sizeGroup, active: r.sizes, reja: r.reja, fakt: faktRazMap[t.id] || {} };
    }
    return { ...t, partiyalar: partiyalar[t.id] || [], sizes };
  });

  return { status: 'ok', data: result };
}

// ===== SAVE FAKT RAZMER =====
function saveFaktRazmer(data) {
  const ss = SpreadsheetApp.openById(SS_ID);
  let sheet = ss.getSheetByName('Razmerlar fakt');
  if (!sheet) {
    sheet = ss.insertSheet('Razmerlar fakt');
    sheet.getRange(1, 1, 1, 4).setValues([['Trimkarta', 'Razmer', 'Fakt', 'Sana']]);
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  const existing = sheet.getDataRange().getValues();
  for (let i = existing.length - 1; i >= 1; i--) {
    if (String(existing[i][0]).trim() === data.trimId) sheet.deleteRow(i + 1);
  }
  const sizes = data.sizes || [];
  const today = Utilities.formatDate(new Date(), 'Asia/Tashkent', 'yyyy-MM-dd');
  const rows = [];
  sizes.forEach(sz => {
    const f = Number(data.fakt[sz]) || 0;
    if (f > 0) rows.push([data.trimId, sz, f, today]);
  });
  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 4).setValues(rows);
  }
  return { status: 'ok' };
}

// ===== HELPERS =====
function parseNum(v) {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(String(v).replace(/\s/g, '').replace(',', '.'));
  return isNaN(n) ? 0 : n;
}
function formatDate(v) {
  if (!v) return '';
  if (v instanceof Date) return Utilities.formatDate(v, 'Asia/Tashkent', 'yyyy-MM-dd');
  return String(v);
}
function json(d) { return ContentService.createTextOutput(JSON.stringify(d)).setMimeType(ContentService.MimeType.JSON); }
