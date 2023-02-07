var lists = Array.from(document.querySelectorAll(".list-sub__title"));

var arr = ["变量", "空值合并运算符 '??'"];

lists.forEach((item, index) => {
  arr.forEach((i) => {
    item.children[0].textContent === i
      ? (item.children[0].style.textDecoration = "line-through") &&
        (item.children[0].style.color = "red")
      : "";
  });
});
