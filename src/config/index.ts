export { default as schema } from './schema';

import test from './test';
import development from './development';
import staging from './staging';
import production from './production';

export const configurations = {
  test,
  development,
  staging,
  production,
};
