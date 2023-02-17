import JSZip from 'jszip';
import { Provider } from '@nestjs/common';

export const jszipProviders: Array<Provider> = [
  {
    provide: JSZip,
    useValue: new JSZip(),
  },
];
