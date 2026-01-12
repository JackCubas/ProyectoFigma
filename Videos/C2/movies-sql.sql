DROP DATABASE IF EXISTS `firma_app`;
CREATE DATABASE IF NOT EXISTS `firma_app`;

DROP TABLE IF EXISTS `Movies`;

CREATE TABLE `Movies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `prodId` int(11) NOT NULL,
  `price` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `Movies` (prodId, price, quantity) VALUES
	(100,20,125),
	(101,10,234),
	(102,15,432),
	(103,17,320),
	(104,70,240);


DROP TABLE IF EXISTS `Users`;

CREATE TABLE `Users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nameUser` varchar(50) NOT NULL,
  `emailUser` varchar(50) NOT NULL,
  `passUser` varchar(50) NOT NULL,
  `rolUser` varchar(50) NOT NULL,
  `encryptKeyUser` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `Users` (nameUser, emailUser, passUser, rolUser, encryptKeyUser) VALUES
	('Steve','steve@gmail.com','stevePass', 'ADMIN','pruebaKey'),
  ('David','david1@gmail.com','david1Pass','CLIENT','davidKey'),
  ('Luis','luis@gmail.com','luisPass','CLIENT','luisKey'),
  ('Robert','robert@gmail.com','robertPass','FIRMA','robertKey');


DROP TABLE IF EXISTS `Pdfs`;

CREATE TABLE `Pdfs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `urlCarpeta` varchar(100),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `Pdfs` (name, pdfBase64) VALUES
(pic1, /9j/4AAQSkZJRgABAQEASABIAAD/...),
(doc1, R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=);