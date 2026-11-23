-- Fake data for local development. Wipes the app tables (not the auth tables) and refills them.
-- Run with: pnpm db:seed
-- Slugs must match createSlug() in src/lib/utils/helpers.ts.

\set ON_ERROR_STOP on

do $$
begin
	if current_user <> 'bokklubben' then
		raise exception 'Refusing to seed: % is not the local dev database user', current_user;
	end if;
end $$;

begin;

truncate meet_attendance, meet_books, book_authors, meets, books, authors, members restart identity cascade;

-- Members -------------------------------------------------------------------

insert into members (first_name, last_name, nickname, email, role, titles, member_since, member_until) values
	('Kari',    'Nordmann',  null,       'kari@example.com',    'admin',   '{FOUNDING_FATHER,CTO}',  '2019-02-01', null),
	('Ola',     'Hansen',    'Bokormen', 'ola@example.com',     'regular', '{FOUNDING_FATHER,CFO}',  '2019-02-01', null),
	('Ingrid',  'Berg',      null,       'ingrid@example.com',  'regular', '{WHIP}',                 '2020-08-15', null),
	('Per',     'Johansen',  null,       'per@example.com',     'regular', '{BUREAUCRAT,EXECUTIONER}','2021-01-10', null),
	('Sofie',   'Larsen',    'Sossen',   'sofie@example.com',   'regular', '{USURPER}',              '2022-05-03', null),
	('Magnus',  'Dahl',      null,       'magnus@example.com',  'regular', '{PROBATE}',              '2025-10-01', null),
	('Hanne',   'Strand',    null,       'hanne@example.com',   'regular', '{HONORARY}',             '2019-06-01', '2024-12-31');

-- Authors -------------------------------------------------------------------

insert into authors (slug, name, bio, born, died, awards, image_url) values
	('cormac-mccarthy', 'Cormac McCarthy',
		'Amerikansk forfatter kjent for et nakent, voldsomt språk og landskap som nesten blir egne karakterer.',
		'1933-07-20', '2023-06-13',
		array['Pulitzerprisen for skjønnlitteratur (2007)', 'National Book Award (1992)'],
		'https://picsum.photos/seed/cormac-mccarthy/400/533'),
	('haruki-murakami', 'Haruki Murakami',
		'Japansk forfatter som blander det hverdagslige med det drømmeaktige.',
		'1949-01-12', null,
		array['Franz Kafka-prisen (2006)', 'Jerusalem-prisen (2009)'],
		'https://picsum.photos/seed/haruki-murakami/400/533'),
	('george-orwell', 'George Orwell',
		'Britisk forfatter og journalist, mest kjent for sine politiske romaner.',
		'1903-06-25', '1950-01-21',
		'{}',
		'https://picsum.photos/seed/george-orwell/400/533'),
	('terry-pratchett', 'Terry Pratchett',
		'Britisk fantasyforfatter, skaperen av Discworld.',
		'1948-04-28', '2015-03-12',
		'{}',
		'https://picsum.photos/seed/terry-pratchett/400/533'),
	('neil-gaiman', 'Neil Gaiman',
		'Britisk forfatter av romaner, tegneserier og barnebøker.',
		'1960-11-10', null,
		array['Hugo Award'],
		'https://picsum.photos/seed/neil-gaiman/400/533'),
	('karl-ove-knausgard', 'Karl Ove Knausgård',
		'Norsk forfatter, kjent for det selvbiografiske romanprosjektet Min kamp.',
		'1968-12-06', null,
		array['Brageprisen (2009)'],
		'https://picsum.photos/seed/karl-ove-knausgard/400/533'),
	('kazuo-ishiguro', 'Kazuo Ishiguro',
		'Britisk-japansk forfatter med stillferdige fortellere og upålitelig hukommelse.',
		'1954-11-08', null,
		array['Nobelprisen i litteratur (2017)', 'Bookerprisen (1989)'],
		'https://picsum.photos/seed/kazuo-ishiguro/400/533'),
	('toni-morrison', 'Toni Morrison',
		'Amerikansk forfatter og redaktør.',
		'1931-02-18', '2019-08-05',
		array['Nobelprisen i litteratur (1993)', 'Pulitzerprisen for skjønnlitteratur (1988)'],
		'https://picsum.photos/seed/toni-morrison/400/533'),
	-- Only pitched, never read: should not show up in the author list.
	('yuval-noah-harari', 'Yuval Noah Harari', null, '1976-02-24', null, '{}', null),
	('andy-weir', 'Andy Weir', null, null, null, '{}', null);

