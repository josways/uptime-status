import axios from 'axios';
import dayjs from 'dayjs';
import { formatNumber } from './helper';

const UPTIME_ROBOT_API_URL = 'https://api.uptimerobot.com/v2/getMonitors';
const STATUS_MAP = {
  2: 'ok',
  9: 'down',
};

export async function getMonitors(apikey, days, signal) {
  const today = dayjs().startOf('day');
  const dates = Array.from({ length: days }, (_, index) => today.subtract(index, 'day'));

  const ranges = dates.map((date) => `${date.unix()}_${date.add(1, 'day').unix()}`);
  const start = dates[dates.length - 1].unix();
  const end = dates[0].add(1, 'day').unix();
  ranges.push(`${start}_${end}`);

  const requestBody = {
    api_key: apikey,
    format: 'json',
    logs: 1,
    log_types: '1',
    logs_start_date: start,
    logs_end_date: end,
    custom_uptime_ranges: ranges.join('-'),
  };

  const response = await axios.post(UPTIME_ROBOT_API_URL, requestBody, {
    timeout: 10000,
    signal,
  });

  if (response.data.stat !== 'ok') throw response.data.error;

  return response.data.monitors.map((monitor) => {
    const uptimeRanges = monitor.custom_uptime_ranges.split('-');
    const average = formatNumber(uptimeRanges.pop());
    const daily = [];
    const dateMap = {};

    dates.forEach((date, index) => {
      dateMap[date.format('YYYYMMDD')] = index;
      daily[index] = {
        date,
        uptime: formatNumber(uptimeRanges[index]),
        down: { times: 0, duration: 0 },
      };
    });

    const total = (monitor.logs || []).reduce((total, log) => {
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

    return {
      id: monitor.id,
      name: monitor.friendly_name,
      url: monitor.url,
      average,
      daily,
      total,
      status: STATUS_MAP[monitor.status] || 'unknown',
    };
  });
}
