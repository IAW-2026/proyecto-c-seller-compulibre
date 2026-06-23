import { ProductCategory } from "@prisma/client";

import { prisma } from "./prisma";
import { getProductCategoryLabel } from "./product-labels";

type CategorySalesRow = {
  category: ProductCategory;
  sales: bigint;
};

export async function getAnalyticsSummary() {
  const [activeSellers, totalProducts, categorySales] = await Promise.all([
    prisma.product.findMany({
      distinct: ["seller_id"],
      select: {
        seller_id: true,
      },
    }),
    prisma.product.count(),
    prisma.$queryRaw<CategorySalesRow[]>`
      SELECT p.category, COALESCE(SUM(soi.quantity), 0)::bigint AS sales
      FROM "SellerOrderItem" soi
      INNER JOIN "Product" p ON p.id = soi.product_id
      GROUP BY p.category
    `,
  ]);

  const salesByCategory = new Map<ProductCategory, number>(
    Object.values(ProductCategory).map((category) => [category, 0])
  );

  categorySales.forEach((row) => {
    const currentSales = salesByCategory.get(row.category) ?? 0;

    salesByCategory.set(row.category, currentSales + Number(row.sales));
  });

  return {
    activeSellers: activeSellers.length,
    totalProducts,
    categoryChart: Array.from(salesByCategory.entries()).map(
      ([category, sales]) => ({
        category: getProductCategoryLabel(category),
        sales,
      })
    ),
  };
}
