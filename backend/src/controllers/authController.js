const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

async function register(req, res) {
  const { name, email, password, apartment, block } = req.body;
  if (!name || !email || !password || !apartment) {
    return res.status(400).json({ error: 'Campos obrigatórios: name, email, password, apartment' });
  }

  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: 'E-mail já cadastrado' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, apartment, block },
      select: { id: true, name: true, email: true, apartment: true, block: true, role: true },
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'E-mail e senha obrigatórios' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, apartment: user.apartment } });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
}

module.exports = { register, login };
