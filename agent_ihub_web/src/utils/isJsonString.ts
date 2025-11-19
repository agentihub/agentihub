const isJsonString = (str: string) => {
  if (typeof str === 'string') {
    try {
      const obj = JSON.parse(str);
      if (typeof obj === 'object' && obj) {
        return true;
      } else {
        return false;
      }
    } catch (_) {
      return false;
    }
  }
};

export { isJsonString };
