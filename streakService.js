import { pool } from "./db.js";
import { differenceInCalendarDays } from "date-fns";

export async function updateUserStreak(uid, email) {
  const today = new Date().toISOString().split("T")[0];

  const { rows } = await pool.query(
    "SELECT * FROM user_streaks WHERE uid=$1",
    [uid]
  );

  // First-time user
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

  // 🔥 HANDLE NULL DATE
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

  if (diff === 1) newStreak++;
  else if (diff > 1) newStreak = 1;
  else return user.current_streak;

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


export async function getUserStreak(uid) {
  const { rows } = await pool.query(
    "SELECT current_streak FROM user_streaks WHERE uid=$1",
    [uid]
  );

  if (rows.length === 0) return 0;
  return rows[0].current_streak ?? 0;
}
