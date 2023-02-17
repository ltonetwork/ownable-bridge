type PromiseOf<T extends Promise<any>> = T extends Promise<infer R> ? R : any;
