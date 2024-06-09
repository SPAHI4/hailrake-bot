export const formatNumbers = (strs: TemplateStringsArray, ...args: (string | number)[]): string => {
  let result: string = strs[0] ?? '';

  for (let i = 0; i < args.length; ++i) {
    const arg = args[i];
    if (typeof arg === 'number') {
      result += new Intl.NumberFormat(['ru-RU'], {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }).format(arg);
    } else {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      result += arg;
    }
    result += strs[i + 1] ?? '';
  }

  return result;
};
