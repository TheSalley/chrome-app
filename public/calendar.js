const STORAGE_KEY = "calendar_todo_tasks_v1";
const HOLIDAY_API = "https://cron.1919532973.workers.dev";
const HOLIDAY_CACHE_KEY = "calendar_holidays_v1";
const HOLIDAY_CACHE_TTL = 30 * 60 * 1000; // 30 分钟

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
let viewDate = new Date();
let selectedDate = new Date();
let holidayData = [];

const $ = id => document.getElementById(id);
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function pad(n){ return String(n).padStart(2, "0"); }

function key(date){
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
}

function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function sameDay(a, b){
  return key(a) === key(b);
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

    const list = tasks[key(cellDate)] || [];
    const preview = document.createElement("div");
    preview.className = "task-dots";

    list.slice(0, 3).forEach(task => {
      const item = document.createElement("div");
      item.className = "task-preview" + (task.done ? " done" : "");
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
  const list = tasks[k] || [];

  $("selectedDate").textContent =
    `${selectedDate.getFullYear()}年${selectedDate.getMonth()+1}月${selectedDate.getDate()}日 星期${WEEKDAYS[selectedDate.getDay()]}`;

  const container = $("tasks");
  container.innerHTML = "";

  if(!list.length){
    container.innerHTML = '<div class="empty"><span class="empty-icon">🗓</span>这一天还没有任务</div>';
    return;
  }

  list.forEach((task, index) => {
    const row = document.createElement("div");
    row.className = "task" + (task.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => {
      tasks[k][index].done = checkbox.checked;
      save();
      renderCalendar();
      renderTasks();
    });

    const text = document.createElement("div");
    text.className = "task-text";
    text.textContent = task.text;

    const del = document.createElement("button");
    del.className = "delete";
    del.innerHTML = "×";
    del.title = "删除任务";
    del.addEventListener("click", () => {
      tasks[k].splice(index, 1);
      if(!tasks[k].length) delete tasks[k];
      save();
      renderCalendar();
      renderTasks();
    });

    row.append(checkbox, text, del);
    container.appendChild(row);
  });
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
    done: false
  });

  save();
  input.value = "";
  renderCalendar();
  renderTasks();
  input.focus();
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

async function loadHolidays(force = false){
  const listEl = $("holidayList");
  const retryEl = $("holidayRetry");
  const cacheTag = $("holidayCacheTag");

  if(!force){
    try{
      const cached = JSON.parse(localStorage.getItem(HOLIDAY_CACHE_KEY));
      if(cached && cached.data && Date.now() - cached.ts < HOLIDAY_CACHE_TTL){
        holidayData = cached.data;
        renderHolidays();
        cacheTag.textContent = "缓存";
        return;
      }
    }catch(_){}
  }

  listEl.innerHTML = '<div class="holiday-loading"><div class="spinner"></div>正在获取节日...</div>';
  retryEl.style.display = "none";
  cacheTag.textContent = "";

  try{
    const res = await fetch(HOLIDAY_API + "/", { method: "GET" });
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
    listEl.innerHTML = '<div class="holiday-error"><span>😢 节日数据加载失败</span><span>请检查网络后重试</span></div>';
    retryEl.style.display = "";
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

updateHeaderSub();
renderCalendar();
renderTasks();
loadHolidays();