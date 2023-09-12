create table students(
    student integer primary key,
    password integer,
    surname varchar(30),
    initials varchar(30),
    stgroup varchar(30) references stgroups(stgroup),
    notify Boolean not null default false,
    is_deleted Boolean not null default false
);
create table marks(
    student integer references students(student),
    year integer,
    season varchar(30),
    subject varchar(200) references subjects(subject),
    module varchar(2) references modules(module),
    mark integer,
    id integer not null unique,
    isSubscribed Boolean not null default false,
    primary key(student, year, season, subject, module, mark),
    foreign key(year, season) references semesters(year, season)
);
create table users(
    id integer primary key,
    isPublic Boolean,
    student integer references students(student)
);
create table semesters (
    year integer primary key,
    season varchar(30) primary key
);
create table stgroups (stgroup varchar(30) primary key);
create table subjects (subject varchar(200) primary key);
create table modules (module varchar(2) primary key);