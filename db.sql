-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.30 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping data for table medstock.auth_group: ~2 rows (approximately)
DELETE FROM `auth_group`;
INSERT INTO `auth_group` (`id`, `name`) VALUES
	(1, 'Admin'),
	(2, 'Storekeeper');

-- Dumping data for table medstock.auth_group_permissions: ~52 rows (approximately)
DELETE FROM `auth_group_permissions`;
INSERT INTO `auth_group_permissions` (`id`, `group_id`, `permission_id`) VALUES
	(1, 1, 25),
	(2, 1, 26),
	(3, 1, 27),
	(4, 1, 28),
	(5, 1, 29),
	(6, 1, 30),
	(7, 1, 31),
	(8, 1, 32),
	(9, 1, 33),
	(10, 1, 34),
	(11, 1, 35),
	(12, 1, 36),
	(13, 1, 37),
	(14, 1, 38),
	(15, 1, 39),
	(16, 1, 40),
	(17, 1, 41),
	(18, 1, 42),
	(19, 1, 43),
	(20, 1, 44),
	(21, 1, 45),
	(22, 1, 46),
	(23, 1, 47),
	(24, 1, 48),
	(25, 1, 49),
	(26, 1, 50),
	(27, 1, 51),
	(28, 1, 52),
	(55, 1, 53),
	(58, 1, 54),
	(59, 1, 55),
	(56, 1, 56),
	(57, 1, 57),
	(64, 1, 58),
	(65, 1, 59),
	(66, 1, 60),
	(67, 1, 61),
	(68, 1, 62),
	(69, 1, 63),
	(61, 1, 64),
	(62, 1, 65),
	(63, 1, 66),
	(36, 2, 28),
	(40, 2, 32),
	(30, 2, 36),
	(29, 2, 40),
	(47, 2, 44),
	(51, 2, 48),
	(32, 2, 52),
	(60, 2, 57),
	(71, 2, 61),
	(70, 2, 66);

-- Dumping data for table medstock.auth_permission: ~66 rows (approximately)
DELETE FROM `auth_permission`;
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES
	(1, 'Can add log entry', 1, 'add_logentry'),
	(2, 'Can change log entry', 1, 'change_logentry'),
	(3, 'Can delete log entry', 1, 'delete_logentry'),
	(4, 'Can view log entry', 1, 'view_logentry'),
	(5, 'Can add permission', 2, 'add_permission'),
	(6, 'Can change permission', 2, 'change_permission'),
	(7, 'Can delete permission', 2, 'delete_permission'),
	(8, 'Can view permission', 2, 'view_permission'),
	(9, 'Can add group', 3, 'add_group'),
	(10, 'Can change group', 3, 'change_group'),
	(11, 'Can delete group', 3, 'delete_group'),
	(12, 'Can view group', 3, 'view_group'),
	(13, 'Can add user', 4, 'add_user'),
	(14, 'Can change user', 4, 'change_user'),
	(15, 'Can delete user', 4, 'delete_user'),
	(16, 'Can view user', 4, 'view_user'),
	(17, 'Can add content type', 5, 'add_contenttype'),
	(18, 'Can change content type', 5, 'change_contenttype'),
	(19, 'Can delete content type', 5, 'delete_contenttype'),
	(20, 'Can view content type', 5, 'view_contenttype'),
	(21, 'Can add session', 6, 'add_session'),
	(22, 'Can change session', 6, 'change_session'),
	(23, 'Can delete session', 6, 'delete_session'),
	(24, 'Can view session', 6, 'view_session'),
	(25, 'Can add category', 7, 'add_category'),
	(26, 'Can change category', 7, 'change_category'),
	(27, 'Can delete category', 7, 'delete_category'),
	(28, 'Can view category', 7, 'view_category'),
	(29, 'Can add supplier', 8, 'add_supplier'),
	(30, 'Can change supplier', 8, 'change_supplier'),
	(31, 'Can delete supplier', 8, 'delete_supplier'),
	(32, 'Can view supplier', 8, 'view_supplier'),
	(33, 'Can add medicine', 9, 'add_medicine'),
	(34, 'Can change medicine', 9, 'change_medicine'),
	(35, 'Can delete medicine', 9, 'delete_medicine'),
	(36, 'Can view medicine', 9, 'view_medicine'),
	(37, 'Can add stock movement', 10, 'add_stockmovement'),
	(38, 'Can change stock movement', 10, 'change_stockmovement'),
	(39, 'Can delete stock movement', 10, 'delete_stockmovement'),
	(40, 'Can view stock movement', 10, 'view_stockmovement'),
	(41, 'Can add delivery note', 11, 'add_deliverynote'),
	(42, 'Can change delivery note', 11, 'change_deliverynote'),
	(43, 'Can delete delivery note', 11, 'delete_deliverynote'),
	(44, 'Can view delivery note', 11, 'view_deliverynote'),
	(45, 'Can add delivery note item', 12, 'add_deliverynoteitem'),
	(46, 'Can change delivery note item', 12, 'change_deliverynoteitem'),
	(47, 'Can delete delivery note item', 12, 'delete_deliverynoteitem'),
	(48, 'Can view delivery note item', 12, 'view_deliverynoteitem'),
	(49, 'Can add stock', 13, 'add_stock'),
	(50, 'Can change stock', 13, 'change_stock'),
	(51, 'Can delete stock', 13, 'delete_stock'),
	(52, 'Can view stock', 13, 'view_stock'),
	(53, 'Can delete validated delivery note', 11, 'delete_validated_deliverynote'),
	(54, 'Can add service', 14, 'add_service'),
	(55, 'Can change service', 14, 'change_service'),
	(56, 'Can delete service', 14, 'delete_service'),
	(57, 'Can view service', 14, 'view_service'),
	(58, 'Can add invoice', 15, 'add_invoice'),
	(59, 'Can change invoice', 15, 'change_invoice'),
	(60, 'Can delete invoice', 15, 'delete_invoice'),
	(61, 'Can view invoice', 15, 'view_invoice'),
	(62, 'Can delete validated invoice', 15, 'delete_validated_invoice'),
	(63, 'Can add invoice item', 16, 'add_invoiceitem'),
	(64, 'Can change invoice item', 16, 'change_invoiceitem'),
	(65, 'Can delete invoice item', 16, 'delete_invoiceitem'),
	(66, 'Can view invoice item', 16, 'view_invoiceitem');

