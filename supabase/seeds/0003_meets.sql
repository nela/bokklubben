insert into "meets" ("datetime", "location", "fkMemberId", "address", "notes", "highlights")
values ('2025-08-23 18:00:00', 'Ole Bendik''s nye casa', 3, 'Petersens vei', null, null);

insert into "book_meet" ("book_status", "fk_book_id", "fk_meet_id")
values ('read', 1, 1);
