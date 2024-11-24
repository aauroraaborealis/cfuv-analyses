const express = require("express");
const router = express.Router();
const db = require("../db");

// Получение списка команд для выбранного вида спорта
router.get("/teams", async (req, res) => {
  const { sport_id } = req.query;

  if (!sport_id) {
    return res.status(400).json({ error: "sport_id is required" });
  }

  try {
    const result = await db.query(
      "SELECT DISTINCT team_name FROM user_sports WHERE sport_id = $1 AND team_name IS NOT NULL ORDER BY team_name",
      [sport_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching teams:", err.message);
    res.status(500).json({ error: err.message || "Unknown server error" });
  }
});

// Добавление новой команды для конкретного вида спорта
router.post("/teams", async (req, res) => {
  const { sport_id, team_name } = req.body;

  if (!sport_id || !team_name) {
    return res
      .status(400)
      .json({ error: "Both sport_id and team_name are required" });
  }

  try {
    const trimmedTeamName = team_name.trim();
    const capitalizedTeamName =
      trimmedTeamName.charAt(0).toUpperCase() +
      trimmedTeamName.slice(1).toLowerCase();

    // Проверяем, существует ли уже такая команда
    const existingTeam = await db.query(
      "SELECT * FROM user_sports WHERE sport_id = $1 AND team_name = $2",
      [sport_id, capitalizedTeamName]
    );

    if (existingTeam.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "This team already exists for the selected sport" });
    }

    // Добавляем новую команду
    const result = await db.query(
      "INSERT INTO user_sports (sport_id, team_name) VALUES ($1, $2) RETURNING team_name",
      [sport_id, capitalizedTeamName]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error adding new team:", err.message);
    res.status(500).json({ error: err.message || "Unknown server error" });
  }
});

module.exports = router;
