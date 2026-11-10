/*****************************************************************
 *  Password Manager Bot  |  Google Apps Script + Google Sheets
 *  فارسی / English
 *****************************************************************/

/* ============ CONFIG ============ */
const TOKEN = 'BOT_TOKEN_HERE';                       // توکن BotFather
const API_BASE = 'https://api.telegram.org/bot';      // برای بله: 'https://tapi.bale.ai/bot'
const SHEET_ID = '';                                  // خالی = شیتی که اسکریپت به آن متصل است
const WEBAPP_URL = '';                                // خالی = آدرس خودکار Web App
const PER_PAGE = 8;

const DEFAULTS = {
  plen: 16, upper: 1, lower: 1, digits: 1, symbols: 1, noSimilar: 1,
  ulen: 10, udigits: 1, uunder: 0,
  autodel: 2                                           // دقیقه، 0 = خاموش
};

const USERS_H = ['chat_id', 'lang', 'settings', 'state', 'temp'];
const REC_H = ['id', 'chat_id', 'name', 'username', 'password', 'description', 'category', 'created', 'updated'];
const DEL_H = ['chat_id', 'message_id', 'delete_at'];

const FIELDS = {
  n: { key: 'name', col: 3, max: 60, label: 'f_name' },
  u: { key: 'username', col: 4, max: 200, label: 'f_user' },
  p: { key: 'password', col: 5, max: 200, label: 'f_pass' },
  d: { key: 'desc', col: 6, max: 500, label: 'f_desc' },
  c: { key: 'cat', col: 7, max: 40, label: 'f_cat' }
};

