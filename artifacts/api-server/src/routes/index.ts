import { Router, type IRouter } from "express";
import healthRouter from "./health";
import udaanRouter from "./udaan";

const router: IRouter = Router();

router.use(healthRouter);
router.use(udaanRouter);

export default router;
