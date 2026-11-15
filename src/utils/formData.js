export const FORM_DATA_KEY = "elementorFormData";

// 注意：content script 必须自包含，src/scripts/content.js 中保留了一份相同默认值，修改时请同步。
export const DEFAULT_FORM_DATA = {
  text: "test",
  tel: "13800138000",
  email: "test@example.com",
  textarea: "This is test message",
};

export function normalizeFormData(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    text: typeof source.text === "string" ? source.text : DEFAULT_FORM_DATA.text,
    tel: typeof source.tel === "string" ? source.tel : DEFAULT_FORM_DATA.tel,
    email: typeof source.email === "string" ? source.email : DEFAULT_FORM_DATA.email,
    textarea: typeof source.textarea === "string" ? source.textarea : DEFAULT_FORM_DATA.textarea,
  };
}
