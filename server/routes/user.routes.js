const Router = require('express');
const router = new Router();
const userController = require('../controller/user.controller');
const db = require('../db');
const bcrypt = require('bcrypt');

router.post('/register', userController.createUser);
router.get('/users', userController.getUsers);
router.get('/user/:id', userController.getOneUser);
router.put('/user', userController.updateUser);
router.delete('/user/:id', userController.deleteUser);

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Проверяем, существует ли пользователь с таким email
      const userResult = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      const user = userResult.rows[0];
  
      if (!user) {
        return res.status(401).json({ error: "Неверный email или пароль" });
      }
  
      // Проверяем пароль
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Неверный email или пароль" });
      }
  
      // Возвращаем данные пользователя без пароля
      const { id, name, surname } = user;
      res.json({ user: { id, name, surname } });
    } catch (err) {
      console.error("Ошибка входа:", err.message);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  });

module.exports = router;
