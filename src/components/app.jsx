import { useState } from 'react';
import Link from './link';
import Header from './header';
import UptimeRobot from './uptimerobot';
import Package from '../../package.json';

const RANGE_OPTIONS = [7, 30, 90];

function App() {
  const config = window.Config;
  const [days, setDays] = useState(config?.CountDays || 30);

  const apikeys = (() => {
    if (!config) return [];
    const { ApiKeys } = config;
    if (Array.isArray(ApiKeys)) return ApiKeys;
    if (typeof ApiKeys === 'string') return [ApiKeys];
    return [];
  })();

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
                  className={days === d ? 'active' : ''}
                  onClick={() => setDays(d)}
                >
                  {d} 天
                </button>
              ))}
            </div>
          </div>
          {apikeys.map((key) => (
            <UptimeRobot key={key} apikey={key} days={days} />
          ))}
        </div>
        <div id='footer'>
          <p>基于 <Link to='https://uptimerobot.com/' text='UptimeRobot' /> 接口制作，检测频率 5 分钟</p>
          <p>&copy; 2020 <Link to='https://status.org.cn/' text='STATUS.ORG.CN' />, Version {Package.version}</p>
        </div>
      </div>
    </>
  );
}

export default App;