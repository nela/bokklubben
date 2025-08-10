CREATE TYPE "public"."app_role" AS ENUM('admin', 'regular');--> statement-breakpoint
CREATE TABLE "club_titles" (
	"id" smallint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "club_titles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 32767 START WITH 1 CACHE 1),
	"name" varchar(32) NOT NULL,
	CONSTRAINT "uq_club_title_name_key" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "club_titles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "member_club_title" (
	"fk_member_id" smallint NOT NULL,
	"fk_club_title_id" smallint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "member_club_title" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "members" (
	"id" smallint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "members_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 32767 START WITH 1 CACHE 1),
	"fk_auth_id" uuid,
	"firstname" varchar(256) NOT NULL,
	"lastname" varchar(256) NOT NULL,
	"username" varchar(256),
	"email" varchar(256) NOT NULL,
	"member_since" timestamp with time zone DEFAULT now() NOT NULL,
	"member_to" timestamp with time zone,
	"app_role" "app_role" DEFAULT 'regular' NOT NULL,
	"image_url" varchar(2048) NOT NULL,
	CONSTRAINT "uq_member_email_key" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "member_club_title" ADD CONSTRAINT "fk_member_id_members_id" FOREIGN KEY ("fk_member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_club_title" ADD CONSTRAINT "fk_bk_title_id_bk_titles_it" FOREIGN KEY ("fk_club_title_id") REFERENCES "public"."club_titles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "fk_auth_id_auth_id" FOREIGN KEY ("fk_auth_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;