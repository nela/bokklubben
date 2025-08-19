CREATE TABLE "meet_attendance" (
	"fk_meet_id" smallint NOT NULL,
	"fk_member_id" smallint NOT NULL,
	CONSTRAINT "meet_attendance_fk_member_id_fk_meet_id_pk" PRIMARY KEY("fk_member_id","fk_meet_id")
);
--> statement-breakpoint
ALTER TABLE "meet_attendance" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "meets" (
	"id" smallint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "meets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 32767 START WITH 1 CACHE 1),
	"datetime" timestamp with time zone NOT NULL,
	"location" varchar(256),
	"fkMemberId" smallint,
	"address" varchar(256),
	"notes" text,
	"highlights" text
);
--> statement-breakpoint
ALTER TABLE "meets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "meet_attendance" ADD CONSTRAINT "fk_member_id_members_id" FOREIGN KEY ("fk_member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meet_attendance" ADD CONSTRAINT "fk_meet_id_meets_id" FOREIGN KEY ("fk_meet_id") REFERENCES "public"."meets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meets" ADD CONSTRAINT "fk_member_id_members_id" FOREIGN KEY ("fkMemberId") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "meet_attendance_fk_member_id_idx" ON "meet_attendance" USING btree ("fk_member_id");--> statement-breakpoint
CREATE INDEX "meet_attendance_fk_meet_id_idx" ON "meet_attendance" USING btree ("fk_meet_id");