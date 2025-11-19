export const PASSWORD_MIN_LENGTH = 8;

// 至少包含：一个小写字母、一个大写字母、一个数字、一个特殊字符，且长度>=8
export const PASSWORD_COMPLEXITY_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const passwordValidationMessages = {
  required: '请输入密码',
  min: `密码至少${PASSWORD_MIN_LENGTH}位`,
  lower: '需包含小写字母',
  upper: '需包含大写字母',
  digit: '需包含数字',
  special: '需包含特殊字符',
};

export function validatePasswordComplexity(password: unknown): true | string {
  if (typeof password !== 'string') return passwordValidationMessages.required;
  if (password.length < PASSWORD_MIN_LENGTH)
    return passwordValidationMessages.min;
  if (!/[a-z]/.test(password)) return passwordValidationMessages.lower;
  if (!/[A-Z]/.test(password)) return passwordValidationMessages.upper;
  if (!/\d/.test(password)) return passwordValidationMessages.digit;
  if (!/[^A-Za-z0-9]/.test(password)) return passwordValidationMessages.special;
  return true;
}

// antd Form 自定义校验器（密码）
export const passwordFormValidator = () => ({
  validator(_: unknown, value: unknown) {
    const result = validatePasswordComplexity(value);
    return result === true ? Promise.resolve() : Promise.reject(result);
  },
});

// 用户名校验：至少6位；仅英文字母、数字、连字符'-'；不允许出现连续'-'
export const USERNAME_MIN_LENGTH = 6;

export const usernameValidationMessages = {
  required: '请输入用户名',
  min: `用户名至少${USERNAME_MIN_LENGTH}位`,
  charset: "用户名仅支持英文、数字和'-'",
  consecutiveDash: "用户名不允许出现连续 '-'",
};

export function validateUsername(value: unknown): true | string {
  if (typeof value !== 'string' || value.trim() === '') {
    return usernameValidationMessages.required;
  }
  const userName = value;
  if (userName.length < USERNAME_MIN_LENGTH) {
    return usernameValidationMessages.min;
  }
  if (!/^[A-Za-z0-9-]+$/.test(userName)) {
    return usernameValidationMessages.charset;
  }
  if (/--/.test(userName)) {
    return usernameValidationMessages.consecutiveDash;
  }
  return true;
}

// antd Form 自定义校验器（用户名）
export const usernameFormValidator = () => ({
  validator(_: unknown, value: unknown) {
    const result = validateUsername(value);
    return result === true ? Promise.resolve() : Promise.reject(result);
  },
});
