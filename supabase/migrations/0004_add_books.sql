CREATE TYPE "public"."book_status" AS ENUM('elected', 'pitched');--> statement-breakpoint
CREATE TABLE "book_status" (
	"book_status" "book_status" NOT NULL,
	"fk_book_id" smallint NOT NULL,
	"fk_meet_id" smallint
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" smallint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "books_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 32767 START WITH 1 CACHE 1),
	"author" varchar(256) NOT NULL,
	"title" varchar(256) NOT NULL,
	"first_published" smallint NOT NULL,
	"pages" smallint NOT NULL,
	"isbn" varchar(16) NOT NULL,
	"original_language" varchar(16),
	"description" text
);
--> statement-breakpoint
ALTER TABLE "book_status" ADD CONSTRAINT "fk_book_id_books_id" FOREIGN KEY ("fk_book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_status" ADD CONSTRAINT "fk_meet_id_meets_id" FOREIGN KEY ("fk_meet_id") REFERENCES "public"."meets"("id") ON DELETE no action ON UPDATE no action;
