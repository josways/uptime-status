import { useEffect, useState } from 'react';
import Link from './link';

function Header() {
  const config = window.Config;
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('dark-mode');
    return saved === 'true';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('dark-mode', dark);
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
          {config.Navi.map((item, index) => (
            <Link key={index} to={item.url} text={item.text} />
          ))}
          <button
            className='dark-toggle'
            onClick={() => setDark(!dark)}
            title={dark ? '切换亮色模式' : '切换暗色模式'}
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Header;