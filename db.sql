-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: zuj_communities
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Comments`
--

use zuj_communities;

DROP TABLE IF EXISTS `Comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Comments` (
  `ID` varchar(200) NOT NULL,
  `Content` text,
  `Post` varchar(200) DEFAULT NULL,
  `User` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `Post` (`Post`),
  KEY `User` (`User`),
  CONSTRAINT `Comments_ibfk_1` FOREIGN KEY (`Post`) REFERENCES `Posts` (`ID`),
  CONSTRAINT `Comments_ibfk_2` FOREIGN KEY (`User`) REFERENCES `Users` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Comments`
--

LOCK TABLES `Comments` WRITE;
/*!40000 ALTER TABLE `Comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `Comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Events`
--

DROP TABLE IF EXISTS `Events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Events` (
  `ID` varchar(200) NOT NULL,
  `Title` varchar(200) DEFAULT NULL,
  `Description` text,
  `Date` date DEFAULT NULL,
  `Time` time DEFAULT NULL,
  `User` varchar(200) DEFAULT NULL,
  `Society` varchar(200) DEFAULT NULL,
  `Location` varchar(200) DEFAULT NULL,
  `Image` text,
  `Category` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `User` (`User`),
  KEY `Society` (`Society`),
  CONSTRAINT `Events_ibfk_1` FOREIGN KEY (`User`) REFERENCES `Users` (`ID`),
  CONSTRAINT `Events_ibfk_2` FOREIGN KEY (`Society`) REFERENCES `Societies` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Events`
--

LOCK TABLES `Events` WRITE;
/*!40000 ALTER TABLE `Events` DISABLE KEYS */;
INSERT INTO `Events` VALUES ('993fa27a-7715-4929-a337-b0508bf1f772','svsvs','vsvcsvcs','2025-05-12','04:04:00','0e1924d7-df45-4541-be1d-b07df8238a14','38add9a2-4fe1-4899-81ed-6514c386720b','csacedsc ','https://www.eventbookings.com/wp-content/uploads/2018/03/event-ideas-for-party-eventbookings.jpg',NULL),('d431ec37-211e-43df-a4fe-0f11ec4fa89e','cceasdcfe','sedcfvwsefcve','2026-03-03','03:33:00','0e1924d7-df45-4541-be1d-b07df8238a14','38add9a2-4fe1-4899-81ed-6514c386720b','vddvsdvsdv','https://cdn-cjhkj.nitrocdn.com/krXSsXVqwzhduXLVuGLToUwHLNnSxUxO/assets/images/optimized/rev-2e6e27c/spotme.com/wp-content/uploads/2020/07/Hero-1.jpg',NULL);
/*!40000 ALTER TABLE `Events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Posts`
--

DROP TABLE IF EXISTS `Posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Posts` (
  `ID` varchar(200) NOT NULL,
  `Content` text,
  `Likes` int DEFAULT NULL,
  `Comments` int DEFAULT NULL,
  `User` varchar(200) DEFAULT NULL,
  `Image` varchar(200) DEFAULT NULL,
  `Society` text,
  PRIMARY KEY (`ID`),
  KEY `User` (`User`),
  CONSTRAINT `Posts_ibfk_1` FOREIGN KEY (`User`) REFERENCES `Users` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Posts`
--

LOCK TABLES `Posts` WRITE;
/*!40000 ALTER TABLE `Posts` DISABLE KEYS */;
INSERT INTO `Posts` VALUES ('11','test',3,5,'0e1924d7-df45-4541-be1d-b07df8238a14','https://www.mdxblog.io/images/Posts/how-to-use-images/grass-tree-sky.jpg','38add9a2-4fe1-4899-81ed-6514c386720b'),('11es','hello ',3,5,'0e1924d7-df45-4541-be1d-b07df8238a14','https://www.mdxblog.io/images/Posts/how-to-use-images/grass-tree-sky.jpg','38add9a2-4fe1-4899-81ed-6514c386720b'),('ecdcws','i am hmad',3,5,'0e1924d7-df45-4541-be1d-b07df8238a14','https://www.mdxblog.io/images/Posts/how-to-use-images/grass-tree-sky.jpg','38add9a2-4fe1-4899-81ed-6514c386720b');
/*!40000 ALTER TABLE `Posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Societies`
--

DROP TABLE IF EXISTS `Societies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Societies` (
  `ID` varchar(200) NOT NULL,
  `Name` varchar(200) DEFAULT NULL,
  `Description` varchar(200) DEFAULT NULL,
  `User` varchar(200) DEFAULT NULL,
  `Category` varchar(200) DEFAULT NULL,
  `Visibilty` varchar(200) DEFAULT NULL,
  `Image` text,
  PRIMARY KEY (`ID`),
  KEY `User` (`User`),
  CONSTRAINT `Societies_ibfk_1` FOREIGN KEY (`User`) REFERENCES `Users` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Societies`
--

LOCK TABLES `Societies` WRITE;
/*!40000 ALTER TABLE `Societies` DISABLE KEYS */;
INSERT INTO `Societies` VALUES ('38add9a2-4fe1-4899-81ed-6514c386720b','drtgvberdgvb','gdbgvdregvb','0e1924d7-df45-4541-be1d-b07df8238a14','Political','public','https://hitec-ims.edu.pk/wp-content/uploads/2024/03/College-Societies.jpg'),('64e2ffc8-490d-4c97-aa05-5dfe43554dc5','dbbvgdbsvg','rfbrfbrftb','0e1924d7-df45-4541-be1d-b07df8238a14','Professional','public',''),('6f6f8189-bd82-4a23-815e-5428af457dc7','cedcc','ccc','0e1924d7-df45-4541-be1d-b07df8238a14','Health & Wellness','public','https://t4.ftcdn.net/jpg/11/60/96/53/360_F_1160965311_KDLupxFBpKaM2NqXMjJmYhnuuYp2RtoS.jpg'),('7a205538-37b0-45fd-9088-c81768cb3713','test','cccc','0e1924d7-df45-4541-be1d-b07df8238a14','Sports & Recreation','public',''),('7f0361c9-8311-442e-b66c-0bf207a5425f','dfrvbdvbgd','bvgdrtefgbvrtfbgv','0e1924d7-df45-4541-be1d-b07df8238a14','Community Service','public',NULL),('853e3666-098e-44d8-a410-29bbfe77a1b0','vsvdv','vsrdvdvae','0e1924d7-df45-4541-be1d-b07df8238a14','Religious','public',NULL),('c63f279f-cfdd-4053-b8b1-03c34d6d1367','vsvs','vsdvsv','0e1924d7-df45-4541-be1d-b07df8238a14','Arts & Culture','public',NULL),('cb986b3c-e8a7-4983-91e8-04292a452471','qwdwqdwq','dqwdwdwasf','4f454cce-d807-4b0b-800b-a1fa468a0b03','Religious','public',''),('df376a22-76ed-4c10-b292-da9a235ded3f','omar ddd','sdecfscf','4f454cce-d807-4b0b-800b-a1fa468a0b03','Political','public',''),('ec722766-514e-4fc8-9d36-2485679eeadc','vsvdv','vsrdvdvae','0e1924d7-df45-4541-be1d-b07df8238a14','Religious','public',NULL);
/*!40000 ALTER TABLE `Societies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Societies_Join_Requests`
--

DROP TABLE IF EXISTS `Societies_Join_Requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Societies_Join_Requests` (
  `ID` varchar(200) DEFAULT NULL,
  `Society` varchar(200) DEFAULT NULL,
  `User` varchar(200) DEFAULT NULL,
  `Status` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Societies_Join_Requests`
--

LOCK TABLES `Societies_Join_Requests` WRITE;
/*!40000 ALTER TABLE `Societies_Join_Requests` DISABLE KEYS */;
INSERT INTO `Societies_Join_Requests` VALUES ('f0fb8842-a330-40f2-a4c1-5ccd09c3699a','38add9a2-4fe1-4899-81ed-6514c386720b','4f454cce-d807-4b0b-800b-a1fa468a0b03','approved');
/*!40000 ALTER TABLE `Societies_Join_Requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Societies_Members`
--

DROP TABLE IF EXISTS `Societies_Members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Societies_Members` (
  `ID` varchar(200) DEFAULT NULL,
  `Society` varchar(200) DEFAULT NULL,
  `User` varchar(200) DEFAULT NULL,
  `Role` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Societies_Members`
--

LOCK TABLES `Societies_Members` WRITE;
/*!40000 ALTER TABLE `Societies_Members` DISABLE KEYS */;
INSERT INTO `Societies_Members` VALUES ('3','38add9a2-4fe1-4899-81ed-6514c386720b','0e1924d7-df45-4541-be1d-b07df8238a14','admin'),('68af4a85-bec1-481c-a8ab-ba0b386ef65e','38add9a2-4fe1-4899-81ed-6514c386720b','4f454cce-d807-4b0b-800b-a1fa468a0b03','member');
/*!40000 ALTER TABLE `Societies_Members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `ID` varchar(200) NOT NULL,
  `Name` varchar(200) DEFAULT NULL,
  `Email` varchar(200) DEFAULT NULL,
  `Password` varchar(200) DEFAULT NULL,
  `Student_ID` varchar(200) DEFAULT NULL,
  `Photo` varchar(200) DEFAULT NULL,
  `Bio` text,
  `Phone_Number` text,
  `Create_Date` date DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES ('0e1924d7-df45-4541-be1d-b07df8238a14','ahmad almuhidat','ahmad.almuhidat@gmail.com','$2b$10$JB6/aDcMgYTR1wrIlkhsV.7ZDuvsqRpjQ.bIWkQNXRis9fJsyvGTe','','','test bio','+96288888',NULL),('41014a9a-3948-4b87-be93-353ce21356bd','eweee eeee','eee@gmail.com','$2b$10$KPBGhbAu5fhXtuAczWA6.OBuxSIW8pGTIcBchTxoBxkopHoBEyaQW','','',NULL,NULL,NULL),('4f454cce-d807-4b0b-800b-a1fa468a0b03','omar','omar@gmail.com','$2b$10$rPW09Se4YG4muu3BgJjxJOhvtfmB/hlFWjfCfzGgg.os//0pfcBZm','2345','',NULL,NULL,NULL);
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-06 10:34:00
