ALTER TABLE "tags" DROP CONSTRAINT "tags_label_unique";--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_label_unique" UNIQUE("user_id","label");