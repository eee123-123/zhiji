/**
 * 获取当前用户ID
 * 本地开发阶段返回固定ID，上线后接入 NextAuth.js
 */
export function getCurrentUserId(): string {
  // 本地开发：使用固定用户ID
  return "local-dev-user";
}
