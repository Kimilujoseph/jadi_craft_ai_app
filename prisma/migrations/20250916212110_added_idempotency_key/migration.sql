-- CreateTable
CREATE TABLE `QUESTIONS` (
    `question_ID` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `idempotency_key` VARCHAR(191) NULL,
    `raw_query` TEXT NOT NULL,
    `refined_prompt` MEDIUMTEXT NOT NULL,
    `fallback_used` TINYINT NULL DEFAULT 0,
    `status` VARCHAR(20) NOT NULL,
    `error_message` TEXT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `question_IS_UNIQUE`(`question_ID`),
    UNIQUE INDEX `QUESTIONS_idempotency_key_key`(`idempotency_key`),
    INDEX `fk_QUESTIONS_1_idx`(`user_id`),
    PRIMARY KEY (`question_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `user_id` BIGINT NOT NULL,
    `locale` VARCHAR(45) NOT NULL DEFAULT 'en',
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `response` (
    `response_id` BIGINT NOT NULL,
    `question_id` BIGINT NULL,
    `text_answer` MEDIUMTEXT NOT NULL,
    `audio_url` VARCHAR(255) NULL,
    `tts_failed` TINYINT NULL DEFAULT 0,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `response_id_UNIQUE`(`response_id`),
    INDEX `fk_response_1_idx`(`question_id`),
    PRIMARY KEY (`response_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `QUESTIONS` ADD CONSTRAINT `fk_QUESTIONS_1` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `response` ADD CONSTRAINT `fk_response_1` FOREIGN KEY (`question_id`) REFERENCES `QUESTIONS`(`question_ID`) ON DELETE CASCADE ON UPDATE CASCADE;