/* ============ TEXTS ============ */
const T = {
  fa: {
    pick_lang: '🌐 زبان خود را انتخاب کنید / Choose your language',
    welcome: '👋 به ربات مدیریت رمز عبور خوش آمدید!\n\nپسورد و یوزرنیم تصادفی بسازید و در لیست خودتان ذخیره کنید.\nاز دکمه‌های پایین استفاده کنید 👇',
    help: 'ℹ️ <b>راهنما</b>\n\n/gen ساخت پسورد و یوزرنیم\n/list لیست ذخیره‌شده‌ها\n/settings تنظیمات\n/cancel لغو عملیات جاری',
    btn_gen: '🔐 ساخت', btn_rec: '📋 لیست من', btn_set: '⚙️ تنظیمات',
    use_menu: 'از دکمه‌های پایین استفاده کنید 👇',
    l_pass: '🔑 پسورد', l_user: '👤 یوزرنیم',
    regen: '🔄 دوباره', save: '💾 ذخیره', close: '✖️ بستن',
    autodel_note: '⏳ این پیام {0} دقیقه دیگر پاک می‌شود.',
    ask_name: '📌 یک نام برای این رکورد بنویسید (مثلاً Netflix):',
    ask_desc: '📝 توضیحات را بنویسید (اختیاری):',
    ask_cat: '📁 دسته‌بندی را بنویسید یا از لیست انتخاب کنید (اختیاری):',
    skip: '⏭ رد کردن', cancel: '❌ لغو', cancelled: '❌ لغو شد.',
    saved: '✅ ذخیره شد.', updated: '✅ بروزرسانی شد.', deleted: '🗑 حذف شد.',
    empty: '📭 هنوز چیزی ذخیره نکرده‌اید.',
    list_title: '📋 <b>رکوردهای شما</b> ({0})',
    list_cat: '📁 <b>{0}</b> ({1})',
    cats: '📁 دسته‌بندی‌ها', all: '📋 همه', back: '⬅️ بازگشت',
    no_cats: 'دسته‌بندی‌ای وجود ندارد.',
    pick_cat: '📁 یک دسته را انتخاب کنید:',
    f_name: 'نام', f_user: 'یوزرنیم', f_pass: 'پسورد', f_desc: 'توضیحات', f_cat: 'دسته',
    newpass: '🔄 پسورد جدید', newuser: '🔄 یوزرنیم جدید',
    del: '🗑 حذف', yes: '✅ بله، حذف', no: '❌ خیر',
    del_confirm: '⚠️ رکورد «{0}» حذف شود؟ این کار برگشت‌پذیر نیست.',
    ask_new: '✏️ مقدار جدید «{0}» را بنویسید:\n(برای خالی کردن توضیحات/دسته، - بفرستید)',
    not_found: '❌ رکورد پیدا نشد.',
    too_long: '❌ متن خیلی طولانی است، کوتاه‌تر بنویسید.',
    settings: '⚙️ <b>تنظیمات</b>\nبا دکمه‌ها تغییر دهید:',
    s_plen: '🔑 طول پسورد', s_nosim: 'حذف کاراکترهای مشابه (O/0 l/1)',
    s_ulen: '👤 طول یوزرنیم', s_udig: 'عدد در یوزرنیم', s_uund: 'آندرلاین (_)',
    s_autodel: '⏳ پاک شدن خودکار', off: 'خاموش', min: '{0} دقیقه',
    s_lang: '🌐 English', need_one: 'حداقل یک نوع کاراکتر باید فعال بماند.',
    lang_set: '✅ زبان تغییر کرد.'
  },
  en: {
    pick_lang: '🌐 زبان خود را انتخاب کنید / Choose your language',
    welcome: '👋 Welcome to the Password Manager bot!\n\nGenerate random passwords and usernames and save them to your list.\nUse the buttons below 👇',
    help: 'ℹ️ <b>Help</b>\n\n/gen generate password & username\n/list saved records\n/settings settings\n/cancel cancel current action',
    btn_gen: '🔐 Generate', btn_rec: '📋 My list', btn_set: '⚙️ Settings',
    use_menu: 'Use the buttons below 👇',
    l_pass: '🔑 Password', l_user: '👤 Username',
    regen: '🔄 Again', save: '💾 Save', close: '✖️ Close',
    autodel_note: '⏳ This message will be deleted in {0} min.',
    ask_name: '📌 Enter a name for this record (e.g. Netflix):',
    ask_desc: '📝 Enter a description (optional):',
    ask_cat: '📁 Type a category or pick one (optional):',
    skip: '⏭ Skip', cancel: '❌ Cancel', cancelled: '❌ Cancelled.',
    saved: '✅ Saved.', updated: '✅ Updated.', deleted: '🗑 Deleted.',
    empty: '📭 You have not saved anything yet.',
    list_title: '📋 <b>Your records</b> ({0})',
    list_cat: '📁 <b>{0}</b> ({1})',
    cats: '📁 Categories', all: '📋 All', back: '⬅️ Back',
    no_cats: 'No categories yet.',
    pick_cat: '📁 Pick a category:',
    f_name: 'Name', f_user: 'Username', f_pass: 'Password', f_desc: 'Description', f_cat: 'Category',
    newpass: '🔄 New password', newuser: '🔄 New username',
    del: '🗑 Delete', yes: '✅ Yes, delete', no: '❌ No',
    del_confirm: '⚠️ Delete "{0}"? This cannot be undone.',
    ask_new: '✏️ Enter the new "{0}":\n(send - to clear description/category)',
    not_found: '❌ Record not found.',
    too_long: '❌ Text is too long, please shorten it.',
    settings: '⚙️ <b>Settings</b>\nTap to change:',
    s_plen: '🔑 Password length', s_nosim: 'Exclude look-alikes (O/0 l/1)',
    s_ulen: '👤 Username length', s_udig: 'Digits in username', s_uund: 'Underscore (_)',
    s_autodel: '⏳ Auto-delete', off: 'Off', min: '{0} min',
    s_lang: '🌐 فارسی', need_one: 'At least one character type must stay on.',
    lang_set: '✅ Language changed.'
  }
};

function t_(u, k) {
  const L = T[u.lang] || T.fa;
  let s = L[k] !== undefined ? L[k] : k;
  for (let i = 2; i < arguments.length; i++) s = s.split('{' + (i - 2) + '}').join(arguments[i]);
  return s;
}

/* ============ SETUP (یک بار اجرا کنید) ============ */
function setup() {
  sheet_('Users', USERS_H);
  sheet_('Records', REC_H, true);
  sheet_('Deletions', DEL_H);
  ScriptApp.getProjectTriggers()
    .filter(function (t) { return t.getHandlerFunction() === 'processDeletes'; })
    .forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('processDeletes').timeBased().everyMinutes(1).create();
  tg_('setMyCommands', { commands: [
    { command: 'gen', description: 'Generate / ساخت' },
    { command: 'list', description: 'My list / لیست من' },
    { command: 'settings', description: 'Settings / تنظیمات' },
    { command: 'cancel', description: 'Cancel / لغو' }
  ] });
}

function setWebhook() {
  const url = WEBAPP_URL || ScriptApp.getService().getUrl();
  const r = tg_('setWebhook', { url: url, drop_pending_updates: true });
  Logger.log(url + '\n' + JSON.stringify(r));
}

