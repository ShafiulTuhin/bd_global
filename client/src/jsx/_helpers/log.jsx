import NOTICE from '../_constants/notice.constant'
export function log({ type = NOTICE.INFO, data = null }) {
  return { type, data };
}
