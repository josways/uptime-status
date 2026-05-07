import { Tooltip } from 'react-tooltip';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GetMonitors } from '../common/uptimerobot';
import { formatDuration, formatNumber } from '../common/helper';
import Link from './link';

const statusText = {
  ok: '正常',
  down: '无法访问',
  unknown: '未知'
};

function UptimeRobot({ apikey, days }) {

  const [monitors, setMonitors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const config = window.Config;
  const requestIdRef = useRef(0);

  const fetchData = useCallback(() => {
    if (!config) return;
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    GetMonitors(apikey, days)
      .then((data) => {
        if (requestId !== requestIdRef.current) return;
        setMonitors(data);
        setLastUpdate(new Date());
        setLoading(false);
      })
      .catch((err) => {
        if (requestId !== requestIdRef.current) return;
        setError(err?.message || String(err));
        setLoading(false);
      });
  }, [apikey, config, days]);

  const intervalRef = useRef(null);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(intervalRef.current);
  }, [fetchData]);

  if (!config) return null;

  if (error && !monitors) return (
    <div className='site'>
      <div className='error'>
        <p>加载失败：{error}</p>
        <button onClick={fetchData}>重试</button>
      </div>
    </div>
  );
  if (!monitors) return (
    <div className='site'>
      <div className='loading' />
    </div>
  );

  return (
    <div className={'monitor-wrapper' + (loading ? ' is-loading' : '')}>
      {loading && (
        <div className='loading-overlay'>
          <div className='loading-spinner' />
        </div>
      )}
      {lastUpdate && (
        <div className='last-update'>
          最后更新：{lastUpdate.toLocaleTimeString()}
        </div>
      )}
      {monitors.map((site) => (
        <div key={site.id} className='site'>
          <div className='meta'>
            <span className='name'>{site.name}</span>
            {config.ShowLink && <Link className='link' to={site.url} text={site.name} />}
            <span className={'status ' + site.status}>{statusText[site.status]}</span>
          </div>
          <div className='timeline'>
{site.daily.map((data, index) => {
              let barStatus = '';
              let text = data.date.format('YYYY-MM-DD ');
              if (data.uptime >= 100) {
                barStatus = 'ok';
                text += '可用率 ' + formatNumber(data.uptime) + '%';
              }
              else if (data.uptime <= 0 && data.down.times === 0) {
                barStatus = 'none';
                text += '无数据';
              }
              else {
                barStatus = 'down';
                text += '故障 ' + data.down.times + ' 次，累计 ' + formatDuration(data.down.duration) + '，可用率 ' + formatNumber(data.uptime) + '%';
              }
              return (<i key={index} className={barStatus} data-tooltip-id={'tooltip-' + site.id + '-' + index} data-tooltip-content={text} />)
            })}
          </div>
          <div className='summary'>
            <span>今天</span>
            <span>
              {site.total.times
                ? '最近 ' + days + ' 天故障 ' + site.total.times + ' 次，累计 ' + formatDuration(site.total.duration) + '，平均可用率 ' + site.average + '%'
                : '最近 ' + days + ' 天可用率 ' + site.average + '%'}
            </span>
            <span>{site.daily[site.daily.length - 1].date.format('YYYY-MM-DD')}</span>
          </div>
        </div>
      ))}
      <Tooltip id='site-tooltip' className='tooltip' place='top' variant='dark' anchorSelect='[data-tooltip-id^="tooltip-"]' />
    </div>
  );
}

export default UptimeRobot;