-- Dumping data for table medstock.auth_user: ~2 rows (approximately)
DELETE FROM `auth_user`;
INSERT INTO `auth_user` (`id`, `password`, `last_login`, `is_superuser`, `username`, `first_name`, `last_name`, `email`, `is_staff`, `is_active`, `date_joined`) VALUES
	(1, 'pbkdf2_sha256$600000$2HczIVS2NFuN4AReDPQNEF$t9mA7MU5+AojSi+Ek7tJyczMfB704txO0mmD5zYtkZc=', '2026-02-02 19:46:25.756838', 1, 'admin', '', '', 'admin@gmail.com', 1, 1, '2025-11-12 11:53:39.256178'),
	(2, 'pbkdf2_sha256$600000$Xnbjd6eE7Nn8sQHEy9tbG4$zIryVKyxxICRlujIl9GkvFDr9dIBy5ffmSkm9XH4WAU=', NULL, 0, 'storekeeper', '', '', '', 0, 1, '2026-02-02 19:43:01.000000');

-- Dumping data for table medstock.auth_user_groups: ~2 rows (approximately)
DELETE FROM `auth_user_groups`;
INSERT INTO `auth_user_groups` (`id`, `user_id`, `group_id`) VALUES
	(1, 1, 1),
	(2, 2, 2);

-- Dumping data for table medstock.auth_user_user_permissions: ~36 rows (approximately)
DELETE FROM `auth_user_user_permissions`;
INSERT INTO `auth_user_user_permissions` (`id`, `user_id`, `permission_id`) VALUES
	(33, 2, 1),
	(34, 2, 2),
	(35, 2, 3),
	(36, 2, 4),
	(5, 2, 17),
	(6, 2, 18),
	(7, 2, 19),
	(8, 2, 20),
	(9, 2, 25),
	(10, 2, 26),
	(11, 2, 27),
	(12, 2, 28),
	(43, 2, 29),
	(14, 2, 30),
	(15, 2, 31),
	(16, 2, 32),
	(37, 2, 33),
	(20, 2, 36),
	(21, 2, 37),
	(22, 2, 38),
	(23, 2, 39),
	(24, 2, 40),
	(38, 2, 41),
	(42, 2, 42),
	(39, 2, 43),
	(26, 2, 44),
	(27, 2, 45),
	(41, 2, 46),
	(40, 2, 47),
	(28, 2, 48),
	(47, 2, 58),
	(48, 2, 59),
	(50, 2, 61),
	(52, 2, 63),
	(44, 2, 64),
	(46, 2, 66);

-- Dumping data for table medstock.categories: ~4 rows (approximately)
DELETE FROM `categories`;
INSERT INTO `categories` (`id`, `name`, `description`, `type`, `created_at`) VALUES
	('5bda184ebd5841e999f0238cc307f35b', 'Antibiotiques', 'Médicaments antibiotiques', 'medicine', '2025-11-19 21:35:25.048176'),
	('685da11f6c59441ab0082924d30133b0', 'Matériel de pansement', 'Matériel pour les soins et pansements', 'material', '2025-11-19 21:35:25.057764'),
	('ad74fc6302264ee4bbdc1198febedd32', 'Vitamines', 'Compléments vitaminiques', 'medicine', '2025-11-19 21:35:25.062326'),
	('d8817ef4b5d04fd4a7e4c87726c75a37', 'Antidouleurs', 'Médicaments contre la douleur', 'medicine', '2025-11-19 21:35:25.052233');

-- Dumping data for table medstock.delivery_notes: ~4 rows (approximately)
DELETE FROM `delivery_notes`;
INSERT INTO `delivery_notes` (`id`, `number`, `date`, `reference`, `notes`, `status`, `total_value`, `created_at`, `supplier_id`) VALUES
	('31578ee6fbfd423992b6811a0e9d5598', 'BL-2026-02-0004', '2026-02-09', '2115616563', NULL, 'validated', 395.00, '2026-02-09 16:16:19.372809', '7c2e982ce77447e2b9ff8d1d05c83af3'),
	('83d16ad5aae94949a3b6bf311c908631', 'BL-2026-02-0003', '2026-01-23', '8888', NULL, 'validated', 90.00, '2026-02-04 19:22:07.574583', '522dd3e092234b2caa3c953fd3d3f7d7'),
	('8ff1fc3ef8e345649d708792300598c9', 'BL-2026-02-0001', '2026-01-06', '0448', NULL, 'validated', 582.50, '2026-02-04 19:20:50.977976', '2b9f533960404549a232c5d59aeb67d7'),
	('e617807e0852479fb75f2690e22fae9d', 'BL-2026-02-0002', '2026-01-20', '565555', NULL, 'validated', 273.84, '2026-02-04 19:21:39.741135', '2b9f533960404549a232c5d59aeb67d7');

