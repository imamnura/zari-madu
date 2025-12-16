-- CreateTable
CREATE TABLE `settings` (
    `id` VARCHAR(191) NOT NULL,
    `whatsapp` VARCHAR(191) NOT NULL DEFAULT '+6285777578827',
    `instagram` VARCHAR(191) NOT NULL DEFAULT 'https://www.instagram.com/zarihoney',
    `email` VARCHAR(191) NOT NULL DEFAULT 'info@zarilife.com',
    `shopeeLink` VARCHAR(191) NOT NULL DEFAULT 'https://id.shp.ee/GgH8AKs',
    `mapsLocation` VARCHAR(191) NOT NULL DEFAULT 'https://maps.app.goo.gl/Yfnw3MHWgm2YPEeU8',
    `mapsEmbed` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
