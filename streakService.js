import { pool } from "./db.js";
import { differenceInCalendarDays } from "date-fns";

// ▶️ Call this whenever user completes today's activity
export async function updateUserStreak(uid, email) {
  const today = new Date().toISOString().split("T")[0];

  const { rows } = await pool.query(
    "SELECT * FROM user_streaks WHERE uid=$1",
    [uid]
  );

  // First time user
  if (rows.length === 0) {
    await pool.query(
      `INSERT INTO user_streaks
       (uid, email, current_streak, last_active_date, max_streak)
       VALUES ($1,$2,1,$3,1)`,
      [uid, email, today]
    );
    return 1;
  }

  const user = rows[0];

  // If date is missing (shouldn't happen but safe)
  if (!user.last_active_date) {
    await pool.query(
      `UPDATE user_streaks
       SET current_streak=1,
           last_active_date=$1,
           max_streak=1
       WHERE uid=$2`,
      [today, uid]
    );
    return 1;
  }

  const diff = differenceInCalendarDays(
    new Date(today),
    new Date(user.last_active_date)
  );

  let newStreak = user.current_streak;

  // Same day — don't change streak
  if (diff === 0) return user.current_streak;

  // Consecutive day → increase streak
  if (diff === 1) newStreak++;

  // Missed 1+ days → reset and start at 1
  if (diff >= 2) newStreak = 1;

  const maxStreak = Math.max(newStreak, user.max_streak);

  await pool.query(
    `UPDATE user_streaks
     SET current_streak=$1,
         last_active_date=$2,
         max_streak=$3
     WHERE uid=$4`,
    [newStreak, today, maxStreak, uid]
  );

  return newStreak;
}


// ▶️ Call this when you only want to SHOW the streak
export async function getUserStreak(uid) {
  const today = new Date().toISOString().split("T")[0];

  const { rows } = await pool.query(
    "SELECT * FROM user_streaks WHERE uid=$1",
    [uid]
  );

  if (rows.length === 0) return 0;

  const user = rows[0];
  if (!user.last_active_date) return 0;

  const diff = differenceInCalendarDays(
    new Date(today),
    new Date(user.last_active_date)
  );

  // ❌ Missed even 1 day → streak becomes 0 (like LeetCode)
  if (diff >= 1) {
    await pool.query(
      `UPDATE user_streaks
       SET current_streak = 0
       WHERE uid = $1`,
      [uid]
    );
    return 0;
  }

  return user.current_streak;
}