-- Dumping data for table medstock.delivery_note_items: ~8 rows (approximately)
DELETE FROM `delivery_note_items`;
INSERT INTO `delivery_note_items` (`id`, `lot`, `expiration_date`, `quantity`, `unit_price`, `line_total`, `delivery_note_id`, `medicine_id`) VALUES
	('1d19c805b7c44c3ba3d16b3c5cd6b68f', '--', '2026-03-04', 4, 9.01, 36.04, 'e617807e0852479fb75f2690e22fae9d', 'ff467e092b06412e9ad751fab171a515'),
	('3687befd63b348c8a3197cab23e48a2e', '76', NULL, 51, 5.50, 280.50, '8ff1fc3ef8e345649d708792300598c9', 'c4cbf0ed9b5e44e5a28b8b093cded81e'),
	('4cc47b3e0886460ca22f663fbb8f46f0', '7777', NULL, 82, 2.90, 237.80, 'e617807e0852479fb75f2690e22fae9d', 'c7c57135ea01478fb4522b3df51b1595'),
	('51250e90a01445ea842542d1796f90eb', '23', '2026-02-26', 50, 5.50, 275.00, '31578ee6fbfd423992b6811a0e9d5598', '975cc9bd3bdc4c3eb113b79fea6b2069'),
	('a04c744d87f94f12b55755c9fbaa6fff', '23', '2026-03-04', 20, 6.00, 120.00, '31578ee6fbfd423992b6811a0e9d5598', 'a270e44792df458d998a79e90ab2877e'),
	('a44c206b20e741e093f6a3092b13466b', '-', '2026-04-23', 9, 10.00, 90.00, '83d16ad5aae94949a3b6bf311c908631', 'c7c57135ea01478fb4522b3df51b1595'),
	('b3f8410a6e1440708580768c9dc215ae', '555', '2026-03-20', 7, 6.00, 42.00, '8ff1fc3ef8e345649d708792300598c9', 'a270e44792df458d998a79e90ab2877e'),
	('e87b06de4cfc494384667207e1d88dbf', '666', '2027-01-25', 13, 20.00, 260.00, '8ff1fc3ef8e345649d708792300598c9', 'c7c57135ea01478fb4522b3df51b1595');

-- Dumping data for table medstock.django_admin_log: ~31 rows (approximately)
DELETE FROM `django_admin_log`;
INSERT INTO `django_admin_log` (`id`, `action_time`, `object_id`, `object_repr`, `action_flag`, `change_message`, `content_type_id`, `user_id`) VALUES
	(438, '2026-02-02 22:26:04.767298', '87bba646-38a9-4222-8355-10e03bd7fc08', 'S1', 1, '[{"added": {}}]', 14, 1),
	(439, '2026-02-02 22:26:11.647893', '89d69035-2151-4078-8916-960a924f5507', 'S2', 1, '[{"added": {}}]', 14, 1),
	(440, '2026-02-03 22:05:11.041869', '2880b56f-9d6c-4207-b3ee-d5f535c46468', 'entry - Tramadol 50mg - 10', 3, '', 10, 1),
	(441, '2026-02-03 22:05:11.044628', 'ed1b0212-2d9e-4522-8fcb-66e0f829abf7', 'exit - Tramadol 50mg - 5', 3, '', 10, 1),
	(442, '2026-02-03 22:05:11.046146', '21cee264-33ab-4979-b26c-084bc8456f78', 'entry - Tramadol 50mg - 12', 3, '', 10, 1),
	(443, '2026-02-03 22:05:17.991135', '10', 'Stock object (10)', 3, '', 13, 1),
	(444, '2026-02-03 22:05:17.993956', '12', 'Stock object (12)', 3, '', 13, 1),
	(445, '2026-02-03 22:06:06.329655', 'e4ec783b-d465-417d-961d-f3e7816b5364', 'Vitamine B Complexe Fort', 3, '', 9, 1),
	(446, '2026-02-03 22:06:06.331656', 'd7d344bf-729b-4382-a322-ddcd80eca70c', 'Vitamine B Complexe Fort', 3, '', 9, 1),
	(447, '2026-02-03 22:06:06.332658', 'b39934dd-d5d7-4e39-ad5f-e3885b9d2982', 'Vitamine B Complexe Fort', 3, '', 9, 1),
	(448, '2026-02-03 22:06:06.333658', '8b6da5f3-14c3-49e0-afc9-3e0ba74ef89b', 'Vitamine B Complexe Fort', 3, '', 9, 1),
	(449, '2026-02-03 22:06:06.335161', '6d5b94f6-bfb9-435c-872c-3124bd13d7e6', 'Vitamine B Complexe Fort', 3, '', 9, 1),
	(450, '2026-02-03 22:06:06.336166', '532fce8c-221a-4f61-a955-7decde6b2266', 'Vitamine B Complexe Fort', 3, '', 9, 1),
	(451, '2026-02-03 22:06:06.338166', '4d3157f4-95fd-48ac-84d7-247f041bf0c5', 'Vitamine B Complexe Fort', 3, '', 9, 1),
	(452, '2026-02-03 22:06:06.339362', '35d362c7-124b-4634-bba6-1c561c8d8509', 'Vitamine B Complexe Fort', 3, '', 9, 1),
	(453, '2026-02-03 22:06:17.056467', 'd5a5d2c7-3b2b-449f-978a-bf6e8ecda955', 'Vitamine C 1g', 3, '', 9, 1),
	(454, '2026-02-03 22:06:17.057995', 'baa712b5-2de0-4b18-b979-040236d4b987', 'Vitamine C 1g', 3, '', 9, 1),
	(455, '2026-02-03 22:06:17.059000', 'a7bdc653-d63e-4061-844f-00f567a5c4f6', 'Vitamine C 1g', 3, '', 9, 1),
	(456, '2026-02-03 22:06:17.060005', '946d86f1-01a3-4a51-b770-342c39b2ad4d', 'Vitamine C 1g', 3, '', 9, 1),
	(457, '2026-02-03 22:06:17.062005', '85f79489-fcf8-4944-91db-8d10ef78478e', 'Vitamine C 1g', 3, '', 9, 1),
	(458, '2026-02-03 22:06:17.063005', '4f11a29a-8cbe-4e2a-99bb-6b042971b2b2', 'Vitamine C 1g', 3, '', 9, 1),
	(459, '2026-02-03 22:06:17.065006', '3d4faa31-30e0-4876-8fbe-8a948b095c69', 'Vitamine C 1g', 3, '', 9, 1),
	(460, '2026-02-03 22:06:25.931781', '609e427e-b365-49a1-a666-b7113ab4a9d4', 'Tramadol 50mg', 3, '', 9, 1),
	(461, '2026-02-03 22:06:55.058415', '02dffb26-943c-4bba-b3c8-34e5d06f79a5', 'Seringues stériles 3ml', 3, '', 9, 1),
	(462, '2026-02-03 22:06:55.060545', '10e7cf8a-232a-4a13-9b22-4d90075400f6', 'Seringues stériles 5ml', 3, '', 9, 1),
	(463, '2026-02-03 22:56:27.633063', '2', 'storekeeper', 2, '[{"changed": {"fields": ["User permissions"]}}]', 4, 1),
	(464, '2026-02-04 19:46:45.667565', '2', 'storekeeper', 2, '[{"changed": {"fields": ["User permissions"]}}]', 4, 1),
	(465, '2026-02-04 19:48:15.853100', '2', 'storekeeper', 2, '[{"changed": {"fields": ["User permissions"]}}]', 4, 1),
	(466, '2026-02-04 19:49:02.882610', '2', 'storekeeper', 2, '[{"changed": {"fields": ["User permissions"]}}]', 4, 1),
	(467, '2026-02-09 16:21:23.341847', '2', 'storekeeper', 2, '[{"changed": {"fields": ["User permissions"]}}]', 4, 1),
	(468, '2026-02-09 16:22:38.676483', '2', 'storekeeper', 2, '[{"changed": {"fields": ["User permissions"]}}]', 4, 1);

