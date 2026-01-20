
import mongoose from "mongoose";
import { Portfolio } from "../app/models/index";

// Hardcoded for debugging purposes as I cannot read .env safely here without a proper loader, but assuming localhost default or standard pattern
// Or better, I will try to read it from process.env if available, otherwise default to local.
// Since I can't read .env easily in this context without `dotenv`, I'll assume standard local or try to read .env file?
// Actually, I can use `dotenv` if installed.
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const mongoUrl = process.env.DATABASE_URL || "mongodb://localhost:27017/yahyaoncloud";

  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB");

    const portfolio = await Portfolio.findOne();
    
    if (!portfolio) {
        console.log("No portfolio found");
        return;
    }

    console.log("Portfolio Name:", portfolio.name);
    if (portfolio.experiences && portfolio.experiences.length > 0) {
        portfolio.experiences.forEach((exp, index) => {
            console.log(`\nExperience ${index + 1}: ${exp.company}`);
            console.log("Summary:", exp.summary); // This might not be in the updated model interface but was in the file?
            // Wait, models/index.ts did NOT have 'summary' in IPortfolio.experiences!
            // It has 'description: string[]'.
            
            // Let's print the whole object to see what's actually there.
            console.log("Full Object:", JSON.stringify(exp.toObject ? exp.toObject() : exp, null, 2));
        });
    } else {
        console.log("No experiences found");
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

main();
