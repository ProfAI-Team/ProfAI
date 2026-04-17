import type { Request, Response } from "express";

import { parseOrRespond } from "../lib/validation";
import { paginationQuerySchema } from "../schemas/community";
import { getBalance, getHistory } from "../services/creditService";

export const getBalanceController = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "Not authenticated." } });
    return;
  }
  const balance = await getBalance(req.user.id);
  res.json(balance);
};

export const getHistoryController = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "Not authenticated." } });
    return;
  }
  const query = parseOrRespond(paginationQuerySchema, req.query ?? {}, res);
  if (query === null) return;
  const history = await getHistory(req.user.id, {
    limit: query.limit,
    offset: query.offset,
  });
  res.json(history);
};
