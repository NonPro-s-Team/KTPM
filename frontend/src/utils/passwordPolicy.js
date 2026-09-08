export const BCRYPT_MAX_BYTES = 72
export const PASSWORD_MIN_CHARACTERS = 8

const utf8Length = (value) => new TextEncoder().encode(value).length

export function passwordLengthError(value, { requireMinimum = true } = {}) {
  if (requireMinimum && value.length < PASSWORD_MIN_CHARACTERS) {
    return `Mật khẩu tối thiểu ${PASSWORD_MIN_CHARACTERS} ký tự`
  }
  if (utf8Length(value) > BCRYPT_MAX_BYTES) {
    return `Mật khẩu không được vượt quá ${BCRYPT_MAX_BYTES} byte UTF-8`
  }
  return null
}
