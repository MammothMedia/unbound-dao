export function commaSeparateNumber(num) {
  if (num < 1000) {
    return num.toString();
  }
  var parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

export function debounce(func, wait = 220) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

export function getWindowWidth() {
  return document.documentElement.clientWidth;
}

export function addClass(name, elem) {
  let { className } = elem;
  className = className
    .split(' ')
    .filter(Boolean)
    .filter((val) => val !== name)
    .join(' ');
  elem.className = `${className} ${name}`;
}

export function removeClass(name, elem) {
  let { className } = elem;
  className = className
    .split(' ')
    .filter(Boolean)
    .filter((val) => val !== name)
    .join(' ');
  elem.className = className;
}
