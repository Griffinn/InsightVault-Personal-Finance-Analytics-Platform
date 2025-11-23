// wishlistApi.js
import express from "express";
import { getWishlist } from "../controllers/wishlistController.js";

export const wishlistApiRouter = express.Router();

wishlistApiRouter.get("/", getWishlist);


