-- Club titles become rows that can be edited in the admin, instead of a fixed enum.
CREATE TABLE "club_titles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "club_titles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "club_titles_name_unique" UNIQUE("name"),
	CONSTRAINT "club_titles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "member_titles" (
	"member_id" integer NOT NULL,
	"title_id" integer NOT NULL,
	CONSTRAINT "member_titles_member_id_title_id_pk" PRIMARY KEY("member_id","title_id")
);
--> statement-breakpoint
ALTER TABLE "member_titles" ADD CONSTRAINT "member_titles_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_titles" ADD CONSTRAINT "member_titles_title_id_club_titles_id_fk" FOREIGN KEY ("title_id") REFERENCES "public"."club_titles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "member_titles_title_id_idx" ON "member_titles" USING btree ("title_id");--> statement-breakpoint
-- The nine titles that were a fixed list in the code, with the names shown on the site.
INSERT INTO "club_titles" ("name", "slug") VALUES
	('CTO', 'cto'),
	('CFO', 'cfo'),
	('Whip', 'whip'),
	('Byråkraten', 'byrakraten'),
	('Tittel raner', 'tittel-raner'),
	('Bøddel', 'boddel'),
	('Prospekt', 'prospekt'),
	('Ærede Medlem', 'aerede-medlem'),
	('Founding Father', 'founding-father');--> statement-breakpoint
-- Members keep their titles: the old enum keys map to the new rows by name.
INSERT INTO "member_titles" ("member_id", "title_id")
SELECT m."id", ct."id"
FROM "members" m
CROSS JOIN LATERAL unnest(m."titles") AS t("key")
JOIN (VALUES
	('CTO', 'CTO'),
	('CFO', 'CFO'),
	('WHIP', 'Whip'),
	('BUREAUCRAT', 'Byråkraten'),
	('USURPER', 'Tittel raner'),
	('EXECUTIONER', 'Bøddel'),
	('PROBATE', 'Prospekt'),
	('HONORARY', 'Ærede Medlem'),
	('FOUNDING_FATHER', 'Founding Father')
) AS k("key", "name") ON k."key" = t."key"::text
JOIN "club_titles" ct ON ct."name" = k."name";--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN "titles";--> statement-breakpoint
DROP TYPE "public"."club_title";