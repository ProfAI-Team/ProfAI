import { Request, Response } from "express";

import {
  createItem,
  search as searchItems,
  getItemById,
  calculateCommission,
} from "../services/marketplaceService";
import { unauthorized, notFound, badRequest } from "../lib/AppError";
import {
  createMarketplaceItemSchema,
  marketplaceSearchSchema,
} from "../schemas/b2b";
import { initPayment } from "../services/paymentService";

export const createMarketplaceItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) throw unauthorized();
  const parsed = createMarketplaceItemSchema.safeParse(req.body);
  if (!parsed.success) {
    throw badRequest("Invalid item payload", parsed.error.issues);
  }
  const item = await createItem({
    sellerId: req.user.id,
    ...parsed.data,
    previewText: parsed.data.previewText ?? null,
  });
  res.status(201).json({ data: item });
};

export const listItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = marketplaceSearchSchema.safeParse(req.query);
  if (!parsed.success) {
    throw badRequest("Invalid query", parsed.error.issues);
  }
  const items = await searchItems(parsed.data);
  res.json({ data: items });
};

export const getItem = async (req: Request, res: Response): Promise<void> => {
  const item = await getItemById(req.params.id as string);
  if (!item) throw notFound("Item not found");
  res.json({ data: item });
};

export const purchase = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) throw unauthorized();
  const item = await getItemById(req.params.id as string);
  if (!item) throw notFound("Item not found");
  if (!item.approved) throw notFound("Item not available for purchase");

  const payment = await initPayment({
    userId: req.user.id,
    kind: "marketplace",
    amountKurus: item.price * 100,
    callbackUrl: `${process.env.CORS_ORIGIN ?? "http://localhost:3001"}/checkout/callback`,
    metadata: { marketplaceItemId: item.id },
  });
  res.status(201).json({
    data: {
      payment: payment.payment,
      checkoutUrl: payment.checkoutUrl,
      commission: calculateCommission(item.price, item.type as "notes" | "study_guide"),
    },
  });
};
