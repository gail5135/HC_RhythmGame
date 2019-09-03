create table score_data(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    userName VARCHAR(20) NOT NULL,
    score INT NOT NULL,
    bestScore BOOLEAN NOT NULL,
    recordDate DATETIME DEFAULT CURRENT_TIMESTAMP
);

insert into score_data(userName, score, bestScore, recordDate) values("NICE", 100, 0, NOW());
insert into score_data(userName, score, bestScore, recordDate) values("GOOD", 360, 1, NOW());
insert into score_data(userName, score, bestScore, recordDate) values("very", 50, 0, NOW());