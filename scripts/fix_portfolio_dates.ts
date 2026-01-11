
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDates() {
  console.log('--- Fixing Portfolio Dates ---');

  try {
    // 1. Identify documents with string createdAt
    // We use $runCommandRaw to bypass Prisma's type validation which causes the error
    const result = await prisma.$runCommandRaw({
      update: "portfolios",
      updates: [
        {
          // Query: Find documents where createdAt is a string
          q: { createdAt: { $type: "string" } },
          // Update: Use aggregation pipeline to convert string to date
          // We assume the string might contain extra quotes based on the error message, 
          // or just be a plain ISO string.
          // $toDate handles ISO strings. 
          // If there are extra quotes '"2025..."', we strip them first.
          u: [
            {
              $set: {
                createdAt: {
                  $toDate: {
                    // Remove leading/trailing quotes if present (simple regex-like replace or substring)
                    // Or simpler: replace all quotes.
                    $replaceAll: { input: "$createdAt", find: "\"", replacement: "" }
                  }
                }
              }
            }
          ],
          multi: true
        },
        {
          q: { updatedAt: { $type: "string" } },
          u: [
            {
              $set: {
                updatedAt: {
                  $toDate: {
                    $replaceAll: { input: "$updatedAt", find: "\"", replacement: "" }
                  }
                }
              }
            }
          ],
          multi: true
        }
      ]
    });

    console.log('Update Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error during fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDates();
