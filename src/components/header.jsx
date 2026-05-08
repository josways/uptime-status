import { useEffect, useState } from 'react';
import Link from './link';
import { getConfig } from '../common/config';

const DARK_MODE_STORAGE_KEY = 'dark-mode';

function getInitialDarkMode() {
  const saved = localStorage.getItem(DARK_MODE_STORAGE_KEY);
  if (saved === 'true') return true;
  if (saved === 'false') return false;

  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function Header() {
  const config = getConfig();
  const [dark, setDark] = useState(getInitialDarkMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem(DARK_MODE_STORAGE_KEY, String(dark));
  }, [dark]);

  useEffect(() => {
    if (config) document.title = config.SiteName;
  }, [config]);

  if (!config) return null;

  return (
    <div id='header'>
      <div className='container'>
        <h1 className='logo'>{config.SiteName}</h1>
        <div className='navi'>
          {config.Navi.map((item) => (
            <Link key={item.url} to={item.url}>
              {item.text}
            </Link>
          ))}
          <button
            className='dark-toggle'
            type='button'
            onClick={() => setDark((current) => !current)}
            title={dark ? '切换亮色模式' : '切换暗色模式'}
            aria-label={dark ? '切换到亮色模式' : '切换到暗色模式'}
            aria-pressed={dark}
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Header;
