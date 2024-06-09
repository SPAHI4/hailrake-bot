CREATE TABLE IF NOT EXISTS "users" (
	"id" bigint NOT NULL,
	"chat_id" bigint NOT NULL,
	"username" varchar(255),
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255),
	"is_bot" boolean DEFAULT false NOT NULL,
	"rating" real DEFAULT 1 NOT NULL,
	"voted_at" timestamp (3) with time zone DEFAULT now() - interval '1 day' NOT NULL,
	"played_casino_at" timestamp (3) with time zone DEFAULT now() - interval '1 day' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone NOT NULL,
	CONSTRAINT "users_id_chat_id_pk" PRIMARY KEY("id","chat_id")
);
