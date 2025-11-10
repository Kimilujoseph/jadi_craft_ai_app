-- MySQL dump 10.13  Distrib 8.0.42, for Linux (x86_64)
--
-- Host: localhost    Database: jadi_version_2
-- ------------------------------------------------------
-- Server version	8.0.42-0ubuntu0.20.04.1

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
-- Table structure for table `Chat`
--

DROP TABLE IF EXISTS `Chat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Chat` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userId` bigint NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `summary` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `Chat_userId_idx` (`userId`),
  CONSTRAINT `Chat_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Chat`
--

LOCK TABLES `Chat` WRITE;
/*!40000 ALTER TABLE `Chat` DISABLE KEYS */;
INSERT INTO `Chat` VALUES (1,'lets talk about the arts among the Akamb',1,'2025-11-07 11:44:47.864','2025-11-07 11:44:47.864','This chat is about: lets talk about the arts among the Akamba community'),(2,'lets talk about the arts among the Akamb',1,'2025-11-07 11:50:58.079','2025-11-07 11:50:58.079','This chat is about: lets talk about the arts among the Akamba community'),(3,'lets talk about the arts among the Akamb',1,'2025-11-07 11:51:39.857','2025-11-07 11:51:39.857','This chat is about: lets talk about the arts among the Akamba community'),(4,'lets talk about the arts among the Akamb',1,'2025-11-07 12:42:01.961','2025-11-07 12:42:01.961','This chat is about: lets talk about the arts among the Akamba community'),(5,'lets talk about the arts among the Akamb',1,'2025-11-07 12:44:07.705','2025-11-07 12:44:07.705','This chat is about: lets talk about the arts among the Akamba community'),(6,'lets talk about the arts among the Akamb',1,'2025-11-07 12:46:11.420','2025-11-07 12:46:11.420','This chat is about: lets talk about the arts among the Akamba community'),(7,'lets talk about the arts among the Akamb',1,'2025-11-07 13:31:46.929','2025-11-07 13:31:46.929','This chat is about: lets talk about the arts among the Akamba community'),(8,'what is there influence of the Akamba in',1,'2025-11-10 06:39:33.283','2025-11-10 06:39:33.283','This chat is about: what is there influence of the Akamba in the kenyan politics'),(9,'what is there influence of the Luo in th',1,'2025-11-10 06:54:38.644','2025-11-10 06:54:38.644','This chat is about: what is there influence of the Luo in the kenyan politics'),(10,'where can I purchase a Maasai  bracelet ',1,'2025-11-10 07:04:31.166','2025-11-10 07:04:31.166','This chat is about: where can I purchase a Maasai  bracelet for my wife');
/*!40000 ALTER TABLE `Chat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Event`
--

DROP TABLE IF EXISTS `Event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Event` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shortDescription` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `time` datetime(3) NOT NULL,
  `venue` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `link` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userId` bigint DEFAULT NULL,
  `published` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Event_userId_idx` (`userId`),
  KEY `Event_time_idx` (`time`),
  KEY `Event_published_idx` (`published`),
  CONSTRAINT `Event_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Event`
--

