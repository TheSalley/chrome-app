const STORAGE_KEY = "calendar_todo_tasks_v1";
const HOLIDAY_API = "https://cron.1919532973.workers.dev";
const HOLIDAY_CACHE_KEY = "calendar_holidays_v1";
const HOLIDAY_CACHE_TTL = 30 * 60 * 1000; // 30 分钟

const TASK_COLORS = ["#0071e3", "#34c759", "#ff9500", "#af52de", "#ff3b30", "#00b3a4", "#ffcc00", "#5e5ce6"];
let taskColorIndex = 0;

function readStoredTasks(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return {};
    const parsed = JSON.parse(raw);
    if(!parsed || typeof parsed !== "object" || Array.isArray(parsed)){
      throw new Error("任务数据格式不正确");
    }

    const clean = {};
    for(const [day, list] of Object.entries(parsed)){
      if(!Array.isArray(list)) continue;
      const valid = list.filter(task =>
        task && typeof task === "object" &&
        typeof task.text === "string" && task.text.trim() &&
        (!task.range || (Array.isArray(task.dates) && task.dates.length > 0))
      );
      if(valid.length) clean[day] = valid;
    }
    return clean;
  }catch(err){
    console.error("读取任务数据失败，已备份原始数据", err);
    let backedUp = false;
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw){
        localStorage.setItem(`${STORAGE_KEY}_backup_${Date.now()}`, raw);
        backedUp = true;
      }
    }catch(_){}
    // 备份成功后移除损坏数据，避免每次打开页面都重复生成备份、挤占存储空间
    if(backedUp){
      try{ localStorage.removeItem(STORAGE_KEY); }catch(_){}
    }
    return {};
  }
}

let tasks = readStoredTasks();
let viewDate = new Date();
let selectedDate = new Date();
let holidayData = [];

const $ = id => document.getElementById(id);
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function pad(n){ return String(n).padStart(2, "0"); }

function key(date){
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
}

function dateFromKey(k){
  return new Date(k + "T00:00:00");
}

function isWeekend(date){
  return date.getDay() === 0 || date.getDay() === 6;
}

function nextTaskColor(){
  const color = TASK_COLORS[taskColorIndex % TASK_COLORS.length];
  taskColorIndex++;
  return color;
}

/* 把颜色加深 30%，保证浅色背景下文字可读 */
function darkenColor(hex){
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (n >> 16 & 255) * .7 | 0);
  const g = Math.max(0, (n >> 8 & 255) * .7 | 0);
  const b = Math.max(0, (n & 255) * .7 | 0);
  return "#" + ((r << 16) + (g << 8) + b).toString(16).padStart(6, "0");
}

function save(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    setSaveStatus(true);
    return true;
  }catch(err){
    console.error("保存任务失败", err);
    setSaveStatus(false);
    return false;
  }
}