function webhookInfo() {
  Logger.log(JSON.stringify(tg_('getWebhookInfo'), null, 2));
}

/* ============ WEBHOOK ============ */
function doGet() { return ContentService.createTextOutput('Bot is running'); }

function doPost(e) {
  let up;
  try { up = JSON.parse(e.postData.contents); } catch (err) { return ok_(); }
  const cache = CacheService.getScriptCache();
  const key = 'u' + up.update_id;
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000);
    if (cache.get(key)) return ok_();             // آپدیت تکراری (retry تلگرام)
    try {
      if (up.message) onMessage_(up.message);
      else if (up.callback_query) onCallback_(up.callback_query);
    } catch (err) {
      const msg = err && err.stack ? err.stack : String(err);
      console.error(msg);
      try { sheet_('Logs', ['time', 'error']).appendRow([new Date().toISOString(), msg]); } catch (x) {}
    }
    cache.put(key, '1', 21600);
  } catch (err) {
    console.error(err);
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
  return ok_();
}
function ok_() { return ContentService.createTextOutput('ok'); }

/* ============ TELEGRAM HELPERS ============ */
function tg_(method, payload) {
  try {
    const r = UrlFetchApp.fetch(API_BASE + TOKEN + '/' + method, {
      method: 'post', contentType: 'application/json',
      payload: JSON.stringify(payload || {}), muteHttpExceptions: true
    });
    return JSON.parse(r.getContentText());
  } catch (e) { return { ok: false }; }
}
function send_(chat, text, kb) {
  return tg_('sendMessage', { chat_id: chat, text: text, parse_mode: 'HTML', reply_markup: kb, disable_web_page_preview: true });
}
function edit_(chat, mid, text, kb) {
  return tg_('editMessageText', { chat_id: chat, message_id: mid, text: text, parse_mode: 'HTML',
    reply_markup: kb || { inline_keyboard: [] }, disable_web_page_preview: true });
}
function clearKb_(chat, mid) {
  tg_('editMessageReplyMarkup', { chat_id: chat, message_id: mid, reply_markup: { inline_keyboard: [] } });
}
function esc_(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function clamp_(v, a, b) { return Math.max(a, Math.min(b, v)); }

/* ============ SHEETS ============ */
function ss_() { return SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet(); }
function sheet_(name, headers, asText) {
  const ss = ss_();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (asText) sh.getRange(1, 1, sh.getMaxRows(), headers.length).setNumberFormat('@');
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.setFrozenRows(1);
  }
  return sh;
}
function parse_(s) { try { return JSON.parse(s) || {}; } catch (e) { return {}; } }

function getUser_(chat) {
  const sh = sheet_('Users', USERS_H);
  const last = sh.getLastRow();
  if (last >= 2) {
    const rows = sh.getRange(2, 1, last - 1, 5).getValues();
    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][0]) === String(chat)) {
        return { row: i + 2, chat: chat, lang: rows[i][1] || '',
          s: Object.assign({}, DEFAULTS, parse_(rows[i][2])),
          state: rows[i][3] || '', temp: parse_(rows[i][4]) };
      }
    }
  }
  sh.appendRow([chat, '', '{}', '', '{}']);
  return { row: sh.getLastRow(), chat: chat, lang: '', s: Object.assign({}, DEFAULTS), state: '', temp: {} };
}
function saveUser_(u) {
  sheet_('Users', USERS_H).getRange(u.row, 2, 1, 4)
    .setValues([[u.lang, JSON.stringify(u.s), u.state, JSON.stringify(u.temp)]]);
}
function resetState_(u) { u.state = ''; delete u.temp.sv; delete u.temp.ed; }

/* --- records --- */
function recs_(chat) {
  const sh = sheet_('Records', REC_H, true);
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, 9).getValues().map(function (r, i) {
    return { row: i + 2, id: String(r[0]), chat: String(r[1]), name: String(r[2]), username: String(r[3]),
      password: String(r[4]), desc: String(r[5]), cat: String(r[6]) };
  }).filter(function (r) { return r.chat === String(chat); });
}
function getRec_(chat, id) {
  return recs_(chat).filter(function (r) { return r.id === String(id); })[0];
}
function addRec_(chat, r) {
  const sh = sheet_('Records', REC_H, true);
  const row = sh.getLastRow() + 1;
  if (row > sh.getMaxRows()) sh.insertRowsAfter(sh.getMaxRows(), 50);
  const now = new Date().toISOString();
  sh.getRange(row, 1, 1, 9).setNumberFormat('@')
    .setValues([[r.id, String(chat), r.name, r.username, r.password, r.desc, r.cat, now, now]]);
}
function updRec_(rec, F, v) {
  const sh = sheet_('Records', REC_H, true);
  sh.getRange(rec.row, F.col).setNumberFormat('@').setValue(v);
  sh.getRange(rec.row, 9).setNumberFormat('@').setValue(new Date().toISOString());
}
function delRec_(rec) { sheet_('Records', REC_H, true).deleteRow(rec.row); }
function catsOf_(rs) {
  const m = {};
  rs.forEach(function (r) { if (r.cat) m[r.cat] = 1; });
  return Object.keys(m).sort();
}

