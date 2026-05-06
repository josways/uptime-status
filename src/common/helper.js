export function formatNumber(value) {
  return (Math.floor(value * 100) / 100).toString();
}

export function formatDuration(seconds) {
  let s = Math.floor(seconds);
  let m = 0;
  let h = 0;
  if (s >= 60) {
    m = Math.floor(s / 60);
    s = Math.floor(s % 60);
    if (m >= 60) {
      h = Math.floor(m / 60);
      m = Math.floor(m % 60);
    }
  }
  if (h >= 24) {
    const d = Math.floor(h / 24);
    h = Math.floor(h % 24);
    return `${d} 天 ${h} 小时 ${m} 分 ${s} 秒`;
  }
  let text = `${s} 秒`;
  if (m > 0) text = `${m} 分 ${text}`;
  if (h > 0) text = `${h} 小时 ${text}`;
  return text;
}