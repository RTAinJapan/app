import { $ } from "execa";

const migrationName = process.argv[2];

if (!migrationName) {
	throw new Error("migration name is required");
}

const { stdout } =
	await $`wrangler d1 migrations create dev-rtainjapan-app ${migrationName}`;

const result = /Successfully created Migration '(.+)'!/.exec(stdout);

if (!result) {
	throw new Error("migration creation stdout is not as expected:" + stdout);
}

const migrationFileName = result[1];

if (!migrationFileName) {
	throw new Error("migration creation stdout is not as expected:" + stdout);
}

await $`prisma migrate diff --from-local-d1 --to-schema-datamodel ./prisma/schema.prisma --script --output migrations/${migrationFileName}`;

await $`wrangler d1 migrations apply dev-rtainjapan-app --local`;