/* --- auto delete --- */
function addDel_(chat, mid, minutes) {
  if (!minutes || minutes <= 0 || !mid) return;
  sheet_('Deletions', DEL_H).appendRow([chat, mid, Date.now() + minutes * 60000]);
}
function cancelDel_(chat, mid) {
  const sh = sheet_('Deletions', DEL_H);
  const last = sh.getLastRow();
  if (last < 2) return;
  const rows = sh.getRange(2, 1, last - 1, 2).getValues();
  for (let i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i][0]) === String(chat) && String(rows[i][1]) === String(mid)) sh.deleteRow(i + 2);
  }
}
// تریگر هر ۱ دقیقه
function processDeletes() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return;
  try {
    const sh = sheet_('Deletions', DEL_H);
    const last = sh.getLastRow();
    if (last < 2) return;
    const rows = sh.getRange(2, 1, last - 1, 3).getValues();
    const now = Date.now(), keep = [], reqs = [];
    rows.forEach(function (r) {
      if (Number(r[2]) <= now) {
        reqs.push({ url: API_BASE + TOKEN + '/deleteMessage', method: 'post', contentType: 'application/json',
          payload: JSON.stringify({ chat_id: r[0], message_id: r[1] }), muteHttpExceptions: true });
      } else keep.push(r);
    });
    if (!reqs.length) return;
    UrlFetchApp.fetchAll(reqs);
    sh.getRange(2, 1, last - 1, 3).clearContent();
    if (keep.length) sh.getRange(2, 1, keep.length, 3).setValues(keep);
  } finally { lock.releaseLock(); }
}

