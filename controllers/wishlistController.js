// controllers/wishlistController.js
import { getDBConnection } from "../db/db.js";

export const getWishlist = async (req, res) => {
  try {
    const db = await getDBConnection();

    // TODO later: replace with real auth user id
    const userId = 1;

    const rows = await db.all(
      `SELECT id, item_name, target_amount, saved_amount, created_at 
       FROM wishlist 
       WHERE user_id = ?`,
      [userId]
    );

    res.json({
      success: true,
      data: rows
    });

    db.close();
  } catch (err) {
    console.error("WISHLIST FETCH ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching wishlist"
    });
  }
};
