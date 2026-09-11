import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseId = process.env.SUPABASE_ID;
const supabaseUrl = process.env.SUPABASE_URL || (supabaseId ? `https://${supabaseId}.supabase.co` : "");
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET = "portfolio-assets";

const filesToUpload = [
  {
    local: "public/images/projects/hormuzwatch-app.png",
    remote: "projects/hormuzwatch/thumbnail.png",
    type: "image/png",
  },
  {
    local: "public/images/projects/hormuzwatch-tactical-map.png",
    remote: "projects/hormuzwatch/tactical-map.png",
    type: "image/png",
  },
  {
    local: "public/images/projects/hormuzwatch-charts.png",
    remote: "projects/hormuzwatch/charts.png",
    type: "image/png",
  },
  {
    local: "public/images/projects/firewood-fws.png",
    remote: "projects/firewood/thumbnail.png",
    type: "image/png",
  },
  {
    local: "public/images/projects/firewood-pix.png",
    remote: "projects/firewood/architecture.png",
    type: "image/png",
  },
  {
    local: "public/images/projects/ytpmd-cli.svg",
    remote: "projects/ytpmd/thumbnail.svg",
    type: "image/svg+xml",
  },
];

async function main() {
  console.log("Checking bucket:", BUCKET);
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);

  if (!exists) {
    console.log(`Creating bucket ${BUCKET}...`);
    await supabase.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 20971520 });
  }

  const results: Record<string, string> = {};

  for (const item of filesToUpload) {
    const fullLocal = path.resolve(process.cwd(), item.local);
    if (!fs.existsSync(fullLocal)) {
      console.warn("Local file missing:", fullLocal);
      continue;
    }

    const buffer = fs.readFileSync(fullLocal);
    console.log(`Uploading ${item.local} -> ${item.remote} (${buffer.length} bytes)...`);

    const { error } = await supabase.storage.from(BUCKET).upload(item.remote, buffer, {
      contentType: item.type,
      upsert: true,
    });

    if (error) {
      console.error(`Upload error for ${item.remote}:`, error.message);
    } else {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(item.remote);
      console.log(`Uploaded! URL: ${data.publicUrl}`);
      results[item.remote] = data.publicUrl;
    }
  }

  console.log("\nSummary of Supabase URLs:");
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