-- Books ---------------------------------------------------------------------

insert into books (slug, title, isbn, description, first_published, pages, original_language, genre, rating, awards) values
	('the-road', 'The Road', '9780307387899',
		'En far og en sønn vandrer gjennom et nedbrent Amerika.',
		2006, 287, 'Engelsk', 'Postapokalyptisk', 3.99, array['Pulitzerprisen for skjønnlitteratur (2007)']),
	('norwegian-wood', 'Norwegian Wood', '9780375704024',
		'Toru ser tilbake på studietiden i Tokyo på slutten av 60-tallet.',
		1987, 296, 'Japansk', 'Roman', 4.02, '{}'),
	('good-omens', 'Good Omens', '9780060853983',
		'En engel og en demon prøver å forhindre dommedag.',
		1990, 412, 'Engelsk', 'Fantasy', 4.25, '{}'),
	('the-remains-of-the-day', 'The Remains of the Day', '9780679731726',
		'En butler på biltur gjennom England tenker tilbake på et liv i tjeneste.',
		1989, 245, 'Engelsk', 'Roman', 4.13, array['Bookerprisen (1989)']),
	-- Missing description and rating, to exercise the null handling.
	('never-let-me-go', 'Never Let Me Go', '9781400078776',
		null,
		2005, 288, 'Engelsk', null, null, '{}'),
	('min-kamp-1', 'Min kamp 1', null,
		'Første bind av Knausgårds selvbiografiske romanserie.',
		2009, 441, 'Norsk', 'Roman', 3.90, array['Brageprisen (2009)']),
	('1984', '1984', '9780451524935',
		'Winston Smith lever under Storebrors overvåkning.',
		1949, 328, 'Engelsk', 'Dystopi', 4.19, '{}'),
	('beloved', 'Beloved', '9781400033416',
		'Sethe er rømt fra slaveriet, men fortiden følger etter henne.',
		1987, 324, 'Engelsk', 'Roman', 3.90, array['Pulitzerprisen for skjønnlitteratur (1988)']),
	-- Pitched, never read.
	('sapiens', 'Sapiens', '9780062316097',
		'En kort historie om menneskeheten.',
		2011, 443, 'Hebraisk', 'Sakprosa', 4.37, '{}'),
	('project-hail-mary', 'Project Hail Mary', '9780593135204',
		null, 2021, 476, 'Engelsk', 'Science fiction', 4.50, '{}'),
	('blood-meridian', 'Blood Meridian', '9780679728757',
		null, 1985, 351, 'Engelsk', 'Western', 4.17, '{}');

update books set image_url = 'https://covers.openlibrary.org/b/isbn/' || isbn || '-L.jpg' where isbn is not null;
update books set image_url = 'https://covers.openlibrary.org/b/isbn/9780374534141-L.jpg' where slug = 'min-kamp-1';

insert into book_authors (book_id, author_id)
select b.id, a.id
from (values
	('the-road', 'cormac-mccarthy'),
	('blood-meridian', 'cormac-mccarthy'),
	('norwegian-wood', 'haruki-murakami'),
	('good-omens', 'terry-pratchett'),
	('good-omens', 'neil-gaiman'),
	('the-remains-of-the-day', 'kazuo-ishiguro'),
	('never-let-me-go', 'kazuo-ishiguro'),
	('min-kamp-1', 'karl-ove-knausgard'),
	('1984', 'george-orwell'),
	('beloved', 'toni-morrison'),
	('sapiens', 'yuval-noah-harari'),
	('project-hail-mary', 'andy-weir')
) as v (book, author)
join books b on b.slug = v.book
join authors a on a.slug = v.author;

-- Meets ---------------------------------------------------------------------
-- Times are Oslo local time. Meet 7 is always two weeks from today.

