import axios from 'axios';
import dayjs from 'dayjs';
import { formatNumber } from './helper';

export async function GetMonitors(apikey, days) {

  const dates = [];
  const today = dayjs(new Date().setHours(0, 0, 0, 0));
  for (let d = 0; d < days; d++) {
    dates.push(today.subtract(d, 'day'));
  }

  const ranges = dates.map((date) => `${date.unix()}_${date.add(1, 'day').unix()}`);
  const start = dates[dates.length - 1].unix();
  const end = dates[0].add(1, 'day').unix();
  ranges.push(`${start}_${end}`);

  const postdata = {
    api_key: apikey,
    format: 'json',
    logs: 1,
    log_types: '1',
    logs_start_date: start,
    logs_end_date: end,
    custom_uptime_ranges: ranges.join('-'),
  };

  const response = await axios.post('https://api.uptimerobot.com/v2/getMonitors', postdata, { timeout: 10000 });
  if (response.data.stat !== 'ok') throw response.data.error;
  return response.data.monitors.map((monitor) => {

    const uptimeRanges = monitor.custom_uptime_ranges.split('-');
    const average = formatNumber(uptimeRanges.pop());
    const daily = [];
    const dateMap = {};
    dates.forEach((date, index) => {
      const key = date.format('YYYYMMDD');
      dateMap[key] = index;
      daily[index] = {
        date: date,
        uptime: formatNumber(uptimeRanges[index]),
        down: { times: 0, duration: 0 },
      }
    });

    const total = monitor.logs.reduce((total, log) => {
      if (log.type === 1) {
        const date = dayjs.unix(log.datetime).format('YYYYMMDD');
        total.duration += log.duration;
        total.times += 1;
        const idx = dateMap[date];
        if (idx !== undefined) {
          daily[idx].down.duration += log.duration;
          daily[idx].down.times += 1;
        }
      }
      return total;
    }, { times: 0, duration: 0 });

    const result = {
      id: monitor.id,
      name: monitor.friendly_name,
      url: monitor.url,
      average: average,
      daily: daily,
      total: total,
      status: 'unknown',
    };

    if (monitor.status === 2) result.status = 'ok';
    if (monitor.status === 9) result.status = 'down';
    return result;
  });
}