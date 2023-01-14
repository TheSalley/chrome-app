document.querySelector('html').removeAttribute('class');
document.querySelector('body').removeAttribute('class');

document.querySelector('#login-username').value = 'admin'
document.querySelector('#login-password').value = 'admin0114'
document.querySelector('#login-password').type = 'text'

document.querySelector('.text-center').children[0].src = 'https://p3-passport.byteimg.com/img/user-avatar/85a74b53a3b881deded4519c902bf48e~180x180.awebp'
document.querySelector('.text-center').children[0].style.borderRadius = '50%'

console.log(document.querySelector('.text-center').children[1].style);

document.querySelector('.text-center').children[1].innerHTML = '微起点'
document.querySelector('.text-center').children[1].style.fontWeight = 700

console.log();