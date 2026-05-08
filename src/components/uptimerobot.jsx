import { Tooltip } from 'react-tooltip';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getMonitors } from '../common/uptimerobot';
import { formatDuration, formatNumber } from '../common/helper';
import { getConfig } from '../common/config';
import Link from './link';

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

const statusText = {
  ok: '正常',
  down: '无法访问',
  unknown: '未知'
};

function getBarStatus(data) {
  if (data.uptime >= 100) return 'ok';
  if (data.uptime <= 0 && data.down.times === 0) return 'none';
  return 'down';
}

function getTooltipText(data) {
  const prefix = `${data.date.format('YYYY-MM-DD')} `;

  if (data.uptime >= 100) {
    return `${prefix}可用率 ${formatNumber(data.uptime)}%`;
  }

  if (data.uptime <= 0 && data.down.times === 0) {
    return `${prefix}无数据`;
  }

  return `${prefix}故障 ${data.down.times} 次，累计 ${formatDuration(data.down.duration)}，可用率 ${formatNumber(data.uptime)}%`;
}

function useUptimeMonitors(apikey, days) {
  const [monitors, setMonitors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const controllerRef = useRef(null);

  const fetchData = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const data = await getMonitors(apikey, days, controller.signal);
      if (controller.signal.aborted) return;
      setMonitors(data);
      setLastUpdate(new Date());
    } catch (err) {
      if (controller.signal.aborted || err?.code === 'ERR_CANCELED') return;
      setError(err?.message || String(err));
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [apikey, days]);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, REFRESH_INTERVAL_MS);

    return () => {
      controllerRef.current?.abort();
      clearInterval(intervalId);
    };
  }, [fetchData]);

  return { error, fetchData, lastUpdate, loading, monitors };
}

function MonitorTimeline({ daily }) {
  return (
    <div className='timeline'>
      {daily.map((data, index) => {
        const tooltipText = getTooltipText(data);

        return (
          <i
            key={index}
            className={getBarStatus(data)}
            data-tooltip-id='site-tooltip'
            data-tooltip-content={tooltipText}
            aria-label={tooltipText}
          />
        );
      })}
    </div>
  );
}

function MonitorSite({ days, showLink, site }) {
  return (
    <div className='site'>
      <div className='meta'>
        {showLink
          ? (
            <Link
              className='name name-link'
              to={site.url}
              dangerouslySetInnerHTML={{ __html: site.name }}
            />
          )
          : <span className='name' dangerouslySetInnerHTML={{ __html: site.name }} />
        }
        <span className={'status ' + site.status}>{statusText[site.status] ?? statusText.unknown}</span>
      </div>
      <MonitorTimeline daily={site.daily} />
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
  );
}

function UptimeRobot({ apikey, days }) {
  const config = getConfig();
  const { error, fetchData, lastUpdate, loading, monitors } = useUptimeMonitors(apikey, days);
  const lastUpdateText = lastUpdate?.toLocaleTimeString('zh-CN', { hour12: false }) ?? '';

  if (!config) return null;

  if (error && !monitors) {
    return (
      <div className='site'>
        <div className='error'>
          <p>加载失败：{error}</p>
          <button type='button' onClick={fetchData}>重试</button>
        </div>
      </div>
    );
  }

  if (!monitors) {
    return (
      <div className='site'>
        <div className='loading' />
      </div>
    );
  }

  return (
    <div className={'monitor-wrapper' + (loading ? ' is-loading' : '')}>
      {loading && (
        <div className='loading-overlay'>
          <div className='loading-spinner' />
        </div>
      )}
      {lastUpdate && (
        <div className='last-update'>
          <time dateTime={lastUpdate.toISOString()}>最后更新：{lastUpdateText}</time>
        </div>
      )}
      {error && <p className='refresh-error'>自动刷新失败：{error}</p>}
      {monitors.map((site) => (
        <MonitorSite
          key={site.id}
          days={days}
          showLink={config.ShowLink}
          site={site}
        />
      ))}
      <Tooltip id='site-tooltip' className='tooltip' place='top' variant='dark' />
    </div>
  );
}

export default UptimeRobot;
