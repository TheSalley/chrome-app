export function sleep(t) {
  return new Promise((resolve) => {
    setTimeout(resolve, t);
  });
}

export async function date_mode(date) {
  while (
    !(
      document.querySelector("[role='tfoot']").children[0].textContent ==
        "没有更多了" ||
      document
        .querySelector(".load-tips")
        .innerHTML.includes("出于平台安全性及稳定性考虑")
    )
  ) {
    await sleep(500);
    document
      .querySelector(".user-list")
      .scrollBy(
        0,
        document.querySelector(".geek-item-wrap").clientHeight * 300
      );
  }

  let chat_box =  Object.keys(sessionStorage).find((item) => item.includes("boss-chat-draft"));
  let record = {};
  let msg = "123"

  document
    .querySelectorAll("[role=group] .geek-item")
    .forEach((item, index) => {
      let key = item.getAttribute("data-id");
      if (
        document.querySelector(`[data-id='${key}'] .title .time`).innerText ==
        "06月01日"
      ) {
        record[key] = msg
      }
    });
    sessionStorage.setItem(chat_box, JSON.stringify(record))
  
}
