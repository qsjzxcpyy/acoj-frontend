import ACCESS_ENUM from "./ACCESS_ENUM";

/**
 * 检查权限（判断当前用户是否具有某个权限）
 * @param loginUser 当前登录用户
 * @param needAccess 需要的权限
 * @return boolean 有无权限
 */
const checkAccess = (loginUser: any, needAccess: string | string[]) => {
  // 获取当前用户具有的权限
  const loginUserAccess = loginUser?.userRole ?? ACCESS_ENUM.NOT_LOGIN;

  // 如果需要的权限是数组
  if (Array.isArray(needAccess)) {
    // 用户必须具有数组中的任一权限
    return needAccess.includes(loginUserAccess);
  }

  // 如果不传任何权限，则视为公开可访问
  if (!needAccess) {
    return true;
  }

  // 如果用户未登录，仅可访问公开接口
  if (!loginUser) {
    return false;
  }

  // 单个权限的判断
  return loginUserAccess === needAccess;
};

export default checkAccess;