insert into meets (id, starts_at, host_id, location, address, notes, highlights)
overriding system value
select v.id, v.local_time at time zone 'Europe/Oslo', m.id, v.location, v.address, v.notes, v.highlights
from (values
	(1, timestamp '2025-09-18 19:00', 'kari@example.com',   'Hos Kari',    'Eksempelveien 1, 0150 Oslo', null, 'Lang diskusjon om slutten.'),
	(2, timestamp '2025-11-06 19:00', 'ola@example.com',    'Hos Ola',     'Testgata 12, 0560 Oslo',     null, null),
	(3, timestamp '2026-01-22 19:00', 'ingrid@example.com', 'Hos Ingrid',  'Prøvestien 3, 0470 Oslo',    'Ta med snacks.', 'Alle likte boka. Det skjer aldri.'),
	(4, timestamp '2026-03-12 19:00', 'per@example.com',    'Kafé Fiktiv', 'Oppdiktet plass 5, 0180 Oslo', 'Dobbeltmøte: to bøker.', null),
	(5, timestamp '2026-05-07 19:00', 'sofie@example.com',  'Hos Sofie',   'Eksempelveien 9, 0150 Oslo', null, null),
	(6, timestamp '2026-09-10 19:00', 'magnus@example.com', 'Hos Magnus',  'Testgata 40, 0560 Oslo',     null, 'Magnus sin første gang som vert.'),
	(7, (current_date + 14) + time '19:00', 'kari@example.com', 'Hos Kari', 'Eksempelveien 1, 0150 Oslo', 'Husk å lese boka.', null)
) as v (id, local_time, host, location, address, notes, highlights)
join members m on m.email = v.host;

select setval(pg_get_serial_sequence('meets', 'id'), (select max(id) from meets));

-- What happened to which book at which meet.
-- Sapiens gets pitched again and again and never elected.
insert into meet_books (meet_id, book_id, status, pitched_by)
select v.meet, b.id, v.status::meet_book_status, m.id
from (values
	(1, 'the-road',               'read',    null),
	(1, 'sapiens',                'pitched', 'per@example.com'),
	(1, 'blood-meridian',         'pitched', 'ola@example.com'),
	(1, 'norwegian-wood',         'elected', 'ingrid@example.com'),
	(2, 'norwegian-wood',         'read',    null),
	(2, 'sapiens',                'pitched', 'per@example.com'),
	(2, 'good-omens',             'elected', 'sofie@example.com'),
	(3, 'good-omens',             'read',    null),
	(3, 'sapiens',                'pitched', 'per@example.com'),
	(3, 'beloved',                'pitched', 'kari@example.com'),
	(3, 'the-remains-of-the-day', 'elected', 'ola@example.com'),
	(3, 'never-let-me-go',        'elected', 'ingrid@example.com'),
	(4, 'the-remains-of-the-day', 'read',    null),
	(4, 'never-let-me-go',        'read',    null),
	(4, 'sapiens',                'pitched', 'per@example.com'),
	(4, 'min-kamp-1',             'elected', 'kari@example.com'),
	(5, 'min-kamp-1',             'read',    null),
	(5, 'project-hail-mary',      'pitched', 'magnus@example.com'),
	(5, '1984',                   'elected', 'per@example.com'),
	(6, '1984',                   'read',    null),
	(6, 'sapiens',                'pitched', 'per@example.com'),
	(6, 'beloved',                'elected', 'kari@example.com'),
	(7, 'beloved',                'read',    null),
	(7, 'project-hail-mary',      'pitched', 'magnus@example.com')
) as v (meet, book, status, pitcher)
join books b on b.slug = v.book
left join members m on m.email = v.pitcher;

-- Past meets only. Everyone who was a member at the time, minus a few absences.
insert into meet_attendance (meet_id, member_id)
select mt.id, m.id
from meets mt
join members m
	on m.member_since <= mt.starts_at
	and (m.member_until is null or m.member_until >= mt.starts_at)
where mt.starts_at < now()
	and (mt.id + m.id) % 5 <> 0;

commit;

select
	(select count(*) from members) as members,
	(select count(*) from authors) as authors,
	(select count(*) from books) as books,
	(select count(*) from meets) as meets,
	(select count(*) from meet_books) as meet_books,
	(select count(*) from meet_attendance) as attendance;
