
import mongoose, { Schema } from "mongoose";

// Define minimal schema locally to avoid import issues
const PortfolioSchema = new Schema(
  {
    name: { type: String, required: true },
    experiences: [
      {
        company: { type: String },
        summary: { type: String },
        description: [{ type: String }], // Array of strings
      },
    ],
  },
  { collection: "portfolios", strict: false } // strict: false to allow reading fields not defined here if needed, but we defined experience structure
);

const Portfolio = mongoose.model("Portfolio", PortfolioSchema);

async function main() {
  // Use default local URL or try to guess. The user has "yahyaoncloud" in their path, so likely "yahyaoncloud" db name.
  // Previous logs showed connection string usage might be necessary.
  // I will assume standard localhost or try to read .env file content directly if I could.
  // For now, let's try strict localhost.
  const mongoUrl = "mongodb://localhost:27017/yahyaoncloud";

  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB at " + mongoUrl);

    const portfolio = await Portfolio.findOne();
    
    if (!portfolio) {
        console.log("No portfolio found");
    } else {
        console.log("Portfolio Name:", portfolio.name);
        if (portfolio.experiences && portfolio.experiences.length > 0) {
            portfolio.experiences.forEach((exp: any, index: number) => {
                console.log(`\nExperience ${index + 1}: ${exp.company}`);
                console.log("Summary:", exp.summary);
                console.log("Description Type:", Array.isArray(exp.description) ? "Array" : typeof exp.description);
                console.log("Description Value:", JSON.stringify(exp.description, null, 2));
            });
        } else {
            console.log("No experiences found");
        }
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

main();
