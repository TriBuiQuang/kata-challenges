function curryPartial(fn, ...args) {
   if (fn.length > args.length) {
      return (...params) => curryPartial(fn, ...args, ...params);
   }

   return fn(...args);
}
