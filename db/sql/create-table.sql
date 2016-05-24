CREATE TABLE IF NOT EXISTS matches(
  id serial primary key,
  name varchar(255),
  country_code varchar(2),
  latitude float,
  longitude float,
  gender varchar(1),
  preferences varchar(255)
);