-- Dumping data for table medstock.django_content_type: ~16 rows (approximately)
DELETE FROM `django_content_type`;
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES
	(1, 'admin', 'logentry'),
	(3, 'auth', 'group'),
	(2, 'auth', 'permission'),
	(4, 'auth', 'user'),
	(5, 'contenttypes', 'contenttype'),
	(7, 'inventory', 'category'),
	(11, 'inventory', 'deliverynote'),
	(12, 'inventory', 'deliverynoteitem'),
	(15, 'inventory', 'invoice'),
	(16, 'inventory', 'invoiceitem'),
	(9, 'inventory', 'medicine'),
	(14, 'inventory', 'service'),
	(13, 'inventory', 'stock'),
	(10, 'inventory', 'stockmovement'),
	(8, 'inventory', 'supplier'),
	(6, 'sessions', 'session');

-- Dumping data for table medstock.django_migrations: ~25 rows (approximately)
DELETE FROM `django_migrations`;
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES
	(1, 'contenttypes', '0001_initial', '2025-11-12 11:53:06.944816'),
	(2, 'auth', '0001_initial', '2025-11-12 11:53:07.409490'),
	(3, 'admin', '0001_initial', '2025-11-12 11:53:07.480514'),
	(4, 'admin', '0002_logentry_remove_auto_add', '2025-11-12 11:53:07.490741'),
	(5, 'admin', '0003_logentry_add_action_flag_choices', '2025-11-12 11:53:07.496782'),
	(6, 'contenttypes', '0002_remove_content_type_name', '2025-11-12 11:53:07.545898'),
	(7, 'auth', '0002_alter_permission_name_max_length', '2025-11-12 11:53:07.584827'),
	(8, 'auth', '0003_alter_user_email_max_length', '2025-11-12 11:53:07.606087'),
	(9, 'auth', '0004_alter_user_username_opts', '2025-11-12 11:53:07.610776'),
	(10, 'auth', '0005_alter_user_last_login_null', '2025-11-12 11:53:07.649162'),
	(11, 'auth', '0006_require_contenttypes_0002', '2025-11-12 11:53:07.652731'),
	(12, 'auth', '0007_alter_validators_add_error_messages', '2025-11-12 11:53:07.655788'),
	(13, 'auth', '0008_alter_user_username_max_length', '2025-11-12 11:53:07.695764'),
	(14, 'auth', '0009_alter_user_last_name_max_length', '2025-11-12 11:53:07.729703'),
	(15, 'auth', '0010_alter_group_name_max_length', '2025-11-12 11:53:07.745897'),
	(16, 'auth', '0011_update_proxy_permissions', '2025-11-12 11:53:07.751560'),
	(17, 'auth', '0012_alter_user_first_name_max_length', '2025-11-12 11:53:07.784536'),
	(18, 'inventory', '0001_initial', '2025-11-12 11:53:07.995935'),
	(19, 'sessions', '0001_initial', '2025-11-12 11:53:08.014650'),
	(20, 'inventory', '0002_deliverynote_deliverynoteitem', '2026-01-23 20:55:17.096434'),
	(21, 'inventory', '0003_stock_and_remove_medicine_fields', '2026-01-24 11:25:04.477554'),
	(22, 'inventory', '0004_rename_stock_medicin_5da35c_idx_stock_medicin_a69fec_idx_and_more', '2026-01-24 11:25:04.496656'),
	(23, 'inventory', '0005_deliverynote_permissions', '2026-02-02 21:09:43.103145'),
	(24, 'inventory', '0006_service_and_stockmovement_price', '2026-02-02 22:23:47.584533'),
	(25, 'inventory', '0007_invoice_models', '2026-02-03 22:55:28.043018');

-- Dumping data for table medstock.django_session: ~2 rows (approximately)
DELETE FROM `django_session`;
INSERT INTO `django_session` (`session_key`, `session_data`, `expire_date`) VALUES
	('6y0d4xogmkb1ow3rcfi6sadxp2i5ff7n', '.eJxVjEEOgjAQRe_StWmcAtPBpXvO0EynU0FNSSisjHdXEha6_e-9_zKBt3UMW9UlTMlcDJjT7xZZHlp2kO5cbrOVuazLFO2u2INWO8xJn9fD_TsYuY7fuhVA3zLGXvo-IrrmjCquy5A8CVFioESN-hyFs1Mgr5ob7MhpKwjm_QHilTgf:1vmzsP:4NaB8D1SEkQw06NXJEI197X5VQxLro0OcrG_vmpPw0Q', '2026-02-16 19:46:25.758970'),
	('h6bdlu513hmkpvwt9jjg3ifrlij1eztw', '.eJxVjE0OwiAYBe_C2hAQQXDp3jOQ7w-pGpqUdmW8uyHpQrdvZt5bZdjWmrcuS55YXZRVh98NgZ7SBuAHtPusaW7rMqEeit5p17eZ5XXd3b-DCr2O2iQfkwmliFgMcgbwEV0phtzRoY2B8GQwUUyRiwXvgITZkyUGNEV9vgCuOUs:1vJ9Qq:Az_mMwuKcZB9ZB4tnIqeQHdqJIFKL2_3y5Mu0wxRs5Y', '2025-11-26 11:54:36.374025');

