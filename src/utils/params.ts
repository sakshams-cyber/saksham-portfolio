/** Test hooks (§17.2). All are no-ops unless the query param is present. */
export function param(name: string): boolean {
  if (typeof location === 'undefined') return false;
  return new URLSearchParams(location.search).get(name) === '1';
}

export const flags = {
  get nointro() {
    return param('nointro') || param('og');
  },
  get freeze() {
    return param('freeze');
  },
  get debug() {
    return param('debug');
  },
  get forceStatic() {
    return param('forceStatic');
  },
  get og() {
    return param('og');
  },
};
