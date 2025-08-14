CREATE TABLE "meet_attendance" (
	"fk_meet_id" smallint NOT NULL,
	"fk_member_id" smallint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "meet_attendance" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "meets" (
	"id" smallint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "meets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 32767 START WITH 1 CACHE 1),
	"datetime" timestamp with time zone NOT NULL,
	"location" varchar(256),
	"address" varchar(256),
	"notes" text,
	"summary" text,
	"highlights" text
);
--> statement-breakpoint
ALTER TABLE "meets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "meet_attendance" ADD CONSTRAINT "fk_member_id_members_id" FOREIGN KEY ("fk_member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meet_attendance" ADD CONSTRAINT "fk_meet_id_meets_id" FOREIGN KEY ("fk_meet_id") REFERENCES "public"."meets"("id") ON DELETE no action ON UPDATE no action;