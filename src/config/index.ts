export { default as schema } from './schema';

import test from './development';
import development from './development';
import staging from './development';
import production from './development';

export const configurations = {
  test,
  development,
  staging,
  production,
};
