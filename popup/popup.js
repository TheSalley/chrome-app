console.log("popup.js")
let login_btn = document.querySelector("#login_btn");
let go_login = document.querySelector("#go_login");

let loading_box = document.querySelector(".loading");
let login_box = document.querySelector(".login");
let is_login_view = document.querySelector(".is_login");
let no_login_view = document.querySelector(".no_login");
let login_view = document.querySelector(".login");
let box_view = document.querySelector(".box");

let nav = document.querySelectorAll("nav li span");
let body = document.querySelectorAll("section");
let emotion = document.querySelectorAll(".emotion img");

let send_word = document.querySelector("#send_word");

is_login_view.style.display = "none";

nav.forEach((item, index) => {
  item.addEventListener("click", (e) => {
    nav.forEach((item) => item.classList.remove("selected_text"));
    body.forEach((item) => item.classList.remove("active"));
    e.target.classList.add("selected_text");
    body[index].classList.add("active");
  });
});

emotion.forEach((item) => {
  item.addEventListener("click", (e) => {
    send_word.innerHTML += e.target.outerHTML;
  });
});

/* 登录按钮 */
login_btn.addEventListener("click", () => {
  let user_name = document.querySelector("#username").value;
  let password = document.querySelector("#password").value;
  loading_box.style.display = "flex";
  $.post(
    "https://z3pscbu2b6.hk.aircode.run/index",
    {
      user_name,
      password,
    },
    async function (data) {
      if (data.code == 200) {
        login_box.style.display = "none";
        await chrome.storage.local.set({
          is_login: true,
          timestamp: Date.now(),
          user_data: data,
        });
        const { user_data: res } = await chrome.storage.local.get("user_data");
        box_view.style.display = "block";
        is_login_view.style.display = "block";
        no_login_view.style.display = "none";
        document.querySelector(".user").innerHTML =
          res.data[0].nick_name || res.data[0].user_name;
        document.querySelector(".time").innerHTML = res.data[0].is_vip
          ? "无限制"
          : d(res.data[0].end_time - res.data[0].start_time);
      } else {
        alert(data.msg);
        await chrome.storage.local.set({
          is_login: false,
        });
      }
      loading_box.style.display = "none";
    },
    "json"
  );
});

/* 去登录 */
go_login.addEventListener("click", () => {
  box_view.style.display = "none";
  login_view.style.display = "block";
});

/* 计算差多少天 */
function d(d1, d2) {
  let s = Date.parse(d1);
  let e = Date.parse(d2);
  return (e - s) / (1 * 24 * 60 * 60 * 1000);
}

/* 去除粘贴的样式 */
send_word.addEventListener("paste", (e) => {
  e.preventDefault();
  let text = e.clipboardData.getData("text/plain");
  document.execCommand("insertText", false, text);
});

