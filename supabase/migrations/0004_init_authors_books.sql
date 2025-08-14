CREATE TYPE "public"."book_status" AS ENUM('elected', 'pitched');--> statement-breakpoint
CREATE TABLE "authors" (
	"id" smallint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "authors_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 32767 START WITH 1 CACHE 1),
	"name" varchar(256) NOT NULL,
	"description" text NOT NULL,
	"image_url" varchar(256) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "authors" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "book_author" (
	"fk_book_id" smallint NOT NULL,
	"fk_author_id" smallint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "book_author" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "book_meet" (
	"book_status" "book_status" NOT NULL,
	"fk_book_id" smallint NOT NULL,
	"fk_meet_id" smallint
);
--> statement-breakpoint
ALTER TABLE "book_meet" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "books" (
	"id" smallint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "books_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 32767 START WITH 1 CACHE 1),
	"title" varchar(256) NOT NULL,
	"first_published" smallint NOT NULL,
	"pages" smallint NOT NULL,
	"awards" varchar(512),
	"original_language" varchar(16) NOT NULL,
	"description" text NOT NULL,
	"genre" varchar(64) NOT NULL,
	"read" date NOT NULL,
	"image_url" varchar(2048) NOT NULL,
	"goodreads_rating" numeric(4, 2) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "books" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "book_author" ADD CONSTRAINT "fk_book_id_books_id" FOREIGN KEY ("fk_book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_author" ADD CONSTRAINT "fk_author_id_authors_id" FOREIGN KEY ("fk_author_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_meet" ADD CONSTRAINT "fk_book_id_books_id" FOREIGN KEY ("fk_book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_meet" ADD CONSTRAINT "fk_meet_id_meets_id" FOREIGN KEY ("fk_meet_id") REFERENCES "public"."meets"("id") ON DELETE cascade ON UPDATE no action;