-- Dumping data for table medstock.invoices: ~2 rows (approximately)
DELETE FROM `invoices`;
INSERT INTO `invoices` (`id`, `number`, `date`, `date_start`, `date_end`, `notes`, `status`, `total_value`, `created_at`, `updated_at`, `supplier_id`) VALUES
	('aa89c0787716472ca9fd397d1b15b7ac', 'FA-2026-02-0001', '2026-02-04', '2026-01-01', '2026-01-31', NULL, 'validated', 856.34, '2026-02-04 19:48:32.867381', '2026-02-04 19:48:32.867381', '2b9f533960404549a232c5d59aeb67d7'),
	('f6351d6fa78d47aca39c0a7948d84445', 'FA-2026-02-0002', '2026-02-09', '2026-02-01', '2026-02-28', NULL, 'validated', 395.00, '2026-02-09 16:17:55.001304', '2026-02-09 16:17:55.001304', '7c2e982ce77447e2b9ff8d1d05c83af3');

-- Dumping data for table medstock.invoice_items: ~7 rows (approximately)
DELETE FROM `invoice_items`;
INSERT INTO `invoice_items` (`id`, `lot`, `expiration_date`, `quantity`, `unit_price`, `line_total`, `delivery_note_id`, `invoice_id`, `medicine_id`) VALUES
	('3601184bcc904f9fa10fd99e4b5192f8', '23', '2026-02-26', 50, 5.50, 275.00, '31578ee6fbfd423992b6811a0e9d5598', 'f6351d6fa78d47aca39c0a7948d84445', '975cc9bd3bdc4c3eb113b79fea6b2069'),
	('58322d16fd4d4d7aae1787395f243c26', '7777', NULL, 82, 2.90, 237.80, 'e617807e0852479fb75f2690e22fae9d', 'aa89c0787716472ca9fd397d1b15b7ac', 'c7c57135ea01478fb4522b3df51b1595'),
	('82578594e2f046bda82b76285b45580f', '23', '2026-03-04', 20, 6.00, 120.00, '31578ee6fbfd423992b6811a0e9d5598', 'f6351d6fa78d47aca39c0a7948d84445', 'a270e44792df458d998a79e90ab2877e'),
	('97a5fd11bbde488e90ac7c0734a25b52', '76', NULL, 51, 5.50, 280.50, '8ff1fc3ef8e345649d708792300598c9', 'aa89c0787716472ca9fd397d1b15b7ac', 'c4cbf0ed9b5e44e5a28b8b093cded81e'),
	('c83f0e876cd84f539563b15d008fd171', '555', '2026-03-20', 7, 6.00, 42.00, '8ff1fc3ef8e345649d708792300598c9', 'aa89c0787716472ca9fd397d1b15b7ac', 'a270e44792df458d998a79e90ab2877e'),
	('e8289836b04a426e9409b2a4a1a80770', '666', '2027-01-25', 13, 20.00, 260.00, '8ff1fc3ef8e345649d708792300598c9', 'aa89c0787716472ca9fd397d1b15b7ac', 'c7c57135ea01478fb4522b3df51b1595'),
	('f084ea13d8e84245885e5015ae89e624', '--', '2026-03-04', 4, 9.01, 36.04, 'e617807e0852479fb75f2690e22fae9d', 'aa89c0787716472ca9fd397d1b15b7ac', 'ff467e092b06412e9ad751fab171a515');

