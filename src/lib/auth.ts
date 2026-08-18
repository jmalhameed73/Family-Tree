<<<<<<< HEAD
// كلمة المرور للتعديل (غيرها بكلمة قوية)
const ADMIN_PASSWORD = '12345';

// مفتاح التخزين
const AUTH_KEY = 'family-tree-edit-auth';

// التحقق من كلمة المرور
export function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

// تسجيل الدخول للتعديل
export function loginForEdit(password: string): boolean {
  if (verifyPassword(password)) {
    localStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
}

// تسجيل الخروج من وضع التعديل
export function logoutEdit(): void {
  localStorage.removeItem(AUTH_KEY);
}

// التحقق من صلاحية التعديل
export function canEdit(): boolean {
  return localStorage.getItem(AUTH_KEY) === 'true';
=======
// كلمة المرور للتعديل (غيرها بكلمة قوية)
const ADMIN_PASSWORD = '12345';

// مفتاح التخزين
const AUTH_KEY = 'family-tree-edit-auth';

// التحقق من كلمة المرور
export function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

// تسجيل الدخول للتعديل
export function loginForEdit(password: string): boolean {
  if (verifyPassword(password)) {
    localStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
}

// تسجيل الخروج من وضع التعديل
export function logoutEdit(): void {
  localStorage.removeItem(AUTH_KEY);
}

// التحقق من صلاحية التعديل
export function canEdit(): boolean {
  return localStorage.getItem(AUTH_KEY) === 'true';
>>>>>>> b77e55eef71ca09eb6d0d5d1c137df73349e828c
}