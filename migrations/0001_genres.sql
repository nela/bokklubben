-- A book can have several genres: books.genre (text) becomes books.genres (text[]).
-- Each existing genre becomes a one-item list; books without a genre get an empty list.
ALTER TABLE "books" RENAME COLUMN "genre" TO "genres";--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "genres" SET DATA TYPE text[] USING CASE WHEN "genres" IS NULL THEN '{}' ELSE ARRAY["genres"] END;--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "genres" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "genres" SET NOT NULL;
