import { prisma } from "~/utils/prisma.server";

export interface AnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  topPages: { path: string; count: number }[];
  recentVisits: {
    id: string;
    path: string;
    createdAt: Date;
    country: string | null;
    device: string | null;
  }[];
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  // Graceful fallback if Prisma client is out of sync (missing Analytics model)
  // @ts-ignore - Dynamic check for runtime safety
  if (!prisma.analytics) {
    console.warn("Prisma Client missing Analytics model. Please run 'npx prisma generate'.");
    return {
      totalViews: 0,
      uniqueVisitors: 0,
      topPages: [],
      recentVisits: []
    };
  }

  const totalViews = await prisma.analytics.count();
  
  // Unique visitors by ipHash
  // Prisma groupBy is the way, but counting distinct groups might need raw query or just fetch groupings
  const uniqueVisitorsGroup = await prisma.analytics.groupBy({
    by: ['ipHash'],
    _count: {
      ipHash: true
    }
  });
  const uniqueVisitors = uniqueVisitorsGroup.length;

  // Top Pages
  const topPagesGroup = await prisma.analytics.groupBy({
    by: ['path'],
    _count: {
      path: true
    },
    orderBy: {
      _count: {
        path: 'desc'
      }
    },
    take: 5
  });

  const topPages = topPagesGroup.map((item: any) => ({
    path: item.path,
    count: item._count.path
  }));

  // Recent Visits
  const recentVisits = await prisma.analytics.findMany({
    take: 10,
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      path: true,
      createdAt: true,
      country: true,
      device: true
    }
  });

  return {
    totalViews,
    uniqueVisitors,
    topPages,
    recentVisits
  };
}