/* ============ GENERATORS ============ */
let RB = [];
function refill_() {
  for (let i = 0; i < 8; i++) {
    const h = Utilities.getUuid().replace(/-/g, '');
    for (let j = 0; j < 16; j++) {
      if (j === 6 || j === 8) continue;           // بایت‌های ثابت UUID
      RB.push(parseInt(h.substr(j * 2, 2), 16));
    }
  }
}
function rnd_(max) {                               // عدد تصادفی 0..max-1 (بدون سوگیری)
  const lim = 256 - (256 % max);
  while (true) {
    if (!RB.length) refill_();
    const b = RB.pop();
    if (b < lim) return b % max;
  }
}
function genPass_(s) {
  const sim = 'O0oIl1|';
  const sets = [];
  function add(on, chars) {
    if (!on) return;
    if (s.noSimilar) chars = chars.split('').filter(function (c) { return sim.indexOf(c) < 0; }).join('');
    sets.push(chars);
  }
  add(s.upper, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  add(s.lower, 'abcdefghijklmnopqrstuvwxyz');
  add(s.digits, '0123456789');
  add(s.symbols, '!@#$%^&*()-_=+[]{};:,.?');
  if (!sets.length) sets.push('abcdefghijklmnopqrstuvwxyz');
  const all = sets.join('');
  const out = [];
  sets.forEach(function (c) { out.push(c[rnd_(c.length)]); });
  while (out.length < s.plen) out.push(all[rnd_(all.length)]);
  for (let i = out.length - 1; i > 0; i--) {
    const j = rnd_(i + 1);
    const tmp = out[i]; out[i] = out[j]; out[j] = tmp;
  }
  return out.slice(0, s.plen).join('');
}
function genUser_(s) {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  let pool = letters;
  if (s.udigits) pool += '0123456789';
  if (s.uunder) pool += '_';
  let out = letters[rnd_(letters.length)];
  while (out.length < s.ulen) out += pool[rnd_(pool.length)];
  if (out.charAt(out.length - 1) === '_') out = out.slice(0, -1) + letters[rnd_(letters.length)];
  return out;
}

/* ============ KEYBOARDS ============ */
function mainKb_(u) {
  return { keyboard: [[{ text: t_(u, 'btn_gen') }, { text: t_(u, 'btn_rec') }], [{ text: t_(u, 'btn_set') }]],
    resize_keyboard: true, is_persistent: true };
}
function langKb_() {
  return { inline_keyboard: [[{ text: '🇮🇷 فارسی', callback_data: 'lang:fa' }, { text: '🇬🇧 English', callback_data: 'lang:en' }]] };
}
function cancelKb_(u) { return { inline_keyboard: [[{ text: t_(u, 'cancel'), callback_data: 'cancel' }]] }; }
function skipKb_(u) { return { inline_keyboard: [[{ text: t_(u, 'skip'), callback_data: 'sk' }, { text: t_(u, 'cancel'), callback_data: 'cancel' }]] }; }

/* ============ GENERATE VIEW ============ */
function newGen_(u, t) {
  const g = { t: t, p: genPass_(u.s), u: genUser_(u.s) };
  u.temp.gen = g;
  saveUser_(u);
  return g;
}
function genText_(u, g) {
  let x = '';
  if (g.t !== 'u') x += t_(u, 'l_pass') + '\n<code>' + esc_(g.p) + '</code>';
  if (g.t !== 'p') x += (x ? '\n\n' : '') + t_(u, 'l_user') + '\n<code>' + esc_(g.u) + '</code>';
  if (u.s.autodel > 0) x += '\n\n' + t_(u, 'autodel_note', u.s.autodel);
  return x;
}
function genKb_(u, t) {
  const m = function (k, label) { return { text: (t === k ? '• ' : '') + label, callback_data: 'g:' + k }; };
  return { inline_keyboard: [
    [m('p', '🔑'), m('u', '👤'), m('b', '🔑👤')],
    [{ text: t_(u, 'regen'), callback_data: 'g:' + t }, { text: t_(u, 'save'), callback_data: 'sv' }],
    [{ text: t_(u, 'close'), callback_data: 'x' }]
  ] };
}
function sendGen_(u) {
  const g = newGen_(u, 'b');
  const r = send_(u.chat, genText_(u, g), genKb_(u, 'b'));
  if (r && r.ok) addDel_(u.chat, r.result.message_id, u.s.autodel);
}

/* ============ RECORD VIEWS ============ */
function card_(u, r, prefix) {
  let x = (prefix ? prefix + '\n\n' : '') + '📌 <b>' + esc_(r.name) + '</b>';
  if (r.cat) x += '\n📁 ' + esc_(r.cat);
  if (r.desc) x += '\n📝 ' + esc_(r.desc);
  if (r.username) x += '\n\n👤 <code>' + esc_(r.username) + '</code>';
  if (r.password) x += (r.username ? '\n' : '\n\n') + '🔑 <code>' + esc_(r.password) + '</code>';
  if (u.s.autodel > 0) x += '\n\n' + t_(u, 'autodel_note', u.s.autodel);
  return x;
}
function recKb_(u, r) {
  const id = r.id;
  const e = function (f) { return { text: '✏️ ' + t_(u, FIELDS[f].label), callback_data: 'e:' + id + ':' + f }; };
  return { inline_keyboard: [
    [e('n'), e('u'), e('p')],
    [e('d'), e('c')],
    [{ text: t_(u, 'newpass'), callback_data: 'rg:' + id + ':p' }, { text: t_(u, 'newuser'), callback_data: 'rg:' + id + ':u' }],
    [{ text: t_(u, 'del'), callback_data: 'd:' + id }, { text: t_(u, 'back'), callback_data: 'l:0:-1' }]
  ] };
}
function showRec_(u, rec, mid, prefix) {
  const text = card_(u, rec, prefix), kb = recKb_(u, rec);
  let id = mid;
  if (mid) {
    cancelDel_(u.chat, mid);
    edit_(u.chat, mid, text, kb);
  } else {
    const r = send_(u.chat, text, kb);
    id = r && r.ok ? r.result.message_id : null;
  }
  addDel_(u.chat, id, u.s.autodel);
}
function showList_(u, page, catIdx, mid) {
  if (mid) cancelDel_(u.chat, mid);
  let rs = recs_(u.chat).reverse();
  const cats = catsOf_(rs);
  let cat = null;
  if (catIdx >= 0 && cats[catIdx] !== undefined) { cat = cats[catIdx]; rs = rs.filter(function (r) { return r.cat === cat; }); }
  if (!rs.length) {
    return mid ? edit_(u.chat, mid, t_(u, 'empty')) : send_(u.chat, t_(u, 'empty'), mainKb_(u));
  }
  const pages = Math.max(1, Math.ceil(rs.length / PER_PAGE));
  page = clamp_(page, 0, pages - 1);
  const rows = rs.slice(page * PER_PAGE, (page + 1) * PER_PAGE).map(function (r) {
    return [{ text: '📌 ' + r.name + (r.cat && cat === null ? ' · ' + r.cat : ''), callback_data: 'v:' + r.id }];
  });
  const ci = cat === null ? -1 : catIdx;
  if (pages > 1) {
    const nav = [];
    if (page > 0) nav.push({ text: '⬅️', callback_data: 'l:' + (page - 1) + ':' + ci });
    nav.push({ text: (page + 1) + '/' + pages, callback_data: 'n' });
    if (page < pages - 1) nav.push({ text: '➡️', callback_data: 'l:' + (page + 1) + ':' + ci });
    rows.push(nav);
  }
  const bottom = [];
  if (cat !== null) bottom.push({ text: t_(u, 'all'), callback_data: 'l:0:-1' });
  bottom.push({ text: t_(u, 'cats'), callback_data: 'c' });
  rows.push(bottom);
  const text = cat === null ? t_(u, 'list_title', rs.length) : t_(u, 'list_cat', esc_(cat), rs.length);
  const kb = { inline_keyboard: rows };
  return mid ? edit_(u.chat, mid, text, kb) : send_(u.chat, text, kb);
}
function showCats_(u, mid) {
  cancelDel_(u.chat, mid);
  const rs = recs_(u.chat);
  const cats = catsOf_(rs);
  const rows = cats.slice(0, 30).map(function (c, i) {
    const n = rs.filter(function (r) { return r.cat === c; }).length;
    return [{ text: '📁 ' + c + ' (' + n + ')', callback_data: 'l:0:' + i }];
  });
  rows.push([{ text: t_(u, 'all'), callback_data: 'l:0:-1' }]);
  edit_(u.chat, mid, cats.length ? t_(u, 'pick_cat') : t_(u, 'no_cats'), { inline_keyboard: rows });
}

/* ============ SETTINGS ============ */
function settingsKb_(u) {
  const s = u.s;
  const on = function (v) { return v ? '✅ ' : '❌ '; };
  const lab = function (txt) { return { text: txt, callback_data: 'n' }; };
  return { inline_keyboard: [
    [{ text: '➖', callback_data: 'st:plen:-' }, lab(t_(u, 's_plen') + ': ' + s.plen), { text: '➕', callback_data: 'st:plen:+' }],
    [{ text: on(s.upper) + 'A-Z', callback_data: 'st:upper' }, { text: on(s.lower) + 'a-z', callback_data: 'st:lower' }],
    [{ text: on(s.digits) + '0-9', callback_data: 'st:digits' }, { text: on(s.symbols) + '!@#', callback_data: 'st:symbols' }],
    [{ text: on(s.noSimilar) + t_(u, 's_nosim'), callback_data: 'st:noSimilar' }],
    [{ text: '➖', callback_data: 'st:ulen:-' }, lab(t_(u, 's_ulen') + ': ' + s.ulen), { text: '➕', callback_data: 'st:ulen:+' }],
    [{ text: on(s.udigits) + t_(u, 's_udig'), callback_data: 'st:udigits' }, { text: on(s.uunder) + t_(u, 's_uund'), callback_data: 'st:uunder' }],
    [{ text: t_(u, 's_autodel') + ': ' + (s.autodel ? t_(u, 'min', s.autodel) : t_(u, 'off')), callback_data: 'st:autodel' }],
    [{ text: t_(u, 's_lang'), callback_data: 'st:lang' }]
  ] };
}
function showSettings_(u, mid) {
  return mid ? edit_(u.chat, mid, t_(u, 'settings'), settingsKb_(u)) : send_(u.chat, t_(u, 'settings'), settingsKb_(u));
}

/* ============ MESSAGE HANDLER ============ */
function onMessage_(m) {
  if (!m.chat || m.chat.type !== 'private' || typeof m.text !== 'string') return;
  const chat = m.chat.id, text = m.text.trim();
  const u = getUser_(chat);
  const cmd = text.split(/[\s@]/)[0].toLowerCase();
  const isBtn = function (k) { return text === T.fa[k] || text === T.en[k]; };

  if (!u.lang) { return send_(chat, T.fa.pick_lang, langKb_()); }
  if (cmd === '/start') { resetState_(u); saveUser_(u); return send_(chat, t_(u, 'welcome'), mainKb_(u)); }
  if (cmd === '/help') return send_(chat, t_(u, 'help'), mainKb_(u));
  if (cmd === '/cancel') { resetState_(u); saveUser_(u); return send_(chat, t_(u, 'cancelled'), mainKb_(u)); }
  if (cmd === '/gen' || isBtn('btn_gen')) { resetState_(u); return sendGen_(u); }
  if (cmd === '/list' || isBtn('btn_rec')) { resetState_(u); saveUser_(u); return showList_(u, 0, -1); }
  if (cmd === '/settings' || isBtn('btn_set')) { resetState_(u); saveUser_(u); return showSettings_(u); }
  if (u.state) return onState_(u, m, text);
  send_(chat, t_(u, 'use_menu'), mainKb_(u));
}

function onState_(u, m, text) {
  const chat = u.chat;
  if (!text) return;
  if (u.state === 'sv_name') {
    if (text.length > FIELDS.n.max) return send_(chat, t_(u, 'too_long'));
    u.temp.sv.name = text; u.state = 'sv_desc'; saveUser_(u);
    return send_(chat, t_(u, 'ask_desc'), skipKb_(u));
  }
  if (u.state === 'sv_desc') {
    if (text.length > FIELDS.d.max) return send_(chat, t_(u, 'too_long'));
    u.temp.sv.desc = text;
    return askCat_(u);
  }
  if (u.state === 'sv_cat') {
    if (text.length > FIELDS.c.max) return send_(chat, t_(u, 'too_long'));
    return finalize_(u, text);
  }
  if (u.state === 'edit') {
    const ed = u.temp.ed || {};
    const F = FIELDS[ed.f];
    const rec = F ? getRec_(chat, ed.id) : null;
    if (!rec) { resetState_(u); saveUser_(u); return send_(chat, t_(u, 'not_found'), mainKb_(u)); }
    let v = text;
    if (v === '-' && (ed.f === 'd' || ed.f === 'c')) v = '';
    if (v.length > F.max) return send_(chat, t_(u, 'too_long'));
    if (ed.f === 'p' || ed.f === 'u') tg_('deleteMessage', { chat_id: chat, message_id: m.message_id });
    updRec_(rec, F, v);
    rec[F.key] = v;
    resetState_(u); saveUser_(u);
    return showRec_(u, rec, null, t_(u, 'updated'));
  }
}

function askCat_(u) {
  u.state = 'sv_cat'; saveUser_(u);
  const cats = catsOf_(recs_(u.chat));
  const rows = cats.slice(0, 20).map(function (c, i) { return [{ text: '📁 ' + c, callback_data: 'sc:' + i }]; });
  rows.push([{ text: t_(u, 'skip'), callback_data: 'sk' }, { text: t_(u, 'cancel'), callback_data: 'cancel' }]);
  send_(u.chat, t_(u, 'ask_cat'), { inline_keyboard: rows });
}

function finalize_(u, cat) {
  const sv = u.temp.sv || {};
  const rec = { id: Utilities.getUuid().replace(/-/g, '').slice(0, 8), name: sv.name || '-',
    username: sv.u || '', password: sv.p || '', desc: sv.desc || '', cat: cat || '' };
  addRec_(u.chat, rec);
  u.temp = {}; u.state = ''; saveUser_(u);
  showRec_(u, rec, null, t_(u, 'saved'));
}

/* ============ CALLBACK HANDLER ============ */
function onCallback_(cq) {
  if (!cq.message) { tg_('answerCallbackQuery', { callback_query_id: cq.id }); return; }
  const chat = cq.message.chat.id, mid = cq.message.message_id;
  const d = String(cq.data || '').split(':');
  let alertText;
  try {
    const u = getUser_(chat);

    if (d[0] === 'lang') {
      u.lang = d[1] === 'en' ? 'en' : 'fa';
      saveUser_(u);
      tg_('deleteMessage', { chat_id: chat, message_id: mid });
      send_(chat, t_(u, 'welcome'), mainKb_(u));
      return;
    }
    if (!u.lang) { send_(chat, T.fa.pick_lang, langKb_()); return; }

    switch (d[0]) {
      case 'n': break;

      case 'g': {
        const g = newGen_(u, ['p', 'u', 'b'].indexOf(d[1]) >= 0 ? d[1] : 'b');
        edit_(chat, mid, genText_(u, g), genKb_(u, g.t));
        break;
      }
      case 'x':
        cancelDel_(chat, mid);
        tg_('deleteMessage', { chat_id: chat, message_id: mid });
        break;

      case 'sv': {
        const g = u.temp.gen;
        if (!g) break;
        u.temp.sv = { u: g.t === 'p' ? '' : g.u, p: g.t === 'u' ? '' : g.p, name: '', desc: '' };
        u.state = 'sv_name'; saveUser_(u);
        send_(chat, t_(u, 'ask_name'), cancelKb_(u));
        break;
      }
      case 'cancel':
        resetState_(u); saveUser_(u);
        edit_(chat, mid, t_(u, 'cancelled'));
        break;
      case 'sk':
        if (u.state === 'sv_desc') { u.temp.sv.desc = ''; clearKb_(chat, mid); askCat_(u); }
        else if (u.state === 'sv_cat') { clearKb_(chat, mid); finalize_(u, ''); }
        break;
      case 'sc':
        if (u.state === 'sv_cat') {
          const c = catsOf_(recs_(chat))[+d[1]] || '';
          clearKb_(chat, mid);
          finalize_(u, c);
        }
        break;

      case 'l':
        showList_(u, +d[1] || 0, d[2] === undefined ? -1 : +d[2], mid);
        break;
      case 'c':
        showCats_(u, mid);
        break;
      case 'v': {
        const rec = getRec_(chat, d[1]);
        if (!rec) { alertText = t_(u, 'not_found'); break; }
        showRec_(u, rec, mid);
        break;
      }
      case 'e': {
        const rec = getRec_(chat, d[1]);
        if (!rec || !FIELDS[d[2]]) { alertText = t_(u, 'not_found'); break; }
        u.state = 'edit'; u.temp.ed = { id: d[1], f: d[2] }; saveUser_(u);
        send_(chat, t_(u, 'ask_new', t_(u, FIELDS[d[2]].label)), cancelKb_(u));
        break;
      }
      case 'rg': {
        const rec = getRec_(chat, d[1]);
        const F = FIELDS[d[2]];
        if (!rec || !F) { alertText = t_(u, 'not_found'); break; }
        const v = d[2] === 'p' ? genPass_(u.s) : genUser_(u.s);
        updRec_(rec, F, v);
        rec[F.key] = v;
        showRec_(u, rec, mid);
        break;
      }
      case 'd': {
        const rec = getRec_(chat, d[1]);
        if (!rec) { alertText = t_(u, 'not_found'); break; }
        cancelDel_(chat, mid);
        edit_(chat, mid, t_(u, 'del_confirm', esc_(rec.name)), { inline_keyboard: [[
          { text: t_(u, 'yes'), callback_data: 'dy:' + rec.id },
          { text: t_(u, 'no'), callback_data: 'v:' + rec.id }]] });
        break;
      }
      case 'dy': {
        const rec = getRec_(chat, d[1]);
        if (rec) delRec_(rec);
        cancelDel_(chat, mid);
        edit_(chat, mid, t_(u, 'deleted'), { inline_keyboard: [[{ text: t_(u, 'back'), callback_data: 'l:0:-1' }]] });
        break;
      }

      case 'st': {
        const s = u.s, k = d[1];
        if (k === 'plen') s.plen = clamp_(s.plen + (d[2] === '+' ? 2 : -2), 8, 64);
        else if (k === 'ulen') s.ulen = clamp_(s.ulen + (d[2] === '+' ? 1 : -1), 4, 24);
        else if (k === 'autodel') { const o = [0, 1, 2, 5, 10]; s.autodel = o[(o.indexOf(s.autodel) + 1) % o.length]; }
        else if (k === 'lang') {
          u.lang = u.lang === 'fa' ? 'en' : 'fa';
          saveUser_(u);
          send_(chat, t_(u, 'lang_set'), mainKb_(u));
        }
        else if (['upper', 'lower', 'digits', 'symbols'].indexOf(k) >= 0) {
          s[k] = s[k] ? 0 : 1;
          if (!(s.upper || s.lower || s.digits || s.symbols)) { s[k] = 1; alertText = t_(u, 'need_one'); }
        }
        else if (['noSimilar', 'udigits', 'uunder'].indexOf(k) >= 0) s[k] = s[k] ? 0 : 1;
        saveUser_(u);
        showSettings_(u, mid);
        break;
      }
    }
  } finally {
    tg_('answerCallbackQuery', { callback_query_id: cq.id, text: alertText });
  }
}