-- Dumping data for table medstock.medicines: ~38 rows (approximately)
DELETE FROM `medicines`;
INSERT INTO `medicines` (`id`, `name`, `barcode`, `description`, `unit`, `min_stock_level`, `batch_number`, `location`, `created_at`, `updated_at`, `category_id`, `supplier_id`) VALUES
	('044a7383fae94f43906483f45b23fc99', 'Vitamine B Complexe Extra Fort', '4407262094779', NULL, 'boite', 10, 'B3217', NULL, '2025-11-19 21:35:26.012402', '2025-11-19 21:35:28.924505', 'ad74fc6302264ee4bbdc1198febedd32', '2b9f533960404549a232c5d59aeb67d7'),
	('05a90f193dd3406dbffe2ee05ef128fb', 'Vitamine B Complexe Fort', '3603414344397', NULL, 'boite', 10, 'B8878', NULL, '2025-11-19 21:35:25.568813', '2025-11-19 21:35:26.912275', 'ad74fc6302264ee4bbdc1198febedd32', '7c2e982ce77447e2b9ff8d1d05c83af3'),
	('0e26c19335bb4377a05d3211ff702fca', 'Amoxicilline 1g', '4752939245928', NULL, 'boite', 9, 'B6693', NULL, '2025-11-19 21:35:25.679166', '2025-11-19 21:40:45.681326', '5bda184ebd5841e999f0238cc307f35b', '2b9f533960404549a232c5d59aeb67d7'),
	('1ce3cebb5c564771a741720e6c0d0629', 'Tramadol 100mg', '3848149785806', NULL, 'boite', 9, 'B4186', NULL, '2025-11-19 21:35:25.775925', '2025-11-19 21:35:27.400978', 'd8817ef4b5d04fd4a7e4c87726c75a37', '2b9f533960404549a232c5d59aeb67d7'),
	('3f77073f6b1b4d24ad271aa7636157a1', 'Seringues stériles 3ml', '2063983451220', NULL, 'pièce', 60, 'B8987', NULL, '2025-11-19 21:35:25.563470', '2025-11-19 21:35:26.902445', '685da11f6c59441ab0082924d30133b0', '7c2e982ce77447e2b9ff8d1d05c83af3'),
	('41124b8bf8ca4df3909b9117dc532e0d', 'Seringues stériles 1ml', '2427839328975', NULL, 'pièce', 60, 'B8949', NULL, '2025-11-19 21:35:25.997923', '2025-11-19 21:35:28.810420', '685da11f6c59441ab0082924d30133b0', '7c2e982ce77447e2b9ff8d1d05c83af3'),
	('4960de9916b74cce8d9279fe3e4e8867', 'Gants stériles XL', '5634939596369', NULL, 'paire', 90, 'B6201', NULL, '2025-11-19 21:35:25.762543', '2025-11-19 21:35:27.307977', '685da11f6c59441ab0082924d30133b0', '2b9f533960404549a232c5d59aeb67d7'),
	('53679d545dbe4728897bb10006292b1a', 'Seringues stériles 10ml', '4602097039762', NULL, 'pièce', 60, 'B3900', NULL, '2025-11-19 21:35:25.748069', '2025-11-19 21:35:27.258115', '685da11f6c59441ab0082924d30133b0', '2b9f533960404549a232c5d59aeb67d7'),
	('75967129bb7240ef872e06e55dd1ba66', 'Tramadol 50mg', '1998102978414', NULL, 'boite', 9, 'B3169', NULL, '2025-11-19 21:35:25.394664', '2025-11-19 21:35:26.623984', 'd8817ef4b5d04fd4a7e4c87726c75a37', '2b9f533960404549a232c5d59aeb67d7'),
	('828279740e3b42e6b045d6ac72f5b984', 'Vitamine C 250mg', '2858800347439', NULL, 'boite', 12, 'B2914', NULL, '2025-11-19 21:35:25.982355', '2025-11-19 21:35:28.708019', 'ad74fc6302264ee4bbdc1198febedd32', '2b9f533960404549a232c5d59aeb67d7'),
	('8f4561e244354687a4e6a302c7c28967', 'Vitamine C 500mg', '9329922734909', NULL, 'boite', 9, 'B7620', NULL, '2025-11-19 21:35:25.102277', '2026-02-02 21:22:12.128224', 'ad74fc6302264ee4bbdc1198febedd32', '522dd3e092234b2caa3c953fd3d3f7d7'),
	('975cc9bd3bdc4c3eb113b79fea6b2069', 'Gants stériles M', '6414455880157', NULL, 'paire', 90, 'B5267', NULL, '2025-11-19 21:35:25.962168', '2025-11-19 21:35:28.572240', '685da11f6c59441ab0082924d30133b0', '2b9f533960404549a232c5d59aeb67d7'),
	('9a998c13aefe4275b0912df9462e94db', 'Diclofénac 75mg', '3669151798031', NULL, 'boite', 9, 'B2990', NULL, '2025-11-19 21:35:25.487568', '2025-11-19 21:35:26.781095', 'd8817ef4b5d04fd4a7e4c87726c75a37', '7c2e982ce77447e2b9ff8d1d05c83af3'),
	('a270e44792df458d998a79e90ab2877e', 'Doxycycline 50mg', '2308636021100', NULL, 'boite', 6, 'B3201', NULL, '2025-11-19 21:35:25.862264', '2025-11-19 21:35:27.957888', '5bda184ebd5841e999f0238cc307f35b', '7c2e982ce77447e2b9ff8d1d05c83af3'),
	('b471eb5bacca4ecf8b9ff29eac06ce04', 'Vitamine D3 400UI', '1932331825243', NULL, 'flacon', 9, 'B6928', NULL, '2025-11-19 21:35:25.125914', '2025-11-19 21:35:26.112472', 'ad74fc6302264ee4bbdc1198febedd32', '522dd3e092234b2caa3c953fd3d3f7d7'),
	('c4cbf0ed9b5e44e5a28b8b093cded81e', 'Compresses stériles 10x10', '3291429442963', NULL, 'sachet', 30, 'B1137', NULL, '2025-11-19 21:35:25.542635', '2025-11-19 21:35:26.872564', '685da11f6c59441ab0082924d30133b0', '522dd3e092234b2caa3c953fd3d3f7d7'),
	('c7c57135ea01478fb4522b3df51b1595', 'Ibuprofène 200mg', '4028228421854', NULL, 'boite', 12, 'B2154', NULL, '2025-11-19 21:35:26.010391', '2025-11-19 21:35:28.892952', 'd8817ef4b5d04fd4a7e4c87726c75a37', '7c2e982ce77447e2b9ff8d1d05c83af3'),
	('cec1419bba0b4fdc856c06e56f0c2c38', 'Azithromycine 250mg', '8956207163029', NULL, 'boite', 6, 'B8921', NULL, '2025-11-19 21:35:25.362260', '2025-11-19 21:35:26.570804', '5bda184ebd5841e999f0238cc307f35b', '2b9f533960404549a232c5d59aeb67d7'),
	('d2f52858f7c54a0a8403240c05eef336', 'Doxycycline 100mg', '7535657726992', NULL, 'boite', 6, 'B4871', NULL, '2025-11-19 21:35:25.982355', '2025-11-19 21:35:28.718296', '5bda184ebd5841e999f0238cc307f35b', '2b9f533960404549a232c5d59aeb67d7'),
	('d768856c11f441d39638796d09e9d713', 'Vitamine D3 1000UI', '7572008117872', NULL, 'flacon', 9, 'B9110', NULL, '2025-11-19 21:35:25.719405', '2025-11-19 21:35:27.126275', 'ad74fc6302264ee4bbdc1198febedd32', '522dd3e092234b2caa3c953fd3d3f7d7'),
	('decc2a47627c42f892362aadcfb3753a', 'Vitamine D3 2000UI', '9634499742038', NULL, 'flacon', 9, 'B7000', NULL, '2025-11-19 21:35:25.210303', '2025-11-19 21:35:26.292180', 'ad74fc6302264ee4bbdc1198febedd32', '7c2e982ce77447e2b9ff8d1d05c83af3'),
	('e6b0179d7c9d402281803725eddc0f7f', 'Ibuprofène 600mg', '5989102887105', NULL, 'boite', 12, 'B1243', NULL, '2025-11-19 21:35:25.300527', '2025-11-19 21:35:26.468621', 'd8817ef4b5d04fd4a7e4c87726c75a37', '522dd3e092234b2caa3c953fd3d3f7d7'),
	('e85ada0902b34f229dd201a3d4413fd8', 'Diclofénac 25mg', '8572703263117', NULL, 'boite', 9, 'B4636', NULL, '2025-11-19 21:35:25.447867', '2025-11-19 21:35:26.709376', 'd8817ef4b5d04fd4a7e4c87726c75a37', '2b9f533960404549a232c5d59aeb67d7'),
	('ec9ba0a7e66645d193417b3bb169fc28', 'Amoxicilline 500mg', '9807006417785', NULL, 'boite', 9, 'B8535', NULL, '2025-11-19 21:35:25.204013', '2025-11-19 21:35:26.281043', '5bda184ebd5841e999f0238cc307f35b', '522dd3e092234b2caa3c953fd3d3f7d7'),
	('ecc9142cb32c41cc81949194ba11481d', 'Paracétamol 1g', '9814115399730', NULL, 'boite', 15, 'B4590', NULL, '2025-11-19 21:35:25.742802', '2025-11-19 21:35:27.232509', 'd8817ef4b5d04fd4a7e4c87726c75a37', '7c2e982ce77447e2b9ff8d1d05c83af3'),
	('ece2da5c8ed749959ad044b42426eebd', 'Ibuprofène 400mg', '6570454623005', NULL, 'boite', 12, 'B8320', NULL, '2025-11-19 21:35:25.642458', '2025-11-19 21:35:27.024088', 'd8817ef4b5d04fd4a7e4c87726c75a37', '2b9f533960404549a232c5d59aeb67d7'),
	('ed013d13594b40d88030b9c543f11d66', 'Pansements adhésifs Grand', '6830168807334', NULL, 'boite', 15, 'B6429', NULL, '2025-11-19 21:35:25.782868', '2025-11-19 21:35:27.442869', '685da11f6c59441ab0082924d30133b0', '2b9f533960404549a232c5d59aeb67d7'),
	('ee1dfc43862d49b796c5a3d70c54533b', 'Azithromycine 500mg', '1296938386168', NULL, 'boite', 6, 'B9630', NULL, '2025-11-19 21:35:25.801156', '2025-11-19 21:35:27.552278', '5bda184ebd5841e999f0238cc307f35b', '2b9f533960404549a232c5d59aeb67d7'),
	('effd6bb1b4514ec8a0f45601e3c616d3', 'Gants stériles L', '5272956172590', NULL, 'paire', 90, 'B5970', NULL, '2025-11-19 21:35:25.902138', '2025-11-19 21:35:28.196670', '685da11f6c59441ab0082924d30133b0', '7c2e982ce77447e2b9ff8d1d05c83af3'),
	('f1782ced9175446d8fba39ee35b86c26', 'Compresses stériles 5x5', '9846410045377', NULL, 'sachet', 30, 'B1704', NULL, '2025-11-19 21:35:25.726032', '2025-11-19 21:35:27.164268', '685da11f6c59441ab0082924d30133b0', '522dd3e092234b2caa3c953fd3d3f7d7'),
	('f24d68adaf734d2da451b475d31469c9', 'Vitamine C 1g', '6263302153968', NULL, 'boite', 12, 'B7989', NULL, '2025-11-19 21:35:25.626362', '2025-11-19 21:35:27.002206', 'ad74fc6302264ee4bbdc1198febedd32', '522dd3e092234b2caa3c953fd3d3f7d7'),
	('f39a0dd031fb4618959599b6e9d047d7', 'Paracétamol 500mg', '2596031277407', NULL, 'boite', 15, 'B2480', NULL, '2025-11-19 21:35:25.782868', '2025-11-19 21:35:27.464222', 'd8817ef4b5d04fd4a7e4c87726c75a37', '522dd3e092234b2caa3c953fd3d3f7d7'),
	('f3b24f75b4564a6aabbfa52cfd389c0c', 'Ciprofloxacine 750mg', '1084934959523', NULL, 'boite', 7, 'B9470', NULL, '2025-11-19 21:35:26.037344', '2025-11-19 21:35:29.075296', '5bda184ebd5841e999f0238cc307f35b', '7c2e982ce77447e2b9ff8d1d05c83af3'),
	('f54ca819e5e14343bd0ee216e99aa82d', 'Compresses stériles 20x20', '2823407168142', NULL, 'sachet', 30, 'B3142', NULL, '2025-11-19 21:35:26.007841', '2025-11-19 21:35:28.881108', '685da11f6c59441ab0082924d30133b0', '522dd3e092234b2caa3c953fd3d3f7d7'),
	('f6034deea6384857af89183e5ed98025', 'Pansements adhésifs Moyen', '4998775719486', NULL, 'boite', 15, 'B1367', NULL, '2025-11-19 21:35:25.976344', '2025-11-19 21:35:28.676092', '685da11f6c59441ab0082924d30133b0', '7c2e982ce77447e2b9ff8d1d05c83af3'),
	('f8c3ea4245554398bb9152ca26f3a81c', 'Pansements adhésifs Petit', '3588155324243', NULL, 'boite', 15, 'B5250', NULL, '2025-11-19 21:35:25.852193', '2025-11-19 21:35:27.887534', '685da11f6c59441ab0082924d30133b0', '2b9f533960404549a232c5d59aeb67d7'),
	('fa23a76d62d54808b193cd20d869aa2e', 'Ciprofloxacine 250mg', '8506510614051', NULL, 'boite', 7, 'B9322', NULL, '2025-11-19 21:35:25.988693', '2025-11-19 21:35:28.748079', '5bda184ebd5841e999f0238cc307f35b', '2b9f533960404549a232c5d59aeb67d7'),
	('ff467e092b06412e9ad751fab171a515', 'Gants stériles S', '5595356131952', NULL, 'paire', 90, 'B8510', NULL, '2025-11-19 21:35:25.960155', '2025-11-19 21:35:28.552330', '685da11f6c59441ab0082924d30133b0', '522dd3e092234b2caa3c953fd3d3f7d7');

