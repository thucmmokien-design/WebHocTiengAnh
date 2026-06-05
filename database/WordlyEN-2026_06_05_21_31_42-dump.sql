-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: testdb
-- ------------------------------------------------------
-- Server version	8.4.8

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `achievements`
--

DROP TABLE IF EXISTS `achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `achievements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `achievement_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `unlocked_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `achievements_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `achievements`
--

LOCK TABLES `achievements` WRITE;
/*!40000 ALTER TABLE `achievements` DISABLE KEYS */;
/*!40000 ALTER TABLE `achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `studysessions`
--

DROP TABLE IF EXISTS `studysessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `studysessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `session_type` enum('FLASHCARD','MULTIPLE_CHOICE','LISTENING') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_questions` int NOT NULL,
  `correct_answers` int NOT NULL,
  `score` int DEFAULT '0',
  `started_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `completed_at` datetime DEFAULT NULL,
  `set_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `studysessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `studysessions`
--

LOCK TABLES `studysessions` WRITE;
/*!40000 ALTER TABLE `studysessions` DISABLE KEYS */;
INSERT INTO `studysessions` VALUES (29,18,'FLASHCARD',10,1,10,'2026-06-05 08:52:12','2026-06-05 08:52:12',1),(30,18,'FLASHCARD',10,9,90,'2026-06-05 09:01:09','2026-06-05 09:01:09',2),(31,18,'FLASHCARD',10,0,0,'2026-06-05 09:07:01','2026-06-05 09:07:01',3),(36,18,'FLASHCARD',10,7,70,'2026-06-05 10:38:48','2026-06-05 10:38:48',3),(37,18,'FLASHCARD',1,1,100,'2026-06-05 10:38:57','2026-06-05 10:38:57',16);
/*!40000 ALTER TABLE `studysessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userprogress`
--

DROP TABLE IF EXISTS `userprogress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userprogress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `word_id` int NOT NULL,
  `status` enum('NEW','LEARNING','REVIEWING','MASTERED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'NEW',
  `memory_level` int DEFAULT '0',
  `next_review_date` datetime DEFAULT NULL,
  `last_reviewed_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_word_unique` (`user_id`,`word_id`),
  KEY `word_id` (`word_id`),
  CONSTRAINT `userprogress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `userprogress_ibfk_2` FOREIGN KEY (`word_id`) REFERENCES `words` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=271 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userprogress`
--

LOCK TABLES `userprogress` WRITE;
/*!40000 ALTER TABLE `userprogress` DISABLE KEYS */;
INSERT INTO `userprogress` VALUES (220,18,1,'REVIEWING',1,'2026-06-07 08:52:12','2026-06-05 08:52:12','2026-06-05 07:49:45'),(221,18,2,'LEARNING',1,'2026-06-06 08:52:12','2026-06-05 08:52:12','2026-06-05 07:49:45'),(222,18,3,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(223,18,4,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(224,18,5,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(225,18,6,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(226,18,7,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(227,18,8,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(228,18,9,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(229,18,10,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(230,18,11,'REVIEWING',1,'2026-06-07 09:01:09','2026-06-05 09:01:09','2026-06-05 07:49:45'),(231,18,12,'REVIEWING',1,'2026-06-07 09:01:09','2026-06-05 09:01:09','2026-06-05 07:49:45'),(232,18,13,'REVIEWING',1,'2026-06-07 09:01:09','2026-06-05 09:01:09','2026-06-05 07:49:45'),(233,18,14,'REVIEWING',1,'2026-06-07 09:01:09','2026-06-05 09:01:09','2026-06-05 07:49:45'),(234,18,15,'REVIEWING',1,'2026-06-07 09:01:09','2026-06-05 09:01:09','2026-06-05 07:49:45'),(235,18,16,'REVIEWING',1,'2026-06-07 09:01:09','2026-06-05 09:01:09','2026-06-05 07:49:45'),(236,18,17,'REVIEWING',1,'2026-06-07 09:01:09','2026-06-05 09:01:09','2026-06-05 07:49:45'),(237,18,18,'REVIEWING',1,'2026-06-07 09:01:09','2026-06-05 09:01:09','2026-06-05 07:49:45'),(238,18,19,'REVIEWING',1,'2026-06-07 09:01:09','2026-06-05 09:01:09','2026-06-05 07:49:45'),(239,18,20,'LEARNING',1,'2026-06-06 09:01:09','2026-06-05 09:01:09','2026-06-05 07:49:45'),(240,18,21,'LEARNING',1,'2026-06-06 10:38:48','2026-06-05 10:38:48','2026-06-05 07:49:45'),(241,18,22,'REVIEWING',2,'2026-06-09 10:38:48','2026-06-05 10:38:48','2026-06-05 07:49:45'),(242,18,23,'REVIEWING',2,'2026-06-09 10:38:48','2026-06-05 10:38:48','2026-06-05 07:49:45'),(243,18,24,'LEARNING',1,'2026-06-06 10:38:48','2026-06-05 10:38:48','2026-06-05 07:49:45'),(244,18,25,'REVIEWING',2,'2026-06-09 10:38:48','2026-06-05 10:38:48','2026-06-05 07:49:45'),(245,18,26,'REVIEWING',2,'2026-06-09 10:38:48','2026-06-05 10:38:48','2026-06-05 07:49:45'),(246,18,27,'REVIEWING',2,'2026-06-09 10:38:48','2026-06-05 10:38:48','2026-06-05 07:49:45'),(247,18,28,'REVIEWING',2,'2026-06-09 10:38:48','2026-06-05 10:38:48','2026-06-05 07:49:45'),(248,18,29,'REVIEWING',2,'2026-06-09 10:38:48','2026-06-05 10:38:48','2026-06-05 07:49:45'),(249,18,30,'LEARNING',1,'2026-06-06 10:38:48','2026-06-05 10:38:48','2026-06-05 07:49:45'),(250,18,31,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(251,18,32,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(252,18,33,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(253,18,34,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(254,18,35,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(255,18,36,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(256,18,37,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(257,18,38,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(258,18,39,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(259,18,40,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(260,18,41,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(261,18,42,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(262,18,43,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(263,18,44,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(264,18,45,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(265,18,46,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(266,18,47,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(267,18,48,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(268,18,49,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(269,18,50,'NEW',0,NULL,NULL,'2026-06-05 07:49:45'),(270,18,63,'REVIEWING',1,'2026-06-07 10:38:57','2026-06-05 10:38:57','2026-06-05 10:34:35');
/*!40000 ALTER TABLE `userprogress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('USER','ADMIN') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'USER',
  `avatar_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_streak` int DEFAULT '0',
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (18,'test123@gmail.com','$2b$10$xE30lXzqsj/X3YrPvIabTeraMqw3REWxrv7jxqLoE7ATXt8fLDbZy','Test','USER','/uploads/avatars/user_18_1780650003508.webp',1,NULL,'2026-06-05 07:49:45','2026-06-05 09:15:49');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vocabularysets`
--

DROP TABLE IF EXISTS `vocabularysets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vocabularysets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `vocabularysets_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vocabularysets`
--

LOCK TABLES `vocabularysets` WRITE;
/*!40000 ALTER TABLE `vocabularysets` DISABLE KEYS */;
INSERT INTO `vocabularysets` VALUES (1,'Chuyên ngành CNTT','Các từ vựng phổ biến trong lập trình và phát triển phần mềm.',NULL,1,1,'2026-05-31 15:03:14','2026-06-03 04:03:13','/uploads/avatarsvacab/anhcntt.jpg'),(2,'Giáo dục học thuật','Từ vựng hay gặp trong trường học, thi cử và tài liệu nghiên cứu.',NULL,1,1,'2026-05-31 15:03:14','2026-06-03 04:02:31','/uploads/avatarsvacab/anhgiaoduc.jpg'),(3,'Môi trường Xã hội','Chủ đề về thiên nhiên, hệ sinh thái và đô thị hóa.',NULL,1,1,'2026-05-31 15:03:14','2026-06-03 04:02:31','/uploads/avatarsvacab/anhmoitruong.jpg'),(4,'Thể thao và Chiến thuật','Từ vựng về các giải đấu, thể lực và hoạt động thể thao.',NULL,1,1,'2026-05-31 15:03:14','2026-06-03 04:02:31','/uploads/avatarsvacab/anhthethao.jpg'),(5,'Giao tiếp thông dụng','Cụm từ giúp bạn tự tin nói chuyện hằng ngày.',NULL,1,1,'2026-05-31 15:03:14','2026-06-03 04:02:31','/uploads/avatarsvacab/anhgiaotiep.jpg'),(16,'Ẩm Thực','Tôi sẽ ăn cả trái đất',18,0,1,'2026-06-05 10:28:17','2026-06-05 10:28:27','/uploads/avatarsvacab/vocab_1780655297139.png');
/*!40000 ALTER TABLE `vocabularysets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `words`
--

DROP TABLE IF EXISTS `words`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `words` (
  `id` int NOT NULL AUTO_INCREMENT,
  `set_id` int NOT NULL,
  `english_word` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `meaning` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `pronunciation` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `example_sentence` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `set_id` (`set_id`),
  CONSTRAINT `words_ibfk_1` FOREIGN KEY (`set_id`) REFERENCES `vocabularysets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `words`
--

LOCK TABLES `words` WRITE;
/*!40000 ALTER TABLE `words` DISABLE KEYS */;
INSERT INTO `words` VALUES (1,1,'Database','Cơ sở dữ liệu','/ˈdeɪtəbeɪs/','We need to backup the database every day.','2026-05-31 15:07:00'),(2,1,'Compiler','Trình biên dịch','/kəmˈpaɪlər/','The compiler converts source code into machine code.','2026-05-31 15:07:00'),(3,1,'Algorithm','Thuật toán','/ˈælɡərɪðəm/','The software uses a complex encryption algorithm.','2026-05-31 15:07:00'),(4,1,'Framework','Khung làm việc, thư viện cấu trúc','/ˈfreɪmwɜːrk/','Angular is a popular front-end framework.','2026-05-31 15:07:00'),(5,1,'Variable','Biến số','/ˈværiəbl/','You must declare a variable before using it.','2026-05-31 15:07:00'),(6,1,'Interface','Giao diện','/ˈɪntərfeɪs/','The user interface of this application is friendly.','2026-05-31 15:07:00'),(7,1,'Inheritance','Tính kế thừa','/ɪnˈherɪtəns/','Inheritance is a core concept of Object-Oriented Programming.','2026-05-31 15:07:00'),(8,1,'Repository','Kho chứa dữ liệu, kho code','/rɪˈpɑːzətɔːri/','Please push your latest code to the GitHub repository.','2026-05-31 15:07:00'),(9,1,'Deployment','Sự triển khai phần mềm','/dɪˈplɔɪmənt/','The automated deployment process takes only five minutes.','2026-05-31 15:07:00'),(10,1,'Debugging','Quá trình gỡ lỗi','/ˌdiːˈbʌɡɪŋ/','He spent the whole afternoon debugging the application.','2026-05-31 15:07:00'),(11,2,'Curriculum','Chương trình giảng dạy','/kəˈrɪkjələm/','The school is introducing a new English curriculum.','2026-05-31 15:07:00'),(12,2,'Academic','Thuộc học thuật, viện hàn lâm','/ˌækəˈdemɪk/','She has a brilliant academic career.','2026-05-31 15:07:00'),(13,2,'Assignment','Bài tập về nhà, nhiệm vụ','/əˈsaɪnmənt/','The deadline for the programming assignment is tomorrow.','2026-05-31 15:07:00'),(14,2,'Tuition','Học phí','/tuˈɪʃn/','The university decided to raise its tuition fees this year.','2026-05-31 15:07:00'),(15,2,'Scholarship','Học bổng','/ˈskɑːlərʃɪp/','He won a full scholarship to study computer science abroad.','2026-05-31 15:07:00'),(16,2,'Pedagogy','Phương pháp giảng dạy, sư phạm','/ˈpedəɡɑːdʒi/','Modern pedagogy focuses more on student interaction.','2026-05-31 15:07:00'),(17,2,'Graduation','Lễ tốt nghiệp','/ˌɡrædʒuˈeɪʃn/','Parents were invited to attend the graduation ceremony.','2026-05-31 15:07:00'),(18,2,'Plagiarism','Sự đạo văn','/ˈpleɪdʒərɪzəm/','The university has a strict policy against plagiarism.','2026-05-31 15:07:00'),(19,2,'Enrollment','Sự đăng ký nhập học','/ɪnˈroʊlmənt/','Student enrollment has increased by ten percent.','2026-05-31 15:07:00'),(20,2,'Evaluation','Sự đánh giá','/ɪˌvæljuˈeɪʃn/','Continuous evaluation helps track student progress.','2026-05-31 15:07:00'),(21,3,'Pollution','Sự ô nhiễm','/pəˈluːʃn/','Air pollution is a serious problem in big cities.','2026-05-31 15:07:00'),(22,3,'Ecosystem','Hệ sinh thái','/ˈiːkoʊsɪstəm/','The plastic waste is damaging the marine ecosystem.','2026-05-31 15:07:00'),(23,3,'Biodiversity','Đa dạng sinh học','/ˌbaɪoʊdaɪˈvɜːrsəti/','Protecting the rainforest preserves global biodiversity.','2026-05-31 15:07:00'),(24,3,'Conservation','Sự bảo tồn','/ˌkɑːnsərˈveɪʃn/','Wildlife conservation requires international cooperation.','2026-05-31 15:07:00'),(25,3,'Sustainability','Sự bền vững','/səˌsteɪnəˈbɪləti/','The company is moving towards environmental sustainability.','2026-05-31 15:07:00'),(26,3,'Urbanization','Quá trình đô thị hóa','/ˌɜːrbənəˈzeɪʃn/','Rapid urbanization creates pressure on housing.','2026-05-31 15:07:00'),(27,3,'Community','Cộng đồng','/kəˈmjuːnəti/','The local community organized a park cleanup event.','2026-05-31 15:07:00'),(28,3,'Deforestation','Nạn phá rừng','/ˌdiːˌfɔːrɪˈsteɪʃn/','Deforestation leads to severe soil erosion.','2026-05-31 15:07:00'),(29,3,'Infrastructure','Cơ sở hạ tầng','/ˈɪnfrəstrʌktʃər/','The city needs to upgrade its transport infrastructure.','2026-05-31 15:07:00'),(30,3,'Atmosphere','Bầu khí quyển','/ˈætməsfɪr/','Carbon emissions are polluting the Earth\'s atmosphere.','2026-05-31 15:07:00'),(31,4,'Tournament','Giải đấu, vòng thi đấu','/ˈtʊrnəmənt/','Our team won the local football tournament.','2026-05-31 15:07:00'),(32,4,'Stamina','Sức chịu đựng, thể lực','/ˈstæmɪnə/','Running everyday helps build your stamina.','2026-05-31 15:07:00'),(33,4,'Championship','Chức vô địch, giải vô địch','/ˈtʃæmpiənʃɪp/','The team is training hard to win the championship.','2026-05-31 15:07:00'),(34,4,'Referee','Trọng tài','/ˌrefəˈriː/','The referee showed a red card to the player.','2026-05-31 15:07:00'),(35,4,'Opponent','Đối thủ','/əˈpoʊnənt/','He respected his opponent but was confident he would win.','2026-05-31 15:07:00'),(36,4,'Athletics','Môn điền kinh','/æθˈletɪks/','She excels at athletics, especially sprinting.','2026-05-31 15:07:00'),(37,4,'Gymnasium','Phòng tập thể dục, nhà thi đấu','/dʒɪmˈneɪziəm/','The school gymnasium is fully equipped with new gear.','2026-05-31 15:07:00'),(38,4,'Spectator','Khán giả (xem trực tiếp)','/ˈspekteɪtər/','The stadium was packed with thousands of spectators.','2026-05-31 15:07:00'),(39,4,'Strategy','Chiến thuật, chiến lược','/ˈstrætədʒi/','The coach explained the tactical strategy before the match.','2026-05-31 15:07:00'),(40,4,'Victory','Chiến thắng','/ˈvɪktəri/','The team celebrated their hard-earned victory.','2026-05-31 15:07:00'),(41,5,'Awesome','Tuyệt vời, đỉnh dữ thần','/ˈɔːsəm/','The performance last night was awesome!','2026-05-31 15:07:00'),(42,5,'Appreciate','Trân trọng, cảm kích','/əˈpriːʃieɪt/','I really appreciate your help with my project.','2026-05-31 15:07:00'),(43,5,'Apologize','Xin lỗi','/əˈpɑːlədʒaɪz/','I apologize for the delay in answering your email.','2026-05-31 15:07:00'),(44,5,'Sincere','Chân thành','/sɪnˈsɪr/','Please accept my sincere thanks for everything.','2026-05-31 15:07:00'),(45,5,'Definitely','Chắc chắn rồi, hoàn toàn','/ˈdefɪnətli/','I will definitely come to your party next week.','2026-05-31 15:07:00'),(46,5,'Conversation','Cuộc hội thoại, trò chuyện','/ˌkɑːnvərˈseɪʃn/','We had an interesting conversation about games.','2026-05-31 15:07:00'),(47,5,'Embarrassed','Ngượng ngùng, xấu hổ','/ɪmˈbærəst/','I felt so embarrassed when I forgot his name.','2026-05-31 15:07:00'),(48,5,'Congratulations','Xin chúc mừng','/kənˌɡrætʃuˈleɪʃnz/','Congratulations on passing your final exam!','2026-05-31 15:07:00'),(49,5,'Misunderstanding','Sự hiểu lầm','/ˌmɪsʌndərˈstændɪŋ/','It was a complete misunderstanding between us.','2026-05-31 15:07:00'),(50,5,'Recommendation','Sự tiến cử, lời khuyên','/ˌrekəmənˈdeɪʃn/','Can you give me a recommendation for a good book.','2026-05-31 15:07:00'),(63,16,'Water','Nước','/əˈtʃiːvmənt/','oke','2026-06-05 10:34:35');
/*!40000 ALTER TABLE `words` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-05 21:31:43
