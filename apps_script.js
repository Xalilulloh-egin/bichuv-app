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
  if (action === 'debug') return json(debugSheets());
  return json({ status:'error', message:'Unknown action' });
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  if (data.action === 'saveFaktRazmer') return json(saveFaktRazmer(data));
  if (data.action === 'saveBichish') return json(saveBichish(data));
  return json({ status:'error', message:'Unknown action' });
}

// ===== SAVE BICHISH — "Кунлик Бичув" varag'iga yozish =====
// A=Сана | B=Партия рақами | C,D,E=formulalar (yozilmaydi)
// G=Бичилди кг | H=Топ боши кг | I=Отход кг | J=Тоза (авт) | K=Бичилди ДОНА
function saveBichish(data) {
  const ss = SpreadsheetApp.openById(SS_ID);
  const sheet = ss.getSheetByName('Кунлик Бичув');
  if (!sheet) return { status:'error', message:'Кунлик Бичув topilmadi' };
  
  const bichildi = Number(data.bichildiKg) || 0;
  const topBoshi = Number(data.topBoshi) || 0;
  const otxod = Number(data.otxod) || 0;
  const toza = bichildi - topBoshi - otxod;
  const dona = Number(data.dona) || 0;
  
  // A ustunidan oxirgi yozilgan qatorni topish (bo'sh qatorlarni o'tkazib)
  const colA = sheet.getRange('A1:A').getValues();
  let lastDataRow = 4; // minimum 4-qatordan keyin
  for (let i = colA.length - 1; i >= 0; i--) {
    if (colA[i][0] !== '' && colA[i][0] !== null) {
      lastDataRow = i + 1;
      break;
    }
  }
  const newRow = Math.max(lastDataRow + 1, 5); // minimum 5-qatordan
  
  const sana = data.sana || Utilities.formatDate(new Date(), 'Asia/Tashkent', 'yyyy-MM-dd');
  
  sheet.getRange(newRow, 1).setValue(sana);          // A - Сана
  sheet.getRange(newRow, 2).setValue(data.partiya);   // B - Партия рақами
  // C, D, E — yozilmaydi (formulalar bor)
  sheet.getRange(newRow, 7).setValue(bichildi);       // G - Бичилди кг
  sheet.getRange(newRow, 8).setValue(topBoshi);       // H - Топ боши кг
  sheet.getRange(newRow, 9).setValue(otxod);          // I - Отход кг
  // J — yozilmaydi (formula)
  sheet.getRange(newRow, 11).setValue(dona);          // K - Бичилди ДОНА
  
  return { status: 'ok', row: newRow };
}

// ===== DEBUG =====
function debugSheets() {
  const ss = SpreadsheetApp.openById(SS_ID);
  const sheets = ss.getSheets().map(s => s.getName());
  
  const trimSheet = ss.getSheetByName('Тримкарталар') || ss.getSheetByName('ТРИМКАРТА РЎЙХАТИ') || ss.getSheets()[0];
  const td = trimSheet.getDataRange().getValues();
  const trimSample = [];
  for (let i = 0; i < Math.min(5, td.length); i++) {
    trimSample.push(td[i].slice(0,4).map(c => String(c).substring(0,30)));
  }
  
  const partSheet = ss.getSheetByName('Партиялар');
  const partInfo = { found: !!partSheet, totalRows: 0, sample: [], b26_163: [] };
  if (partSheet) {
    const pd = partSheet.getDataRange().getValues();
    partInfo.totalRows = pd.length;
    for (let i = 0; i < Math.min(6, pd.length); i++) {
      partInfo.sample.push(pd[i].slice(0,8).map(c => String(c).substring(0,30)));
    }
    for (let i = 0; i < pd.length; i++) {
      if (String(pd[i][1]).trim() === 'B26-163') {
        partInfo.b26_163.push({ row:i, d: pd[i].slice(0,8).map(c => String(c).substring(0,25)) });
        if (partInfo.b26_163.length >= 3) break;
      }
    }
  }
  
  return { status:'ok', sheets, trimSheet: trimSheet.getName(), trimSample, partInfo };
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

  // 3. RAZMERLAR REJASI — A=Trimkarta | B=SizeGroup | C=Razmer | D=Reja soni | E=Fakt soni
  const rejaSheet = ss.getSheetByName('Razmerlar rejasi') || ss.getSheetByName('Таблица2');
  const rejaMap = {};
  if (rejaSheet) {
    const rd = rejaSheet.getDataRange().getValues();
    for (let i = 1; i < rd.length; i++) {
      const trimId = String(rd[i][0]).trim();
      const group = String(rd[i][1]||'').trim();
      const size = String(rd[i][2]).trim();
      const rejaQty = parseNum(rd[i][3]);           // D - Reja soni
      const faktQty = parseNum(rd[i][4]);            // E - Fakt soni
      if (!trimId || !size) continue;
      const sg = group || getSizeGroup(size);
      if (!rejaMap[trimId]) rejaMap[trimId] = { sizes: [], reja: {}, fakt: {}, sizeGroup: sg };
      rejaMap[trimId].sizes.push(size);
      rejaMap[trimId].reja[size] = rejaQty;
      rejaMap[trimId].fakt[size] = faktQty;
    }
  }

  // BIRLASHTIRISH
  const result = trimkartalar.map(t => {
    const r = rejaMap[t.id];
    let sizes = null;
    if (r) {
      sizes = { group: r.sizeGroup, active: r.sizes, reja: r.reja, fakt: r.fakt };
    }
    return { ...t, partiyalar: partiyalar[t.id] || [], sizes };
  });

  return { status: 'ok', data: result };
}

// ===== SAVE FAKT RAZMER — E ustuniga yozish =====
function saveFaktRazmer(data) {
  const ss = SpreadsheetApp.openById(SS_ID);
  const sheet = ss.getSheetByName('Razmerlar rejasi') || ss.getSheetByName('Таблица2');
  if (!sheet) return { status:'error', message:'Razmerlar rejasi topilmadi' };
  
  const rd = sheet.getDataRange().getValues();
  for (let i = 1; i < rd.length; i++) {
    const trimId = String(rd[i][0]).trim();
    const size = String(rd[i][2]).trim();
    if (trimId === data.trimId && size) {
      const faktVal = Number(data.fakt[size]) || 0;
      sheet.getRange(i + 1, 5).setValue(faktVal); // E ustuni (5-chi ustun)
    }
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