-- Dumping data for table medstock.services: ~2 rows (approximately)
DELETE FROM `services`;
INSERT INTO `services` (`id`, `name`, `etage`, `note`, `created_at`) VALUES
	('87bba64638a94222835510e03bd7fc08', 'S1', 'A0', '', '2026-02-02 22:26:04.766298'),
	('89d69035215140788916960a924f5507', 'S2', 'A1', '', '2026-02-02 22:26:11.647893');

-- Dumping data for table medstock.stock: ~6 rows (approximately)
DELETE FROM `stock`;
INSERT INTO `stock` (`id`, `quantity`, `expiration_date`, `location`, `created_at`, `medicine_id`) VALUES
	(13, 9, '2026-04-23', NULL, '2026-02-04 19:22:10.962912', 'c7c57135ea01478fb4522b3df51b1595'),
	(14, 4, '2026-03-04', NULL, '2026-02-04 19:22:11.502321', 'ff467e092b06412e9ad751fab171a515'),
	(15, 7, '2026-03-20', NULL, '2026-02-04 19:22:12.090822', 'a270e44792df458d998a79e90ab2877e'),
	(16, 13, '2027-01-25', NULL, '2026-02-04 19:22:12.096869', 'c7c57135ea01478fb4522b3df51b1595'),
	(17, 20, '2026-03-04', NULL, '2026-02-09 16:16:36.546658', 'a270e44792df458d998a79e90ab2877e'),
	(18, 50, '2026-02-26', NULL, '2026-02-09 16:16:36.553173', '975cc9bd3bdc4c3eb113b79fea6b2069');