function setSaveStatus(ok){
  const el = $("saveStatus");
  if(!el) return;
  el.classList.toggle("save-error", !ok);
  if(ok){
    const now = new Date();
    el.innerHTML = `<i class="dot"></i>已保存 ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }else{
    el.innerHTML = '<i class="dot"></i>保存失败，请检查存储空间';
  }
}

function sameDay(a, b){
  return key(a) === key(b);
}

/* 获取某天显示的任务：单日任务直接命中，区间任务只要包含这天就显示 */
function getTasksForDay(k){
  const out = [];
  for(const storedKey in tasks){
    (tasks[storedKey] || []).forEach(t => {
      if(t.range ? t.dates.includes(k) : storedKey === k) out.push(t);
    });
  }
  return out;
}

function workdayCount(dates){
  return dates.filter(d => !isWeekend(dateFromKey(d))).length;
}

function rangeShort(range){
  const a = range[0].split("-"), b = range[range.length-1].split("-");
  return `${a[1]}/${a[2]} - ${b[1]}/${b[2]}`;
}

function renderCalendar(){
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  $("monthTitle").textContent = `${year}年 ${month + 1}月`;

  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  const container = $("days");
  container.innerHTML = "";

  for(let i = 0; i < 42; i++){
    let dateNum = i - startDay + 1;
    let cellDate;

    if(dateNum <= 0){
      cellDate = new Date(year, month - 1, prevDays + dateNum);
    }else if(dateNum > daysInMonth){
      cellDate = new Date(year, month + 1, dateNum - daysInMonth);
    }else{
      cellDate = new Date(year, month, dateNum);
    }

    const cell = document.createElement("div");
    cell.className = "day";

    if(cellDate.getMonth() !== month) cell.classList.add("other");
    if(sameDay(cellDate, new Date())) cell.classList.add("today");
    if(sameDay(cellDate, selectedDate)) cell.classList.add("selected");

    const date = document.createElement("div");
    date.className = "date";
    date.textContent = cellDate.getDate();
    cell.appendChild(date);

    const list = getTasksForDay(key(cellDate));
    const preview = document.createElement("div");
    preview.className = "task-dots";

    list.slice(0, 3).forEach(task => {
      const item = document.createElement("div");
      item.className = "task-preview" + (task.done ? " done" : "") + (task.range ? " range" : "");
      if(task.color){
        item.style.borderLeftColor = task.color;
        item.style.color = darkenColor(task.color);
        item.style.background = task.color + "1f";
      }
      item.textContent = task.text;
      preview.appendChild(item);
    });

    if(list.length > 3){
      const more = document.createElement("div");
      more.className = "more";
      more.textContent = `+${list.length - 3} 个任务`;
      preview.appendChild(more);
    }

    cell.appendChild(preview);

    cell.addEventListener("click", () => {
      selectedDate = new Date(cellDate);
      viewDate = new Date(cellDate);
      renderCalendar();
      renderTasks();
    });

    container.appendChild(cell);
  }
}

function renderTasks(){
  const k = key(selectedDate);

  $("selectedDate").textContent =
    `${selectedDate.getFullYear()}年${selectedDate.getMonth()+1}月${selectedDate.getDate()}日 星期${WEEKDAYS[selectedDate.getDay()]}`;

  const rows = [];
  for(const storedKey in tasks){
    (tasks[storedKey] || []).forEach(task => {
      if(task.range ? task.dates.includes(k) : storedKey === k) rows.push({ storedKey, task });
    });
  }

  const container = $("tasks");
  container.innerHTML = "";

  if(!rows.length){
    container.innerHTML = '<div class="empty"><span class="empty-icon">🗓</span>这一天还没有任务</div>';
    return;
  }

  rows.forEach(({ storedKey, task }) => {
    const row = document.createElement("div");
    row.className = "task" + (task.done ? " done" : "");
    if(task.color){
      row.style.borderLeftColor = task.color;
      row.style.background = task.color + "0d";
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.title = task.range ? "勾选后整个区间任务一起完成" : "标记完成";
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      save();
      renderCalendar();
      renderTasks();
    });

    const main = document.createElement("div");
    main.className = "task-main";

    const text = document.createElement("div");
    text.className = "task-text";
    text.textContent = task.text;
    if(task.color) text.style.color = darkenColor(task.color);

    main.appendChild(text);

    if(task.range){
      const meta = document.createElement("div");
      meta.className = "task-meta";
      if(task.color) meta.style.color = darkenColor(task.color);
      const wd = workdayCount(task.dates);
      meta.textContent = `区间 · ${rangeShort(task.dates)} · 共${task.dates.length}天 工作日${wd}天`;
      main.appendChild(meta);
    }

    if(task.note){
      const notePreview = document.createElement("div");
      notePreview.className = "task-note-preview";
      notePreview.innerHTML = '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>';
      const noteText = document.createElement("span");
      noteText.textContent = task.note;
      notePreview.appendChild(noteText);
      main.appendChild(notePreview);
    }

    const noteBtn = document.createElement("button");
    noteBtn.className = "note-btn";
    noteBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>';
    noteBtn.title = task.note ? "编辑备注" : "添加备注";
    if(task.note) noteBtn.classList.add("has-note");
    noteBtn.addEventListener("click", () => {
      toggleNoteEditor(row, task);
    });

    const del = document.createElement("button");
    del.className = "delete";
    del.innerHTML = "×";
    del.title = "删除任务";
    del.addEventListener("click", () => {
      tasks[storedKey].splice(tasks[storedKey].indexOf(task), 1);
      if(!tasks[storedKey].length) delete tasks[storedKey];
      save();
      renderCalendar();
      renderTasks();
    });

    row.append(checkbox, main, noteBtn, del);
    container.appendChild(row);
  });
}

function toggleNoteEditor(row, task){
  const existing = row.querySelector(".task-note-editor");
  if(existing){
    row.classList.remove("editing");
    existing.remove();
    return;
  }

  row.classList.add("editing");
  const editor = document.createElement("div");
  editor.className = "task-note-editor";

  const ta = document.createElement("textarea");
  ta.value = task.note || "";
  ta.placeholder = "写下备注...";
  ta.maxLength = 500;

  const actions = document.createElement("div");
  actions.className = "task-note-actions";

  const cancelBtn = document.createElement("button");
  cancelBtn.className = "note-plain";
  cancelBtn.textContent = "取消";
  cancelBtn.addEventListener("click", () => {
    row.classList.remove("editing");
    editor.remove();
  });

  const saveBtn = document.createElement("button");
  saveBtn.className = "note-save";
  saveBtn.textContent = "保存";
  saveBtn.addEventListener("click", () => {
    const v = ta.value.trim();
    if(v) task.note = v; else delete task.note;
    save();
    renderCalendar();
    renderTasks();
  });

  actions.append(saveBtn);

  if(task.note){
    const delNoteBtn = document.createElement("button");
    delNoteBtn.className = "note-plain note-del";
    delNoteBtn.textContent = "删除备注";
    delNoteBtn.addEventListener("click", () => {
      delete task.note;
      save();
      renderCalendar();
      renderTasks();
    });
    actions.appendChild(delNoteBtn);
  }

  actions.appendChild(cancelBtn);
  editor.append(ta, actions);
  row.appendChild(editor);
  ta.focus();
}

function addTask(){
  const input = $("taskInput");
  const text = input.value.trim();
  if(!text) return;

  const k = key(selectedDate);
  if(!tasks[k]) tasks[k] = [];

  tasks[k].push({
    id: Date.now(),
    text,
    done: false,
    color: nextTaskColor()
  });

  save();
  input.value = "";
  renderCalendar();
  renderTasks();
  input.focus();
}

/* ---------- 区间任务 ---------- */

const rangePanel = $("rangePanel");
const rangeStart = $("rangeStart");
const rangeEnd = $("rangeEnd");
const rangeHint = $("rangeHint");

function setRangeDefaults(){
  rangeStart.value = key(selectedDate);
  const end = dateFromKey(key(selectedDate));
  end.setDate(end.getDate() + 6);
  rangeEnd.value = key(end);
  updateRangeHint();
}

function updateRangeHint(){
  const s = rangeStart.value, e = rangeEnd.value;
  rangeHint.classList.remove("error");
  if(!s || !e){ rangeHint.textContent = ""; return; }
  if(e < s){ rangeHint.textContent = "结束日期不能早于开始日期"; rangeHint.classList.add("error"); return; }

  const workdaysOnly = $("workdaysOnly").checked;
  let total = 0, wd = 0, skip = 0;
  const cur = dateFromKey(s);
  const end = dateFromKey(e);
  while(cur <= end){
    total++;
    if(workdaysOnly && isWeekend(cur)) skip++;
    else wd++;
    cur.setDate(cur.getDate() + 1);
  }
  rangeHint.textContent = `将添加 ${total} 天：工作日 ${wd} 天` + (skip ? `，跳过周末 ${skip} 天` : "");
}

function addRangeTask(){
  const s = rangeStart.value;
  const e = rangeEnd.value;
  rangeHint.classList.remove("error");

  const text = $("taskInput").value.trim();
  if(!text){ rangeHint.textContent = "请先在上方输入任务内容"; rangeHint.classList.add("error"); return; }
  if(!s || !e){ rangeHint.textContent = "请选择开始和结束日期"; rangeHint.classList.add("error"); return; }
  if(e < s){ rangeHint.textContent = "结束日期不能早于开始日期"; rangeHint.classList.add("error"); return; }

  const workdaysOnly = $("workdaysOnly").checked;
  const dates = [];
  let weekendSkip = 0;
  const cur = dateFromKey(s);
  const end = dateFromKey(e);

  while(cur <= end){
    const k = key(cur);
    if(workdaysOnly && isWeekend(cur)) weekendSkip++;
    else dates.push(k);
    cur.setDate(cur.getDate() + 1);
  }

  if(!dates.length){
    rangeHint.textContent = "这个区间里没有工作日，取消“仅工作日”试试";
    rangeHint.classList.add("error");
    return;
  }

  if(!tasks[s]) tasks[s] = [];
  tasks[s].push({
    id: Date.now(),
    text,
    done: false,
    range: true,
    dates,
    weekendSkip,
    color: nextTaskColor()
  });

  save();
  $("taskInput").value = "";
  rangePanel.hidden = true;
  $("rangeToggle").classList.remove("toggled");
  rangeHint.textContent = "";
  renderCalendar();
  renderTasks();
}

/* ---------- 节日倒计时 ---------- */

function holidayColor(name){
  const palette = ["#ff3b30", "#ff9500", "#ffcc00", "#34c759", "#0071e3", "#af52de", "#ff375f", "#5e5ce6"];
  let sum = 0;
  for(const ch of String(name || "")) sum += ch.codePointAt(0);
  return palette[sum % palette.length];
}

function formatHolidayDate(dateStr){
  if(!dateStr) return "";
  const parts = String(dateStr).split("-");
  if(parts.length !== 3) return dateStr;
  return `${parts[0]}年${parseInt(parts[1], 10)}月${parseInt(parts[2], 10)}日`;
}

function renderHolidays(){
  const listEl = $("holidayList");

  if(!holidayData.length){
    listEl.innerHTML = '<div class="holiday-loading">暂无节日数据</div>';
    return;
  }

  listEl.innerHTML = "";
  const todayKey = key(new Date());

  holidayData.slice(0, 20).forEach(h => {
    const item = document.createElement("div");
    item.className = "holiday-item";

    const dot = document.createElement("div");
    dot.className = "holiday-dot";
    dot.style.background = holidayColor(h.name);

    const body = document.createElement("div");
    body.className = "holiday-body";

    const name = document.createElement("div");
    name.className = "holiday-name";
    name.textContent = h.name || "节日";

    const date = document.createElement("div");
    date.className = "holiday-date";
    date.textContent = formatHolidayDate(h.date);

    body.append(name, date);

    const days = document.createElement("div");
    days.className = "holiday-days";
    if(h.date === todayKey) days.classList.add("today");
    days.textContent = h.days || "";

    item.append(dot, body, days);
    listEl.appendChild(item);
  });
}

function readHolidayCache(){
  try{
    const cached = JSON.parse(localStorage.getItem(HOLIDAY_CACHE_KEY));
    if(cached && Array.isArray(cached.data) && cached.data.length) return cached;
  }catch(_){}
  return null;
}

async function loadHolidays(force = false){
  const listEl = $("holidayList");
  const retryEl = $("holidayRetry");
  const cacheTag = $("holidayCacheTag");

  if(!force){
    const cached = readHolidayCache();
    if(cached && Date.now() - cached.ts < HOLIDAY_CACHE_TTL){
      holidayData = cached.data;
      renderHolidays();
      cacheTag.textContent = "缓存";
      return;
    }
  }

  listEl.innerHTML = '<div class="holiday-loading"><div class="spinner"></div>正在获取节日...</div>';
  retryEl.style.display = "none";
  cacheTag.textContent = "";

  let timeoutId = null;
  try{
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(HOLIDAY_API + "/", { method: "GET", signal: controller.signal });
    if(!res.ok) throw new Error("HTTP " + res.status);
    const json = await res.json();
    if(!json || json.success === false || !Array.isArray(json.data)) throw new Error("bad payload");

    holidayData = json.data;
    try{
      localStorage.setItem(HOLIDAY_CACHE_KEY, JSON.stringify({ ts: Date.now(), data: holidayData }));
    }catch(_){}

    renderHolidays();
    cacheTag.textContent = "刚刚更新";
  }catch(err){
    console.error("Holiday fetch failed:", err);
    const cached = readHolidayCache();
    if(cached){
      holidayData = cached.data;
      renderHolidays();
      cacheTag.textContent = "网络异常 · 显示缓存";
      retryEl.style.display = "";
    }else{
      listEl.innerHTML = '<div class="holiday-error"><span>😢 节日数据加载失败</span><span>请检查网络后重试</span></div>';
      retryEl.style.display = "";
    }
  }finally{
    if(timeoutId) clearTimeout(timeoutId);
  }
}

/* ---------- 初始化 ---------- */

function updateHeaderSub(){
  const now = new Date();
  $("todaySub").textContent =
    `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日 星期${WEEKDAYS[now.getDay()]} · 今天也要好好生活`;
}

$("addBtn").addEventListener("click", addTask);

$("taskInput").addEventListener("keydown", e => {
  if(e.key === "Enter") addTask();
});

$("prevBtn").addEventListener("click", () => {
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
  renderCalendar();
});

$("nextBtn").addEventListener("click", () => {
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
  renderCalendar();
});

$("todayBtn").addEventListener("click", () => {
  selectedDate = new Date();
  viewDate = new Date();
  renderCalendar();
  renderTasks();
});

$("holidayRetry").addEventListener("click", () => loadHolidays(true));

$("rangeToggle").addEventListener("click", () => {
  const open = rangePanel.hidden;
  rangePanel.hidden = !open;
  $("rangeToggle").classList.toggle("toggled", open);
  if(open){
    setRangeDefaults();
    rangeStart.focus();
  }
});

$("workdaysOnly").addEventListener("change", updateRangeHint);
rangeStart.addEventListener("change", updateRangeHint);
rangeEnd.addEventListener("change", updateRangeHint);
$("rangeAddBtn").addEventListener("click", addRangeTask);

updateHeaderSub();
renderCalendar();
renderTasks();
loadHolidays();
