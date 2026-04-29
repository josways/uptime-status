import { useEffect } from 'react';
import Link from './link';

function Header() {
  const config = window.Config;

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
        </div>
      </div>
    </div>
  );
}

export default Header;