/*
 Navicat Premium Dump SQL

 Source Server         : shiro
 Source Server Type    : MySQL
 Source Server Version : 90200 (9.2.0)
 Source Host           : localhost:20306
 Source Schema         : mydb

 Target Server Type    : MySQL
 Target Server Version : 90200 (9.2.0)
 File Encoding         : 65001

 Date: 21/04/2025 23:32:11
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for shiro_dict
-- ----------------------------
DROP TABLE IF EXISTS `shiro_dict`;
CREATE TABLE `shiro_dict` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` int NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `shiro_dict_category_value_key` (`category`,`value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of shiro_dict
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for shiro_dict_key
-- ----------------------------
DROP TABLE IF EXISTS `shiro_dict_key`;
CREATE TABLE `shiro_dict_key` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dict_id` int NOT NULL,
  `key` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` int NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `shiro_dict_key_dict_id_fkey` (`dict_id`),
  CONSTRAINT `shiro_dict_key_dict_id_fkey` FOREIGN KEY (`dict_id`) REFERENCES `shiro_dict` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of shiro_dict_key
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for shiro_file_chunk
-- ----------------------------
DROP TABLE IF EXISTS `shiro_file_chunk`;
CREATE TABLE `shiro_file_chunk` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `file_uid` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` bigint NOT NULL,
  `file_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_hash` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_chunks_length` int NOT NULL,
  `chunk_index` int NOT NULL,
  `chunk_hash` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `chunk_size` int NOT NULL,
  `chunk_path` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `chunk_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_merge_id` int DEFAULT NULL,
  `ref_chunk_id` int DEFAULT NULL,
  `is_delete` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `shiro_file_chunk_file_merge_id_fkey` (`file_merge_id`),
  CONSTRAINT `shiro_file_chunk_file_merge_id_fkey` FOREIGN KEY (`file_merge_id`) REFERENCES `shiro_file_merge` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of shiro_file_chunk
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for shiro_file_merge
-- ----------------------------
DROP TABLE IF EXISTS `shiro_file_merge`;
CREATE TABLE `shiro_file_merge` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `file_uid` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` bigint NOT NULL,
  `file_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_hash` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('MERGE_ING','MERGE_SUCCESS','MERGE_FAILED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MERGE_ING',
  `is_delete` tinyint(1) NOT NULL DEFAULT '0',
  `ref_file_id` int DEFAULT NULL,
  `merge_progress` int NOT NULL DEFAULT '0',
  `error_msg` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of shiro_file_merge
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for shiro_menu
-- ----------------------------
DROP TABLE IF EXISTS `shiro_menu`;
CREATE TABLE `shiro_menu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pid` int DEFAULT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `component_path` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('Catalog','Page','Button') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `path` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order` int DEFAULT NULL,
  `layout` enum('LAYOUT_DEFAULT','LAYOUT_SIDE','LAYOUT_TOP') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'LAYOUT_SIDE',
  `page_type` enum('PAGE','LINK','IFRAME') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PAGE',
  `is_resident` tinyint(1) NOT NULL DEFAULT '0',
  `is_cache` tinyint(1) NOT NULL DEFAULT '0',
  `is_menu_visible` tinyint(1) NOT NULL DEFAULT '1',
  `status` enum('ENABLE','DISABLE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ENABLE',
  `show_children` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `permission` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `component_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_tab_visible` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of shiro_menu
-- ----------------------------
BEGIN;
INSERT INTO `shiro_menu` (`id`, `pid`, `description`, `title`, `component_path`, `type`, `path`, `icon`, `order`, `layout`, `page_type`, `is_resident`, `is_cache`, `is_menu_visible`, `status`, `show_children`, `created_at`, `updated_at`, `permission`, `component_name`, `is_tab_visible`) VALUES (26, NULL, NULL, '工作台', NULL, 'Catalog', 'dashboard', 'IconDesktop', 1, 'LAYOUT_DEFAULT', 'PAGE', 1, 1, 1, 'ENABLE', 1, '2025-04-10 16:51:46.044', '2025-04-14 17:02:10.999', 'dashboard.index.index', NULL, 1);
INSERT INTO `shiro_menu` (`id`, `pid`, `description`, `title`, `component_path`, `type`, `path`, `icon`, `order`, `layout`, `page_type`, `is_resident`, `is_cache`, `is_menu_visible`, `status`, `show_children`, `created_at`, `updated_at`, `permission`, `component_name`, `is_tab_visible`) VALUES (27, 26, NULL, '工作台', 'dashboard/workplace/Workplace', 'Page', 'workplace', 'IconDesktop', 1, 'LAYOUT_SIDE', 'PAGE', 1, 1, 1, 'ENABLE', 1, '2025-04-10 16:51:46.053', '2025-04-14 17:10:28.587', 'dashboard.workplace.index', 'Workplace', 1);
INSERT INTO `shiro_menu` (`id`, `pid`, `description`, `title`, `component_path`, `type`, `path`, `icon`, `order`, `layout`, `page_type`, `is_resident`, `is_cache`, `is_menu_visible`, `status`, `show_children`, `created_at`, `updated_at`, `permission`, `component_name`, `is_tab_visible`) VALUES (28, 26, NULL, '数据可视化', 'dashboard/monitor/Monitor', 'Page', 'monitor', 'IconDashboard', 1, 'LAYOUT_SIDE', 'PAGE', 1, 0, 1, 'ENABLE', 1, '2025-04-10 16:51:46.059', '2025-04-10 16:51:46.059', 'dashboard.monitor.index', 'Monitor', 1);
INSERT INTO `shiro_menu` (`id`, `pid`, `description`, `title`, `component_path`, `type`, `path`, `icon`, `order`, `layout`, `page_type`, `is_resident`, `is_cache`, `is_menu_visible`, `status`, `show_children`, `created_at`, `updated_at`, `permission`, `component_name`, `is_tab_visible`) VALUES (29, NULL, NULL, '文章资讯', NULL, 'Catalog', 'article', 'IconBarChart', 2, 'LAYOUT_DEFAULT', 'PAGE', 0, 1, 1, 'ENABLE', 1, '2025-04-10 16:51:46.062', '2025-04-14 16:09:01.093', 'article.index.index', NULL, 1);
INSERT INTO `shiro_menu` (`id`, `pid`, `description`, `title`, `component_path`, `type`, `path`, `icon`, `order`, `layout`, `page_type`, `is_resident`, `is_cache`, `is_menu_visible`, `status`, `show_children`, `created_at`, `updated_at`, `permission`, `component_name`, `is_tab_visible`) VALUES (30, 29, NULL, '文章资讯', 'article/lists/ListsIndex', 'Page', 'list', 'icon-apps', 1, 'LAYOUT_TOP', 'PAGE', 0, 1, 1, 'ENABLE', 1, '2025-04-10 16:51:46.065', '2025-04-10 16:51:46.065', 'article.lists_index.index', 'ListsIndex', 1);
INSERT INTO `shiro_menu` (`id`, `pid`, `description`, `title`, `component_path`, `type`, `path`, `icon`, `order`, `layout`, `page_type`, `is_resident`, `is_cache`, `is_menu_visible`, `status`, `show_children`, `created_at`, `updated_at`, `permission`, `component_name`, `is_tab_visible`) VALUES (31, 29, NULL, '文章编辑', 'article/lists/ListsEdit1', 'Page', 'edit', 'icon-apps', 1, 'LAYOUT_SIDE', 'PAGE', 0, 1, 1, 'ENABLE', 1, '2025-04-10 16:51:46.068', '2025-04-10 16:51:46.068', 'article.lists_edit.index', 'ListsEdit', 1);
INSERT INTO `shiro_menu` (`id`, `pid`, `description`, `title`, `component_path`, `type`, `path`, `icon`, `order`, `layout`, `page_type`, `is_resident`, `is_cache`, `is_menu_visible`, `status`, `show_children`, `created_at`, `updated_at`, `permission`, `component_name`, `is_tab_visible`) VALUES (32, NULL, NULL, '系统管理', NULL, 'Catalog', 'system', 'IconSettings', 1, 'LAYOUT_DEFAULT', 'PAGE', 87, 1, 1, 'ENABLE', 1, '2025-04-10 16:51:46.070', '2025-04-14 17:08:05.252', 'system.index.index', NULL, 1);
INSERT INTO `shiro_menu` (`id`, `pid`, `description`, `title`, `component_path`, `type`, `path`, `icon`, `order`, `layout`, `page_type`, `is_resident`, `is_cache`, `is_menu_visible`, `status`, `show_children`, `created_at`, `updated_at`, `permission`, `component_name`, `is_tab_visible`) VALUES (33, 32, NULL, '角色管理', 'system/role/Role', 'Page', 'role', 'IconFaceMehFill', 1, 'LAYOUT_SIDE', 'PAGE', 0, 1, 1, 'ENABLE', 1, '2025-04-10 16:51:46.072', '2025-04-14 17:08:17.528', 'system.role.index', 'Role', 1);
INSERT INTO `shiro_menu` (`id`, `pid`, `description`, `title`, `component_path`, `type`, `path`, `icon`, `order`, `layout`, `page_type`, `is_resident`, `is_cache`, `is_menu_visible`, `status`, `show_children`, `created_at`, `updated_at`, `permission`, `component_name`, `is_tab_visible`) VALUES (34, 32, NULL, '菜单管理', 'system/menu/Menu', 'Page', 'menu-manage', 'IconAlignLeft', 1, 'LAYOUT_SIDE', 'PAGE', 1, 1, 1, 'ENABLE', 1, '2025-04-10 16:51:46.075', '2025-04-19 06:25:54.995', 'system.menu.index', 'Menu', 1);
INSERT INTO `shiro_menu` (`id`, `pid`, `description`, `title`, `component_path`, `type`, `path`, `icon`, `order`, `layout`, `page_type`, `is_resident`, `is_cache`, `is_menu_visible`, `status`, `show_children`, `created_at`, `updated_at`, `permission`, `component_name`, `is_tab_visible`) VALUES (35, 32, NULL, '任务管理', 'system/task/Task', 'Page', 'task', 'IconCalendarClock', 1, 'LAYOUT_SIDE', 'PAGE', 0, 1, 1, 'ENABLE', 1, '2025-04-10 16:51:46.077', '2025-04-14 17:08:31.412', 'system.task.index', 'Task', 1);
INSERT INTO `shiro_menu` (`id`, `pid`, `description`, `title`, `component_path`, `type`, `path`, `icon`, `order`, `layout`, `page_type`, `is_resident`, `is_cache`, `is_menu_visible`, `status`, `show_children`, `created_at`, `updated_at`, `permission`, `component_name`, `is_tab_visible`) VALUES (36, NULL, NULL, 'Arco Design', 'https://baidu.com', 'Page', 'arco', 'icon-code-square', 1, 'LAYOUT_SIDE', 'IFRAME', 0, 1, 1, 'ENABLE', 1, '2025-04-10 16:51:46.079', '2025-04-10 16:51:46.079', 'baidu.index.index', NULL, 1);
INSERT INTO `shiro_menu` (`id`, `pid`, `description`, `title`, `component_path`, `type`, `path`, `icon`, `order`, `layout`, `page_type`, `is_resident`, `is_cache`, `is_menu_visible`, `status`, `show_children`, `created_at`, `updated_at`, `permission`, `component_name`, `is_tab_visible`) VALUES (37, NULL, NULL, 'Vue开发文档', 'https://baidu.com', 'Page', 'vue-doc', 'icon-code-square', 1, 'LAYOUT_SIDE', 'IFRAME', 0, 1, 1, 'ENABLE', 1, '2025-04-10 16:51:46.081', '2025-04-10 16:51:46.081', 'vue-doc.index.index', NULL, 1);
INSERT INTO `shiro_menu` (`id`, `pid`, `description`, `title`, `component_path`, `type`, `path`, `icon`, `order`, `layout`, `page_type`, `is_resident`, `is_cache`, `is_menu_visible`, `status`, `show_children`, `created_at`, `updated_at`, `permission`, `component_name`, `is_tab_visible`) VALUES (38, NULL, NULL, 'Bing', 'https://baidu.com', 'Page', 'bing', 'icon-launch', 1, 'LAYOUT_SIDE', 'LINK', 0, 1, 1, 'ENABLE', 1, '2025-04-10 16:51:46.083', '2025-04-10 16:51:46.083', 'bing.index.index', NULL, 1);
INSERT INTO `shiro_menu` (`id`, `pid`, `description`, `title`, `component_path`, `type`, `path`, `icon`, `order`, `layout`, `page_type`, `is_resident`, `is_cache`, `is_menu_visible`, `status`, `show_children`, `created_at`, `updated_at`, `permission`, `component_name`, `is_tab_visible`) VALUES (39, NULL, NULL, '项目地址', 'https://baidu.com', 'Page', 'doc', 'icon-github', 1, 'LAYOUT_SIDE', 'LINK', 0, 1, 1, 'ENABLE', 1, '2025-04-10 16:51:46.084', '2025-04-10 16:51:46.084', 'github.index.index', NULL, 1);
INSERT INTO `shiro_menu` (`id`, `pid`, `description`, `title`, `component_path`, `type`, `path`, `icon`, `order`, `layout`, `page_type`, `is_resident`, `is_cache`, `is_menu_visible`, `status`, `show_children`, `created_at`, `updated_at`, `permission`, `component_name`, `is_tab_visible`) VALUES (40, 27, NULL, '测试按钮', NULL, 'Button', NULL, 'IconBrush', 0, 'LAYOUT_SIDE', 'PAGE', 0, 0, 1, 'ENABLE', 1, '2025-04-14 15:10:26.565', '2025-04-14 16:08:40.020', 'btntest', NULL, 1);
INSERT INTO `shiro_menu` (`id`, `pid`, `description`, `title`, `component_path`, `type`, `path`, `icon`, `order`, `layout`, `page_type`, `is_resident`, `is_cache`, `is_menu_visible`, `status`, `show_children`, `created_at`, `updated_at`, `permission`, `component_name`, `is_tab_visible`) VALUES (41, 27, NULL, '测试 2', NULL, 'Button', NULL, 'IconBook', 0, 'LAYOUT_SIDE', 'PAGE', 0, 0, 1, 'ENABLE', 1, '2025-04-14 15:34:04.084', '2025-04-14 16:07:37.822', '呃呃', NULL, 1);
INSERT INTO `shiro_menu` (`id`, `pid`, `description`, `title`, `component_path`, `type`, `path`, `icon`, `order`, `layout`, `page_type`, `is_resident`, `is_cache`, `is_menu_visible`, `status`, `show_children`, `created_at`, `updated_at`, `permission`, `component_name`, `is_tab_visible`) VALUES (42, 32, NULL, '用户管理', 'system/user/User', 'Page', 'user', 'IconUserGroup', 0, 'LAYOUT_SIDE', 'PAGE', 1, 1, 0, 'ENABLE', 1, '2025-04-16 13:46:49.341', '2025-04-19 06:26:17.769', 'system.user.index', 'User', 1);
INSERT INTO `shiro_menu` (`id`, `pid`, `description`, `title`, `component_path`, `type`, `path`, `icon`, `order`, `layout`, `page_type`, `is_resident`, `is_cache`, `is_menu_visible`, `status`, `show_children`, `created_at`, `updated_at`, `permission`, `component_name`, `is_tab_visible`) VALUES (43, 33, NULL, '菜单导出', NULL, 'Button', NULL, 'IconDownload', 0, 'LAYOUT_SIDE', 'PAGE', 0, 0, 1, 'ENABLE', 1, '2025-04-19 17:29:11.441', '2025-04-19 17:57:13.281', 'system.menu.export', NULL, 1);
INSERT INTO `shiro_menu` (`id`, `pid`, `description`, `title`, `component_path`, `type`, `path`, `icon`, `order`, `layout`, `page_type`, `is_resident`, `is_cache`, `is_menu_visible`, `status`, `show_children`, `created_at`, `updated_at`, `permission`, `component_name`, `is_tab_visible`) VALUES (44, NULL, NULL, 'DEMO', NULL, 'Catalog', 'demo', 'IconCodeSquare', 2, 'LAYOUT_SIDE', 'PAGE', 0, 0, 0, 'ENABLE', 1, '2025-04-20 03:05:54.433', '2025-04-20 03:12:10.239', 'demo.index.index', NULL, 1);
INSERT INTO `shiro_menu` (`id`, `pid`, `description`, `title`, `component_path`, `type`, `path`, `icon`, `order`, `layout`, `page_type`, `is_resident`, `is_cache`, `is_menu_visible`, `status`, `show_children`, `created_at`, `updated_at`, `permission`, `component_name`, `is_tab_visible`) VALUES (45, 44, NULL, '权限测试', '/demo/permission/Permission', 'Page', 'permission', 'IconSafe', 0, 'LAYOUT_SIDE', 'PAGE', 0, 1, 0, 'ENABLE', 1, '2025-04-20 03:08:59.937', '2025-04-20 03:12:21.980', 'demo.permission.index', 'PermissionTest', 1);
INSERT INTO `shiro_menu` (`id`, `pid`, `description`, `title`, `component_path`, `type`, `path`, `icon`, `order`, `layout`, `page_type`, `is_resident`, `is_cache`, `is_menu_visible`, `status`, `show_children`, `created_at`, `updated_at`, `permission`, `component_name`, `is_tab_visible`) VALUES (46, 45, NULL, 'admin 角色有权限', NULL, 'Button', NULL, NULL, NULL, 'LAYOUT_SIDE', 'PAGE', 0, 0, 1, 'ENABLE', 1, '2025-04-20 15:59:03.517', '2025-04-20 15:59:03.517', 'demo.permission.admin', NULL, 1);
INSERT INTO `shiro_menu` (`id`, `pid`, `description`, `title`, `component_path`, `type`, `path`, `icon`, `order`, `layout`, `page_type`, `is_resident`, `is_cache`, `is_menu_visible`, `status`, `show_children`, `created_at`, `updated_at`, `permission`, `component_name`, `is_tab_visible`) VALUES (47, 45, NULL, 'user角色有权限', NULL, 'Button', NULL, NULL, NULL, 'LAYOUT_SIDE', 'PAGE', 0, 0, 1, 'ENABLE', 1, '2025-04-20 15:59:22.630', '2025-04-20 15:59:22.630', 'demo.permission.user', NULL, 1);
INSERT INTO `shiro_menu` (`id`, `pid`, `description`, `title`, `component_path`, `type`, `path`, `icon`, `order`, `layout`, `page_type`, `is_resident`, `is_cache`, `is_menu_visible`, `status`, `show_children`, `created_at`, `updated_at`, `permission`, `component_name`, `is_tab_visible`) VALUES (48, 45, NULL, 'test角色有权限', NULL, 'Button', NULL, NULL, NULL, 'LAYOUT_SIDE', 'PAGE', 0, 0, 1, 'ENABLE', 1, '2025-04-20 15:59:36.989', '2025-04-20 15:59:36.989', 'demo.permission.test', NULL, 1);
INSERT INTO `shiro_menu` (`id`, `pid`, `description`, `title`, `component_path`, `type`, `path`, `icon`, `order`, `layout`, `page_type`, `is_resident`, `is_cache`, `is_menu_visible`, `status`, `show_children`, `created_at`, `updated_at`, `permission`, `component_name`, `is_tab_visible`) VALUES (49, 45, NULL, '刚满 18 岁', NULL, 'Button', NULL, 'IconCheck', NULL, 'LAYOUT_SIDE', 'PAGE', 0, 0, 1, 'ENABLE', 1, '2025-04-20 16:16:09.421', '2025-04-20 16:16:09.421', 'demo.permission.age18', NULL, 1);
INSERT INTO `shiro_menu` (`id`, `pid`, `description`, `title`, `component_path`, `type`, `path`, `icon`, `order`, `layout`, `page_type`, `is_resident`, `is_cache`, `is_menu_visible`, `status`, `show_children`, `created_at`, `updated_at`, `permission`, `component_name`, `is_tab_visible`) VALUES (50, 45, NULL, '只有17岁', NULL, 'Button', NULL, 'IconClose', NULL, 'LAYOUT_SIDE', 'PAGE', 0, 0, 1, 'ENABLE', 1, '2025-04-20 16:16:57.110', '2025-04-20 16:16:57.110', 'demo.permission.age17', NULL, 1);
INSERT INTO `shiro_menu` (`id`, `pid`, `description`, `title`, `component_path`, `type`, `path`, `icon`, `order`, `layout`, `page_type`, `is_resident`, `is_cache`, `is_menu_visible`, `status`, `show_children`, `created_at`, `updated_at`, `permission`, `component_name`, `is_tab_visible`) VALUES (51, 45, NULL, 'user和 test 有权限', NULL, 'Button', NULL, NULL, NULL, 'LAYOUT_SIDE', 'PAGE', 0, 0, 1, 'ENABLE', 1, '2025-04-20 16:31:39.085', '2025-04-20 16:31:39.085', 'demo.permission.user_test', NULL, 1);
INSERT INTO `shiro_menu` (`id`, `pid`, `description`, `title`, `component_path`, `type`, `path`, `icon`, `order`, `layout`, `page_type`, `is_resident`, `is_cache`, `is_menu_visible`, `status`, `show_children`, `created_at`, `updated_at`, `permission`, `component_name`, `is_tab_visible`) VALUES (52, 45, NULL, '处理警告', NULL, 'Button', NULL, NULL, NULL, 'LAYOUT_SIDE', 'PAGE', 0, 0, 1, 'ENABLE', 1, '2025-04-20 16:51:42.237', '2025-04-20 16:51:42.237', 'demo.permission.handle_warning', NULL, 1);
COMMIT;

-- ----------------------------
-- Table structure for shiro_role
-- ----------------------------
DROP TABLE IF EXISTS `shiro_role`;
CREATE TABLE `shiro_role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `status` enum('ENABLE','DISABLE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ENABLE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `shiro_role_code_key` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of shiro_role
-- ----------------------------
BEGIN;
INSERT INTO `shiro_role` (`id`, `name`, `code`, `description`, `created_by`, `created_at`, `updated_at`, `status`) VALUES (2, '超级管理员', 'super_admin', NULL, NULL, '2025-04-16 09:15:10.575', '2025-04-20 16:51:51.634', 'ENABLE');
INSERT INTO `shiro_role` (`id`, `name`, `code`, `description`, `created_by`, `created_at`, `updated_at`, `status`) VALUES (4, 'test', 'test', NULL, NULL, '2025-04-19 10:35:54.966', '2025-04-20 16:32:29.932', 'ENABLE');
INSERT INTO `shiro_role` (`id`, `name`, `code`, `description`, `created_by`, `created_at`, `updated_at`, `status`) VALUES (5, '用户组', 'user', NULL, NULL, '2025-04-20 16:05:06.556', '2025-04-20 16:32:22.024', 'ENABLE');
COMMIT;

-- ----------------------------
-- Table structure for shiro_role_menu
-- ----------------------------
DROP TABLE IF EXISTS `shiro_role_menu`;
CREATE TABLE `shiro_role_menu` (
  `role_id` int NOT NULL,
  `menu_id` int NOT NULL,
  PRIMARY KEY (`role_id`,`menu_id`),
  KEY `shiro_role_menu_menu_id_fkey` (`menu_id`),
  CONSTRAINT `shiro_role_menu_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `shiro_menu` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `shiro_role_menu_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `shiro_role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of shiro_role_menu
-- ----------------------------
BEGIN;
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (2, 26);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (2, 27);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (2, 28);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (2, 29);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (5, 29);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (2, 30);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (5, 30);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (2, 31);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (5, 31);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (2, 32);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (4, 32);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (2, 33);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (4, 33);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (2, 34);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (4, 34);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (2, 35);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (4, 35);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (2, 36);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (2, 37);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (2, 38);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (2, 39);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (2, 40);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (2, 41);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (2, 42);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (4, 42);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (2, 43);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (4, 43);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (2, 44);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (4, 44);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (5, 44);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (2, 45);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (4, 45);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (5, 45);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (2, 46);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (5, 47);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (4, 48);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (2, 49);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (5, 50);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (4, 51);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (5, 51);
INSERT INTO `shiro_role_menu` (`role_id`, `menu_id`) VALUES (2, 52);
COMMIT;

-- ----------------------------
-- Table structure for shiro_task
-- ----------------------------
DROP TABLE IF EXISTS `shiro_task`;
CREATE TABLE `shiro_task` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `remark` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cron` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` json DEFAULT NULL,
  `params` json DEFAULT NULL,
  `handler` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `strategy` enum('AUTO','ONCE_AUTO','MANUAL') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('ENABLE','DISABLE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `shiro_task_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of shiro_task
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for shiro_task_log
-- ----------------------------
DROP TABLE IF EXISTS `shiro_task_log`;
CREATE TABLE `shiro_task_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` int NOT NULL,
  `log` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('SUCCESS','FAILED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `shiro_task_log_task_id_fkey` (`task_id`),
  CONSTRAINT `shiro_task_log_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `shiro_task` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of shiro_task_log
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for shiro_user
-- ----------------------------
DROP TABLE IF EXISTS `shiro_user`;
CREATE TABLE `shiro_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `psalt` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'https://img.yzcdn.cn/vant/ipad.png',
  `phone` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nickname` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remark` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` int NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `created_by` int DEFAULT NULL,
  `is_lock` tinyint(1) NOT NULL DEFAULT '0',
  `last_login` datetime(3) DEFAULT NULL,
  `test` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `shiro_user_username_key` (`username`),
  UNIQUE KEY `shiro_user_email_key` (`email`),
  UNIQUE KEY `shiro_user_phone_key` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of shiro_user
-- ----------------------------
BEGIN;
INSERT INTO `shiro_user` (`id`, `email`, `username`, `password`, `psalt`, `avatar`, `phone`, `nickname`, `remark`, `status`, `created_at`, `updated_at`, `created_by`, `is_lock`, `last_login`, `test`) VALUES (6, 'hibikihe@gmail.com', '糕团卷卷', '202cb962ac59075b964b07152d234b70', NULL, 'https://img.yzcdn.cn/vant/ipad.png', '17777777777', NULL, '测试用户', 1, '2025-04-17 07:38:47.770', '2025-04-19 10:44:32.060', 1, 0, NULL, NULL);
INSERT INTO `shiro_user` (`id`, `email`, `username`, `password`, `psalt`, `avatar`, `phone`, `nickname`, `remark`, `status`, `created_at`, `updated_at`, `created_by`, `is_lock`, `last_login`, `test`) VALUES (10, NULL, 'admin', '21232f297a57a5a743894a0e4a801fc3', NULL, NULL, NULL, 'Admin', NULL, 1, '2025-04-19 08:05:04.933', '2025-04-20 14:13:50.036', 1, 0, NULL, NULL);
COMMIT;

-- ----------------------------
-- Table structure for shiro_user_log
-- ----------------------------
DROP TABLE IF EXISTS `shiro_user_log`;
CREATE TABLE `shiro_user_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `user_info` json NOT NULL,
  `ip` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `request` json NOT NULL,
  `response` json NOT NULL,
  `status` int NOT NULL,
  `handler` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `shiro_user_log_id_key` (`id`),
  KEY `shiro_user_log_user_id_fkey` (`user_id`),
  CONSTRAINT `shiro_user_log_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `shiro_user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of shiro_user_log
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for shiro_user_role
-- ----------------------------
DROP TABLE IF EXISTS `shiro_user_role`;
CREATE TABLE `shiro_user_role` (
  `role_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`role_id`,`user_id`),
  KEY `shiro_user_role_user_id_fkey` (`user_id`),
  CONSTRAINT `shiro_user_role_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `shiro_role` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `shiro_user_role_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `shiro_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of shiro_user_role
-- ----------------------------
BEGIN;
INSERT INTO `shiro_user_role` (`role_id`, `user_id`) VALUES (4, 6);
INSERT INTO `shiro_user_role` (`role_id`, `user_id`) VALUES (2, 10);
INSERT INTO `shiro_user_role` (`role_id`, `user_id`) VALUES (4, 10);
COMMIT;
