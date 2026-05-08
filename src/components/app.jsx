import { useState } from 'react';
import Link from './link';
import Header from './header';
import UptimeRobot from './uptimerobot';
import { getConfig } from '../common/config';
import Package from '../../package.json';

const RANGE_OPTIONS = [7, 30];

function App() {
  const config = getConfig();
  const [days, setDays] = useState(() => (
    RANGE_OPTIONS.includes(config?.CountDays) ? config.CountDays : RANGE_OPTIONS[0]
  ));

  if (!config) return null;

  return (
    <>
      <Header />
      <div className='container'>
        <div id='uptime'>
          <div className='toolbar'>
            <div className='range-selector'>
              {RANGE_OPTIONS.map((d) => (
                <button
                  key={d}
                  type='button'
                  className={days === d ? 'active' : ''}
                  aria-pressed={days === d}
                  onClick={() => setDays(d)}
                >
                  {d} 天
                </button>
              ))}
            </div>
          </div>
          {config.ApiKeys.length
            ? config.ApiKeys.map((key) => (
              <UptimeRobot key={key} apikey={key} days={days} />
            ))
            : (
              <div className='empty-state'>
                请先在 <code>public/config.js</code> 中配置 UptimeRobot API Key。
              </div>
            )
          }
        </div>
        <div id='footer'>
          <p>基于 <Link to='https://uptimerobot.com/'>UptimeRobot</Link> 接口制作，检测频率 5 分钟</p>
          <p>&copy; 2020 <Link to='https://status.org.cn/'>STATUS.ORG.CN</Link>, Version {Package.version}</p>
        </div>
      </div>
    </>
  );
}

export default App;
