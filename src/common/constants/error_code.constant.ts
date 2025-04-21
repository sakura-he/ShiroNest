export enum ErrorEnum {
    RESPONSE_SUCCESS_CODE = '200:OK',
    // 通用错误
    SERVER_ERROR = '500:服务繁忙，请稍后再试',
    DEFAULT = '501:未知错误',
    NOT_FOUND = '404:资源不存在',
    UNAUTHORIZED = '401:未授权访问',
    FORBIDDEN = '403:权限不足',
    BAD_REQUEST = '400:请求参数错误',

    // 认证相关错误
    SYSTEM_USER_EXISTS = '1001:系统用户已存在',
    INVALID_VERIFICATION_CODE = '1002:验证码填写有误',
    INVALID_USERNAME_PASSWORD = '1003:用户名或密码错误',
    USER_NOT_FOUND = '1004:用户不存在',
    ACCOUNT_LOCKED = '1005:用户已被锁定，请联系管理员',
    ACCOUNT_DISABLED = '1006:用户已被禁用',
    TOKEN_EXPIRED = '1007:认证密钥已过期',
    TOKEN_INVALID = '1008:认证密钥无效',
    TOKEN_NOT_BEFORE = '1009:认证密钥未到生效时间',
    TOKEN_UNDEFINED_ERROR = '1010:认证密钥验证过程中出现未知错误',
    TOKEN_NOT_PROVIDED_USER = '1011:认证信息中没有有效的用户',
    TOKEN_NOT_FOUND_USER = '1012:未找到认证用户',
    PASSWORD_TOO_WEAK = '1020:密码强度不足',
    PASSWORD_EXPIRED = '1030:密码已过期',

    // 角色相关错误
    PERMISSION_DENIED = '1101:无权限执行此操作',
    ROLE_ALREADY_EXISTS = '1102:角色已存在',
    ROLE_NOT_FOUND = '1103:角色不存在',
    ROLE_NAME_ALREADY_EXISTS = '1701:角色名称已存在',
    INVALID_ROLE_ASSIGNMENT = '1104:不能分配该角色',
    ROLE_ASSIGNMENT_MENU_NOT_FOUND_ID = '1105:分配菜单不存在,id 为:',
    DELETE_ROLE_FAILD_ROLE_REF = '1106:删除角色失败,当前角色正在被以下用户使用:',

    // 请求 & 参数错误
    PARAMETER_MISSING = '1201:缺少必要参数',
    PARAMETER_INVALID = '1202:参数格式错误',
    UNSUPPORTED_MEDIA_TYPE = '1203:不支持的媒体类型',

    // 数据库相关错误
    DATABASE_ERROR = '1301:数据库操作失败',
    DATA_ALREADY_EXISTS = '1302:数据已存在',
    DATA_NOT_FOUND = '1303:数据未找到',
    DATA_CONFLICT = '1304:数据冲突',

    // 文件相关错误
    FILE_UPLOAD_FAILED = '1401:文件上传失败',
    FILE_TOO_LARGE = '1402:文件大小超出限制',
    FILE_FORMAT_NOT_SUPPORTED = '1403:文件格式不支持',
    FILE_CHUNK_NOT_FOUND = '1404:文件切片不存在',
    FILE_CHUNK_NOT_UPLOADED = '1405:文件切片未上传完成',
    FILE_CHUNK_HASH_NOT_MATCH = '1406:文件切片 hash 值不一致',

    // 任务相关错误
    TASK_NOT_FOUND = '1501:任务不存在',
    TASK_HANDLER_NOT_FOUND = '1502:任务 handler 不存在',
    // 业务逻辑错误
    OPERATION_NOT_ALLOWED = '1601:操作不允许',
    DUPLICATE_OPERATION = '1602:重复操作',
    RATE_LIMIT_EXCEEDED = '1603:请求过于频繁，请稍后再试',
    // 权限相关错误
    PERMISSION_NAME_ALREADY_EXISTS = '1801:权限名称已存在',
    PERMISSION_NOT_FOUND = '1802:权限不存在',

    // 菜单相关错误
    MENU_NAME_ALREADY_EXISTS = '1901:菜单名称已存在',
    MENU_NOT_FOUND = '1902:菜单不存在',
    MENU_PARENT_NOT_FOUND = '1903:上级菜单不存在',
    MENU_PARENT_CIRCULAR = '1904:上级菜单不能是自身',
    MENU_CATALOG_PARRENT_MUST_CATALOG_OR_NULL = '1905:上级菜单必须是目录或为根目录',
    MENU_BUTTON_PARENT_MUST_PAGE = '1906:按钮上级菜单必须是页面',
    MENU_PAGE_PARENT_MUST_CATALOG_ROOT = '1907:页面上级菜单必须是目录或者为根目录'
}