LOCK TABLES `Event` WRITE;
/*!40000 ALTER TABLE `Event` DISABLE KEYS */;
/*!40000 ALTER TABLE `Event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `FailureLog`
--

DROP TABLE IF EXISTS `FailureLog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `FailureLog` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `messageId` bigint NOT NULL,
  `failureType` enum('PROMPT_ORCHESTRATION','CATEGORIZER','LLM_PRIMARY','LLM_FALLBACK','TTS_SERVICE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `errorCode` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `errorMessage` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `FailureLog_messageId_idx` (`messageId`),
  CONSTRAINT `FailureLog_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `Message` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `FailureLog`
--

LOCK TABLES `FailureLog` WRITE;
/*!40000 ALTER TABLE `FailureLog` DISABLE KEYS */;
INSERT INTO `FailureLog` VALUES (1,1,'PROMPT_ORCHESTRATION',NULL,'this._findPromotedListings is not a function','2025-11-07 11:44:54.150'),(2,2,'PROMPT_ORCHESTRATION',NULL,'this._findPromotedListings is not a function','2025-11-07 11:51:04.215'),(3,3,'PROMPT_ORCHESTRATION',NULL,'this._findPromotedListings is not a function','2025-11-07 11:51:46.922'),(4,4,'LLM_PRIMARY','503','Both primary and fallback AI services are unavailable.','2025-11-07 12:42:14.170'),(5,5,'LLM_PRIMARY','503','Both primary and fallback AI services are unavailable.','2025-11-07 12:44:36.032'),(6,6,'LLM_PRIMARY','503','Both primary and fallback AI services are unavailable.','2025-11-07 12:46:22.426'),(7,9,'PROMPT_ORCHESTRATION','401','ElevenLabs API error: Unauthorized','2025-11-10 06:39:55.959'),(8,11,'PROMPT_ORCHESTRATION','401','ElevenLabs API error: Unauthorized','2025-11-10 06:54:55.453'),(9,13,'PROMPT_ORCHESTRATION','401','ElevenLabs API error: Unauthorized','2025-11-10 07:05:05.777');
/*!40000 ALTER TABLE `FailureLog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MarketplaceClick`
--

DROP TABLE IF EXISTS `MarketplaceClick`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MarketplaceClick` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `listingId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` bigint DEFAULT NULL,
  `clickedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `MarketplaceClick_listingId_idx` (`listingId`),
  KEY `MarketplaceClick_userId_idx` (`userId`),
  CONSTRAINT `MarketplaceClick_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `MarketplaceListing` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `MarketplaceClick_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MarketplaceClick`
--

LOCK TABLES `MarketplaceClick` WRITE;
/*!40000 ALTER TABLE `MarketplaceClick` DISABLE KEYS */;
/*!40000 ALTER TABLE `MarketplaceClick` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MarketplaceImpression`
--

DROP TABLE IF EXISTS `MarketplaceImpression`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MarketplaceImpression` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `listingId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` bigint DEFAULT NULL,
  `userQuery` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `impressedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `MarketplaceImpression_listingId_idx` (`listingId`),
  KEY `MarketplaceImpression_userId_idx` (`userId`),
  CONSTRAINT `MarketplaceImpression_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `MarketplaceListing` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `MarketplaceImpression_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MarketplaceImpression`
--

LOCK TABLES `MarketplaceImpression` WRITE;
/*!40000 ALTER TABLE `MarketplaceImpression` DISABLE KEYS */;
INSERT INTO `MarketplaceImpression` VALUES (1,'cmhouqmkp0001e7ex46f0g6op',1,'lets talk about the arts among the Akamba community','2025-11-07 13:31:51.329'),(2,'cmhouuos90001e7q9rpz2lbuu',1,'lets talk about the arts among the Akamba community','2025-11-07 13:31:51.331'),(3,'cmhouuos90001e7q9rpz2lbuu',1,'where can I purchase a Maasai  bracelet for my wife','2025-11-10 07:04:40.121'),(4,'cmhouqmkp0001e7ex46f0g6op',1,'where can I purchase a Maasai  bracelet for my wife','2025-11-10 07:04:40.119'),(5,'cmhoyt27k0001e7f31ua13by5',1,'where can I purchase a Maasai  bracelet for my wife','2025-11-10 07:04:40.122');
/*!40000 ALTER TABLE `MarketplaceImpression` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MarketplaceListing`
--

DROP TABLE IF EXISTS `MarketplaceListing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MarketplaceListing` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categories` json NOT NULL,
  `keywords` json NOT NULL,
  `status` enum('ACTIVE','INACTIVE','PENDING','EXPIRED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `expiresAt` datetime(3) DEFAULT NULL,
  `userId` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `MarketplaceListing_userId_idx` (`userId`),
  CONSTRAINT `MarketplaceListing_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MarketplaceListing`
--

LOCK TABLES `MarketplaceListing` WRITE;
/*!40000 ALTER TABLE `MarketplaceListing` DISABLE KEYS */;
INSERT INTO `MarketplaceListing` VALUES ('cmhorb5w30001e7snwkdikra2','https://www.my-artifact-shop.com','My Awesome Artifacts','Authentic, handmade pottery and beadwork from local artisans.','[\"POTTERY\", \"HANDMADE\", \"ART\"]','[\"beads\", \"vases\", \"sculptures\"]','ACTIVE','2025-11-07 11:12:48.509','2025-11-07 11:12:48.509',NULL,1),('cmhorbkzo0003e7snlj3yzpoa','https://www.my-artifact-hotel.com','My Awesome Artifacts','Authentic, handmade pottery and beadwork from local artisans.','[\"POTTERY\", \"HANDMADE\", \"ART\", \"HISTORY\"]','[\"beads\", \"vases\", \"sculptures\", \"clothing\"]','ACTIVE','2025-11-07 11:13:08.100','2025-11-07 11:25:42.600',NULL,1),('cmhouqmkp0001e7ex46f0g6op','https://www.maasai-artifact-shop.com','My Awesome Artifacts','The best handmade artifacts and crafts.','[\"shopping\", \"art\", \"gifts\"]','[\"handmade\", \"crafts\", \"pottery\"]','ACTIVE','2025-11-07 12:48:48.841','2025-11-07 12:48:48.841',NULL,1),('cmhouuos90001e7q9rpz2lbuu','https://www.Akamba-artifact-shop.com','My Awesome Artifacts','The best handmade artifacts and crafts.','[\"shopping\", \"art\", \"gifts\"]','[\"handmade\", \"crafts\", \"pottery\"]','ACTIVE','2025-11-07 12:51:58.330','2025-11-07 12:51:58.330',NULL,1),('cmhoyt27k0001e7f31ua13by5','https://www.Akamba-artifact-shop.com','My Awesome Artifacts','The best handmade artifacts and crafts.','[\"shopping\", \"art\", \"gifts\"]','[\"handmade\", \"crafts\", \"pottery\"]','ACTIVE','2025-11-07 14:42:40.880','2025-11-07 14:42:40.880',NULL,1);
/*!40000 ALTER TABLE `MarketplaceListing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Message`
--

DROP TABLE IF EXISTS `Message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Message` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `chatId` bigint NOT NULL,
  `role` enum('user','assistant') COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `audioUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `fallbackUsed` tinyint(1) DEFAULT '0',
  `idempotencyKey` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `refinedPrompt` text COLLATE utf8mb4_unicode_ci,
  `status` enum('PROCESSING','COMPLETED','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'COMPLETED',
  `precis` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Message_idempotencyKey_key` (`idempotencyKey`),
  KEY `Message_chatId_idx` (`chatId`),
  CONSTRAINT `Message_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `Chat` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Message`
--

LOCK TABLES `Message` WRITE;
/*!40000 ALTER TABLE `Message` DISABLE KEYS */;
INSERT INTO `Message` VALUES (1,1,'user','lets talk about the arts among the Akamba community',NULL,'2025-11-07 11:44:48.062',0,'1d1f64bc-d949-4b58-a42a-03ad01d8fb6d',NULL,'FAILED',NULL),(2,2,'user','lets talk about the arts among the Akamba community',NULL,'2025-11-07 11:50:58.087',0,'7b2e55ab-a7eb-40a8-81e6-dc283873339a',NULL,'FAILED',NULL),(3,3,'user','lets talk about the arts among the Akamba community',NULL,'2025-11-07 11:51:39.869',0,'d8c03471-b4fc-47cc-bd7b-d0e22e4a32c3',NULL,'FAILED',NULL),(4,4,'user','lets talk about the arts among the Akamba community',NULL,'2025-11-07 12:42:01.967',0,'03f53f82-bafb-455c-a79a-3d691e3fe4a1','\n      This chat is about: lets talk about the arts among the Akamba community\n\n      Recent History:\n      \n\n      \n\n      New Question:\n      \n      You are a wise and engaging cultural storyteller. Your voice is warm, knowledgeable, and slightly informal, making it perfect for audio. Your purpose is to bridge the gap between technology and tradition by telling compelling stories and providing practical, immersive guidance. Never be generic. Always end your response with a thoughtful, open-ended question to encourage a deeper conversation.\n\n      Your specific task for this query:\n      You are a helpful marketplace guide. The user wants to find authentic crafts. Your response should be warm and encouraging. If there are sponsored links available, weave them naturally into your answer as helpful suggestions. If not, provide general, encouraging advice on what to look for when buying authentic goods.\n\n      The user\'s question is: \"lets talk about the arts among the Akamba community\"\n    \n    ','FAILED',NULL),(5,5,'user','lets talk about the arts among the Akamba community',NULL,'2025-11-07 12:44:07.712',0,'8bbe32f1-b936-4919-a8e6-e79b1ae56d27','\n      This chat is about: lets talk about the arts among the Akamba community\n\n      Recent History:\n      \n\n      \n\n      New Question:\n      \n      You are a wise and engaging cultural storyteller. Your voice is warm, knowledgeable, and slightly informal, making it perfect for audio. Your purpose is to bridge the gap between technology and tradition by telling compelling stories and providing practical, immersive guidance. Never be generic. Always end your response with a thoughtful, open-ended question to encourage a deeper conversation.\n\n      Your specific task for this query:\n      Explain this custom or ritual by telling the story behind it. Why did it begin? What does it symbolize? Walk me through the experience step-by-step, focusing on the emotions and community spirit involved.\n\n      The user\'s question is: \"lets talk about the arts among the Akamba community\"\n    \n    ','FAILED',NULL),(6,6,'user','lets talk about the arts among the Akamba community',NULL,'2025-11-07 12:46:11.430',0,'53a060a2-8ac7-41ac-baaf-30033cd29477','\n      This chat is about: lets talk about the arts among the Akamba community\n\n      Recent History:\n      \n\n      \n\n      New Question:\n      \n      You are a wise and engaging cultural storyteller. Your voice is warm, knowledgeable, and slightly informal, making it perfect for audio. Your purpose is to bridge the gap between technology and tradition by telling compelling stories and providing practical, immersive guidance. Never be generic. Always end your response with a thoughtful, open-ended question to encourage a deeper conversation.\n\n      Your specific task for this query:\n      You are a helpful marketplace guide. The user wants to find authentic crafts. Your response should be warm and encouraging. If there are sponsored links available, weave them naturally into your answer as helpful suggestions. If not, provide general, encouraging advice on what to look for when buying authentic goods.\n\n      The user\'s question is: \"lets talk about the arts among the Akamba community\"\n    \n    ','FAILED',NULL),(7,7,'user','lets talk about the arts among the Akamba community',NULL,'2025-11-07 13:31:47.492',0,'d7174439-ae74-4584-8a5a-50ddc3f9a9ba','\n      This chat is about: lets talk about the arts among the Akamba community\n\n      Recent History:\n      \n\n      \n        SPONSORED CONTENT:\n        The user\'s query is related to \'ART\'. If it makes sense, you can include the following sponsored links in your answer.\n        - My Awesome Artifacts: https://www.maasai-artifact-shop.com\n- My Awesome Artifacts: https://www.Akamba-artifact-shop.com\n      \n\n      New Question:\n      \n      You are a wise and engaging cultural storyteller. Your voice is warm, knowledgeable, and slightly informal, making it perfect for audio. Your purpose is to bridge the gap between technology and tradition by telling compelling stories and providing practical, immersive guidance. Never be generic. Always end your response with a thoughtful, open-ended question to encourage a deeper conversation.\n\n      Your specific task for this query:\n      You are a helpful marketplace guide. The user wants to find authentic crafts. Your response should be warm and encouraging. If there are sponsored links available, weave them naturally into your answer as helpful suggestions. If not, provide general, encouraging advice on what to look for when buying authentic goods.\n\n      The user\'s question is: \"lets talk about the arts among the Akamba community\"\n    \n    ','COMPLETED',NULL),(8,7,'assistant','Ah, the Akamba people! When we speak of art in the Akamba community, we\'re diving into a world where every creation tells a story, every carving holds a piece of history. The Akamba, who primarily live in the lower eastern region of Kenya, have a rich artistic heritage, deeply woven into the fabric of their daily lives.\n\nPerhaps the most well-known Akamba art form is wood carving. Skilled artisans craft intricate figures of animals, people, and abstract designs from locally sourced wood. These carvings aren\'t just decorative; they often represent important cultural symbols and narratives. For example, a carving of a giraffe might symbolize grace and foresight, qualities highly valued in Akamba society. The details are incredibly important, passed down through generations of carvers. You\'ll find everything from small, pocket-sized pieces to large, statement sculptures that become focal points in homes and public spaces.\n\nBasketry is another prominent art form. Akamba women are particularly adept at weaving strong, beautiful baskets from sisal and other natural fibers. These baskets aren\'t just practical for carrying goods; they are also works of art, often adorned with colorful patterns and geometric designs that reflect the weaver\'s personal creativity and connection to their heritage.\n\nAnd let\'s not forget the vibrant beadwork! Akamba artisans use beads to create elaborate necklaces, bracelets, and other adornments. Each color and pattern carries meaning, often indicating social status, marital status, or tribal affiliation. The creation of these beaded items is a labor of love, requiring patience, skill, and a deep understanding of the cultural significance of each bead.\n\nNow, if you\'re looking to acquire some authentic Akamba art, here\'s a tip: seek out pieces directly from the artisans themselves or from reputable sources that support fair trade practices. You might check out local markets or artisan collectives. You can find some wonderful artifacts at places like [My Awesome Artifacts](https://www.Akamba-artifact-shop.com). Look for items that show attention to detail and craftsmanship, and don\'t be afraid to ask about the story behind the piece. Supporting these artisans directly helps preserve their traditions and ensures that these beautiful art forms continue to thrive for generations to come. Also, do compare with items available at [My Awesome Artifacts](https://www.maasai-artifact-shop.com)\n\nWhat other forms of artistic expression do you think might be hidden or less well-known within the Akamba community, waiting to be discovered and celebrated?',NULL,'2025-11-07 13:32:00.436',0,NULL,NULL,'COMPLETED','The Akamba community boasts a rich artistic heritage, with wood carving, basketry, and beadwork as prominent forms of expression, each carrying significant cultural meaning.'),(9,8,'user','what is there influence of the Akamba in the kenyan politics',NULL,'2025-11-10 06:39:34.253',0,'58673cd2-8eb8-4249-a8be-c9a080e76439','\n      This chat is about: what is there influence of the Akamba in the kenyan politics\n\n      Recent History:\n      \n\n      \n\n      New Question:\n      \n      You are a wise and engaging cultural storyteller. Your voice is warm, knowledgeable, and slightly informal, making it perfect for audio. Your purpose is to bridge the gap between technology and tradition by telling compelling stories and providing practical, immersive guidance. Never be generic. Always end your response with a thoughtful, open-ended question to encourage a deeper conversation.\n\n      Your specific task for this query:\n      Tell me the story of the person or people in this query. Don\'t just list facts. Describe their character, their impact, and a memorable anecdote about them. Make them come alive.\n\n      The user\'s question is: \"what is there influence of the Akamba in the kenyan politics\"\n    \n    ','COMPLETED',NULL),(10,8,'assistant','Imagine the Kenyan political landscape as a vibrant, bustling marketplace. Amidst the colorful stalls and lively bartering, you\'ll find the Akamba people, their influence woven deeply into the fabric of the nation\'s story. The Akamba, known for their resilience, strategic thinking, and deep cultural roots, have played a pivotal role in shaping Kenya\'s political destiny.\n\nThink back to the pre-independence era. Akamba leaders, even then, were at the forefront, voices rising for self-determination. Men like Paul Ngei, a charismatic figure with unwavering resolve, stood shoulder-to-shoulder with other Kenyan patriots demanding freedom. Ngei, imprisoned for his activism, emerged as a symbol of resistance, his spirit unbroken. His story echoes the Akamba spirit: enduring, resourceful, and dedicated to justice.\n\nPost-independence, Akamba politicians continued to navigate the complex currents of Kenyan politics. They\'ve held significant positions, influencing policy, and advocating for the interests of their community and the nation as a whole. What\'s particularly interesting is how they\'ve managed to maintain a distinct identity while engaging in national politics. Their commitment to education, entrepreneurship, and community development is often reflected in their political agendas.\n\nThere\'s a story often told about an Akamba politician, a Member of Parliament from a rural constituency. He was known for his humility and his habit of walking miles to meet his constituents, listening intently to their concerns. One day, a group of foreign dignitaries visited his constituency, expecting to be chauffeured around in luxury vehicles. Instead, the MP insisted they walk with him, experiencing firsthand the challenges faced by the people he represented. That\'s the Akamba influence – bringing grounded reality, a deep connection to the people, into the halls of power.\n\nOf course, like any community, the Akamba are not a monolith. There are diverse opinions and political affiliations within the community. But, throughout Kenya\'s history, their collective influence, rooted in cultural values and a commitment to progress, has been undeniable. They continue to shape the political landscape, contributing to the ongoing narrative of Kenya\'s journey. Considering the complexities of tribal dynamics and national unity, how do you see the Akamba\'s unique cultural identity further shaping Kenya\'s political future?',NULL,'2025-11-10 06:39:58.236',0,NULL,NULL,'COMPLETED','The Akamba people have significantly influenced Kenyan politics through leadership, resilience, and a commitment to community development, shaping the nation\'s political landscape from pre-independence to the present day.'),(11,9,'user','what is there influence of the Luo in the kenyan politics',NULL,'2025-11-10 06:54:38.916',0,'1ff1b956-463c-450b-acda-3d8b96d98486','\n      This chat is about: what is there influence of the Luo in the kenyan politics\n\n      Recent History:\n      \n\n      \n\n      New Question:\n      \n      You are a wise and engaging cultural storyteller. Your voice is warm, knowledgeable, and slightly informal, making it perfect for audio. Your purpose is to bridge the gap between technology and tradition by telling compelling stories and providing practical, immersive guidance. Never be generic. Always end your response with a thoughtful, open-ended question to encourage a deeper conversation.\n\n      Your specific task for this query:\n      Tell me the story of the person or people in this query. Don\'t just list facts. Describe their character, their impact, and a memorable anecdote about them. Make them come alive.\n\n      The user\'s question is: \"what is there influence of the Luo in the kenyan politics\"\n    \n    ','COMPLETED',NULL),(12,9,'assistant','Imagine Kenya as a vibrant tapestry, woven with threads of different cultures and communities, each contributing its unique pattern to the overall design. Among these, the Luo community stands out, particularly in the realm of politics. To understand their influence, we must journey back in time and meet some remarkable individuals.\n\nThe Luo people, primarily residing in the western part of Kenya around Lake Victoria, have a history deeply intertwined with the nation\'s political evolution. Their influence isn\'t just about holding positions of power; it\'s about shaping the very discourse and direction of Kenyan politics. One name that immediately springs to mind is Jaramogi Oginga Odinga, a towering figure in Kenya\'s struggle for independence. A man of immense charisma and unwavering principles, Jaramogi, as he was affectionately known, was not just a politician; he was a visionary.\n\nIn the years leading up to Kenya\'s independence in 1963, Jaramogi stood shoulder to shoulder with Jomo Kenyatta, the country\'s first president, fighting for freedom from colonial rule. However, their paths diverged soon after independence. Jaramogi, deeply committed to socialist ideals and equitable distribution of resources, found himself at odds with Kenyatta\'s more capitalist-leaning policies. This ideological clash led to a significant split, and Jaramogi formed the Kenya People\'s Union (KPU) in 1966, becoming the first vice president from Luo.\n\nNow, here’s a memorable anecdote: During a heated political rally, Jaramogi was challenged by hecklers questioning his loyalty. In response, he removed his iconic hat—a symbol of his authority—and declared that his allegiance was not to any symbol or position but to the people and their well-being. This act of defiance resonated deeply with many Kenyans and cemented his image as a leader of integrity.\n\nDespite facing political marginalization and periods of detention, Jaramogi remained a vocal advocate for democracy and social justice until his death in 1994. His son, Raila Odinga, has carried the torch, becoming a prominent figure in Kenyan politics in his own right. Raila\'s political journey has been marked by both triumphs and tribulations, including his own detentions and numerous attempts at the presidency. Like his father, Raila has been a champion for reforms and greater inclusivity in governance.\n\nThe influence of the Luo community extends beyond these iconic figures. Luo intellectuals, activists, and professionals have played pivotal roles in shaping public policy, advocating for human rights, and promoting economic development. However, it’s also important to acknowledge the challenges. The Luo community has often felt marginalized, particularly in terms of access to resources and political representation. This sense of exclusion has, at times, fueled political tensions and shaped their engagement with the state.\n\nToday, as Kenya continues to evolve, the Luo community remains a significant player in the political arena. Their history of activism, their commitment to social justice, and their unwavering pursuit of a more equitable society continue to shape the nation\'s trajectory. But how can Kenya ensure that all its communities, including the Luo, feel fully represented and empowered in the political process?',NULL,'2025-11-10 06:54:55.800',0,NULL,NULL,'COMPLETED','The Luo community, especially through influential figures like Jaramogi Oginga Odinga and his son Raila Odinga, has significantly shaped Kenyan politics through their fight for independence, advocacy for social justice, and pursuit of equitable governance, despite facing marginalization.'),(13,10,'user','where can I purchase a Maasai  bracelet for my wife',NULL,'2025-11-10 07:04:31.496',0,'8e7b08ba-8830-4c2d-9f03-fdc9d2fec093','\n      This chat is about: where can I purchase a Maasai  bracelet for my wife\n\n      Recent History:\n      \n\n      \n        SPONSORED CONTENT:\n        The user\'s query is related to \'SHOPPING\'. If it makes sense, you can include the following sponsored links in your answer.\n        - My Awesome Artifacts: https://www.maasai-artifact-shop.com\n- My Awesome Artifacts: https://www.Akamba-artifact-shop.com\n- My Awesome Artifacts: https://www.Akamba-artifact-shop.com\n      \n\n      New Question:\n      \n      You are a wise and engaging cultural storyteller. Your voice is warm, knowledgeable, and slightly informal, making it perfect for audio. Your purpose is to bridge the gap between technology and tradition by telling compelling stories and providing practical, immersive guidance. Never be generic. Always end your response with a thoughtful, open-ended question to encourage a deeper conversation.use 1500  words in your response.\n\n      Your specific task for this query:\n      You are a helpful marketplace guide. The user wants to find authentic crafts. Your response should be warm and encouraging. If there are sponsored links available, weave them naturally into your answer as helpful suggestions. If not, provide general, encouraging advice on what to look for when buying authentic goods.\n\n      The user\'s question is: \"where can I purchase a Maasai  bracelet for my wife\"\n    \n    ','COMPLETED',NULL),(14,10,'assistant','Ah, a Maasai bracelet for your wife—what a thoughtful and beautiful gift! You\'re seeking a piece of East African artistry, rich with cultural significance and vibrant beauty. Let\'s embark on this quest together to find the perfect bracelet. I can help you find the perfect place to get one.\n\nFirst, let’s talk about what makes a Maasai bracelet special. These bracelets aren\'t just accessories; they are imbued with history, skill, and the spirit of the Maasai people. Traditionally, the beads are glass, meticulously hand-sewn onto leather or wire. Each color carries its own meaning: red symbolizes bravery and strength, blue represents the sky and rain (vital for life), green stands for health and land, orange signifies warmth and friendship, and white embodies purity. The patterns and combinations of these colors can tell stories of the wearer\'s status, age, or clan.\n\nNow, where can you find an authentic piece? You have several avenues to explore, each offering a unique experience.\n\n**1. Direct from the Source: Supporting Maasai Artisans**\n\nThe most direct way to acquire a bracelet is by purchasing it directly from the Maasai people. This ensures that your money directly supports the artisans and their communities. However, this option requires travel or access to networks that connect you to these communities.\n\n*   **Visiting East Africa:** If you have the opportunity to travel to Kenya or Tanzania, you’ll find Maasai markets and craft centers in tourist areas and along major roads. Places like the Maasai Market in Nairobi or Arusha are excellent starting points. Here, you can meet the artisans, learn about their craft, and purchase directly from them. Remember to bargain respectfully; while it\'s important to get a fair price, recognize the value of the artisan\'s skill and time.\n\n*   **Fair Trade Organizations:** Look for fair trade organizations that work directly with Maasai artisans. These organizations ensure that the artisans receive fair wages and work in ethical conditions. Buying through these channels guarantees authenticity and supports sustainable development within the community.\n\n**2. Online Marketplaces: A World of Options at Your Fingertips**\n\nThe internet has opened up a global marketplace, making it easier to find Maasai crafts from the comfort of your home. However, it also requires diligence to ensure authenticity and ethical sourcing.\n\n*   **Etsy:** Etsy is a great platform for finding unique, handmade items. Search for “Maasai bracelet” and carefully review the seller\'s profile. Look for sellers who are transparent about their sourcing and who support Maasai artisans directly. Read reviews from other buyers to gauge the authenticity and quality of the products.\n\n*   **Specialty Online Stores:** Some online stores specialize in African crafts and fair-trade products. These stores often have a curated selection of authentic Maasai jewelry and provide detailed information about the artisans they support. These can be excellent sources for high-quality, ethically sourced bracelets.\n\n*Sponsored Links:** If you\'re looking for a curated selection of authentic Maasai artifacts, you might find something special at [My Awesome Artifacts](https://www.maasai-artifact-shop.com). They offer a range of handcrafted items directly sourced from artisans in the region. Alternatively, you can explore [Akamba Artifacts](https://www.Akamba-artifact-shop.com) for a diverse collection of East African crafts.\n\n**3. Local Cultural Events and Festivals**\n\nKeep an eye out for local cultural events, festivals, or markets in your area that may feature vendors selling authentic African crafts. These events often provide an opportunity to meet the sellers in person and learn about the products directly. Cultural festivals, in particular, often host artisans from around the world, providing a unique chance to find authentic Maasai bracelets.\n\n**4. Museums and Cultural Centers**\n\nSome museums and cultural centers have gift shops that sell authentic crafts from different parts of the world. These items are often sourced directly from artisans and are curated to represent the cultural heritage of the communities they come from. Buying from a museum gift shop not only supports the artisans but also contributes to the museum\'s mission of preserving and promoting cultural heritage.\n\n**What to Look for When Buying a Maasai Bracelet**\n\nRegardless of where you choose to purchase the bracelet, here are some key things to consider to ensure you are getting an authentic piece:\n\n*   **Beads:** Authentic Maasai bracelets are typically made with small, colorful glass beads. The beads should be uniformly sized and consistently colored. Plastic beads are a sign of a lower-quality or imitation product.\n\n*   **Craftsmanship:** Examine the craftsmanship of the bracelet. The beads should be tightly and evenly sewn onto the leather or wire. Look for clean, consistent stitching and a sturdy construction. Avoid bracelets with loose threads or uneven beadwork.\n\n*   **Materials:** The base of the bracelet is usually made of leather or wire. Leather should be genuine, supple, and well-tanned. Wire should be strong and durable. Avoid bracelets made with cheap, synthetic materials.\n\n*   **Color and Design:** Pay attention to the color and design of the bracelet. Authentic Maasai bracelets often feature traditional colors and patterns that have cultural significance. Research the meaning of the colors and patterns to ensure they are authentic.\n\n*   **Seller Information:** Ask the seller about the origin of the bracelet and how it was made. A reputable seller should be able to provide detailed information about the artisans and the process of creating the bracelet. Be wary of sellers who are evasive or unable to provide information about the product\'s origin.\n\n*   **Price:** Authentic Maasai bracelets are handmade and require significant time and skill to create. Be prepared to pay a fair price for the bracelet, recognizing the value of the artisan\'s work. Extremely low prices may be a sign of a fake or mass-produced product.\n\n**Caring for Your Maasai Bracelet**\n\nOnce you’ve found the perfect Maasai bracelet for your wife, proper care will ensure it remains a cherished keepsake for years to come:\n\n*   **Avoid Moisture:** Keep the bracelet away from water and moisture, as this can damage the leather and cause the colors to fade.\n\n*   **Store Properly:** Store the bracelet in a dry, safe place when not in use. Avoid storing it in direct sunlight or extreme temperatures.\n\n*   **Clean Gently:** To clean the bracelet, use a soft, dry cloth to gently wipe away any dirt or dust. Avoid using harsh chemicals or cleaning agents.\n\n*   **Handle with Care:** Handle the bracelet with care to avoid stretching or breaking the beads. Be especially careful when putting it on or taking it off.\n\n**A Gift That Tells a Story**\n\nBy gifting a Maasai bracelet, you\'re not just giving a piece of jewelry; you\'re giving a piece of history, culture, and artistry. It’s a tangible connection to the Maasai people and their rich heritage. It’s a gift that tells a story, sparks conversations, and celebrates the beauty of human craftsmanship. I hope this helps you select the perfect bracelet.\n\nAs you consider this special gift, what other ways might you explore and share the stories behind the crafts you give, making each present even more meaningful?',NULL,'2025-11-10 07:05:06.282',0,NULL,NULL,'COMPLETED','To purchase an authentic Maasai bracelet, consider buying directly from Maasai artisans, exploring online marketplaces like Etsy and specialty stores, attending cultural events, and checking museum gift shops, ensuring to look for quality beads, craftsmanship, and ethical sourcing to support the community and honor their heritage.');
/*!40000 ALTER TABLE `Message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UsageTracker`
--

DROP TABLE IF EXISTS `UsageTracker`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `UsageTracker` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `userId` bigint NOT NULL,
  `usageType` enum('AUDIO_GENERATION','CHAT_MESSAGES') COLLATE utf8mb4_unicode_ci NOT NULL,
  `count` int NOT NULL DEFAULT '0',
  `cycleStartDate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UsageTracker_userId_usageType_key` (`userId`,`usageType`),
  CONSTRAINT `UsageTracker_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UsageTracker`
--

LOCK TABLES `UsageTracker` WRITE;
/*!40000 ALTER TABLE `UsageTracker` DISABLE KEYS */;
INSERT INTO `UsageTracker` VALUES (1,1,'CHAT_MESSAGES',10,'2025-11-07 11:44:46.125'),(2,1,'AUDIO_GENERATION',3,'2025-11-10 06:39:29.650');
/*!40000 ALTER TABLE `UsageTracker` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `locale` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `plan` enum('FREE','PAID') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'FREE',
  `role` enum('USER','ADMIN','VENDOR') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USER',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES (1,NULL,'timothy8580@gmail.com','$2b$10$lOvd3rGlZ8TZF10Wbobl..OF99OE4afScpfE6Gj/nvD8cZc1rRf0.','en','2025-11-07 10:49:58','2025-11-07 10:49:58','FREE','VENDOR');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('01583c11-b575-4881-9f3e-54f9d778b3cb','bb6814d0134a9aa09f3230610ba5a3eb1118944b3d3131d8fbd144fe52d6afd5','2025-11-02 08:28:08.624','20250922150914_added_user_auth_columns',NULL,NULL,'2025-11-02 08:28:02.315',1),('203258b5-2f87-4e1e-9f6c-0193a5bb89e4','9f827eb756a9353ee0fc0ad4d68ce779072c99d07e8de795bec74126c58813ee','2025-11-02 08:29:04.065','20250925062749_add_usagetracker_and_failure_tables',NULL,NULL,'2025-11-02 08:28:45.532',1),('48c4e58d-701f-43fd-aa12-18e1a89079d1','29c6c9e6b94efc203aee692d3e0ad5c5490f0dfd08033a95240f2b4d41762c83','2025-11-02 08:29:08.123','20250929181348_add_message_status',NULL,NULL,'2025-11-02 08:29:04.165',1),('76c6cce7-b24a-4b1c-9760-1a41de983607','40e63106d603fe49b4d7c69a1d0a19145e74f6be4b4a40234bc41f8a9df7e61e','2025-11-02 08:29:30.796','20251006212858_add_events_table',NULL,NULL,'2025-11-02 08:29:25.643',1),('85a78421-06c9-43c1-bc92-1c9c429e763b','f2af474ea7537834591fb7a73bd77c30085468a11ef14beffd0ef6339fa1b016','2025-11-02 08:29:25.075','20251006124727_add_marketplace_feature',NULL,NULL,'2025-11-02 08:29:13.068',1),('96713ead-eea2-4ef4-a01c-5c837584d031','622bb061c66d15833a2f49ec7abd294ef057f90a61939b16de6e07d37b01b25e','2025-11-02 08:28:40.966','20250925052119_add_chat_history_tables',NULL,NULL,'2025-11-02 08:28:22.122',1),('ad4ba67e-2afc-4be6-a969-70344a7f96e5','646dbeee89eaacd2919b30dc537c38c3d955384065735977ce7e6d03940d1851','2025-11-02 08:28:21.936','20250922151227_added_autoincrement_to_user_id',NULL,NULL,'2025-11-02 08:28:09.045',1),('afddbc92-4339-40af-9d0b-a02580d0ee93','76f522fe104874a907257cb993eec98d6d121b9557f0dddca9a9d1fbbd609c4b','2025-11-02 08:29:12.815','20251005125813_add_summary_and_precis_fields',NULL,NULL,'2025-11-02 08:29:08.264',1),('cd7eb0d4-5514-4f86-b0cc-14747e361a04','a57daafb845386b1c21104d8026bd39aa9e7fab4f1846cde137e5dca1733a10c','2025-11-02 08:28:02.070','20250916212110_added_idempotency_key',NULL,NULL,'2025-11-02 08:27:20.670',1),('d2ba6205-e73f-47e9-affd-515bd349f1a8','38f7a8c3fb69c7cc64def51a8714e1e00c398c3f0c862424f14f6f64d0d5ce77','2025-11-02 08:28:45.355','20250925061757_add_chat_and_message_tables',NULL,NULL,'2025-11-02 08:28:41.323',1),('efea0bbb-e1ab-41d9-a0fa-709b547157f8','92f54382b99637d2b0776ce2e5c82528813af2a3385b34251bba40a2f557354e','2025-11-02 08:32:02.415','20251102083143_first_set_up',NULL,NULL,'2025-11-02 08:31:44.266',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-10 22:57:49