-- Dumping data for table medstock.stock_movements: ~8 rows (approximately)
DELETE FROM `stock_movements`;
INSERT INTO `stock_movements` (`id`, `type`, `quantity`, `reference`, `notes`, `movement_date`, `created_at`, `medicine_id`, `service_id`, `unit_price`) VALUES
	('0e24d0eff73241a696ed90759e7708ff', 'entry', 82, 'BL BL-2026-02-0002', '', '2026-02-04 19:22:11.505326', '2026-02-04 19:22:11.505326', 'c7c57135ea01478fb4522b3df51b1595', NULL, 2.90),
	('2d4d09d9e162427aa00ce158d18e9997', 'entry', 9, 'BL BL-2026-02-0003', '', '2026-02-04 19:22:10.957872', '2026-02-04 19:22:10.957872', 'c7c57135ea01478fb4522b3df51b1595', NULL, 10.00),
	('5dbe0959976644498b4ad7e0b03f192d', 'entry', 4, 'BL BL-2026-02-0002', '', '2026-02-04 19:22:11.499814', '2026-02-04 19:22:11.499814', 'ff467e092b06412e9ad751fab171a515', NULL, 9.01),
	('96249c1ea777467695710e093d8fbb0c', 'entry', 20, 'BL BL-2026-02-0004', '', '2026-02-09 16:16:36.543660', '2026-02-09 16:16:36.544659', 'a270e44792df458d998a79e90ab2877e', NULL, 6.00),
	('aa6e0fcab5d34f998f358b30db57dfab', 'entry', 51, 'BL BL-2026-02-0001', '', '2026-02-04 19:22:12.086824', '2026-02-04 19:22:12.086824', 'c4cbf0ed9b5e44e5a28b8b093cded81e', NULL, 5.50),
	('b57cf35e99ec4331adff0c79b60b3bf8', 'entry', 7, 'BL BL-2026-02-0001', '', '2026-02-04 19:22:12.088822', '2026-02-04 19:22:12.088822', 'a270e44792df458d998a79e90ab2877e', NULL, 6.00),
	('ea2ff0ba593a401fafd6caca33f79f16', 'entry', 50, 'BL BL-2026-02-0004', '', '2026-02-09 16:16:36.550174', '2026-02-09 16:16:36.550174', '975cc9bd3bdc4c3eb113b79fea6b2069', NULL, 5.50),
	('f1498df4708540ecbdf7aa67a1f76613', 'entry', 13, 'BL BL-2026-02-0001', '', '2026-02-04 19:22:12.094337', '2026-02-04 19:22:12.094337', 'c7c57135ea01478fb4522b3df51b1595', NULL, 20.00);

-- Dumping data for table medstock.suppliers: ~3 rows (approximately)
DELETE FROM `suppliers`;
INSERT INTO `suppliers` (`id`, `name`, `contact_person`, `email`, `phone`, `address`, `created_at`) VALUES
	('2b9f533960404549a232c5d59aeb67d7', 'LaboPharma', 'Pierre Durand', 'contact@labopharma.com', '0634567890', NULL, '2025-11-19 21:35:25.076222'),
	('522dd3e092234b2caa3c953fd3d3f7d7', 'MediCare', 'Marie Martin', 'contact@medicare.com', '0623456789', NULL, '2025-11-19 21:35:25.072610'),
	('7c2e982ce77447e2b9ff8d1d05c83af3', 'PharmaPlus', 'Jean Dupont', 'contact@pharmaplus.com', '0612345678', NULL, '2025-11-19 21:35:25.068005');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
