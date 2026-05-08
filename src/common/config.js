const DEFAULT_RANGE_DAYS = 7;

function normalizeApiKeys(apiKeys) {
  if (Array.isArray(apiKeys)) {
    return apiKeys.filter((item) => typeof item === 'string' && item.trim());
  }

  if (typeof apiKeys === 'string' && apiKeys.trim()) {
    return [apiKeys];
  }

  return [];
}

function normalizeNavi(navi) {
  if (!Array.isArray(navi)) return [];

  return navi.filter((item) => item?.text && item?.url);
}

function normalizeCountDays(countDays) {
  if (!Number.isInteger(countDays) || countDays <= 0) {
    return DEFAULT_RANGE_DAYS;
  }

  return countDays;
}

export function getConfig() {
  const config = window.Config;

  if (!config) return null;

  return {
    ...config,
    ApiKeys: normalizeApiKeys(config.ApiKeys),
    CountDays: normalizeCountDays(config.CountDays),
    Navi: normalizeNavi(config.Navi),
    ShowLink: Boolean(config.ShowLink),
    SiteName: config.SiteName || 'Status',
  };
}
