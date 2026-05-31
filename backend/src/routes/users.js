const { Router } = require('express');
const bcrypt = require('bcryptjs');
const { authenticate, requireAdmin } = require('../middleware/auth');
const prisma = require('../utils/prisma');

const router = Router();

router.get('/', authenticate, requireAdmin, async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, apartment: true, block: true, role: true, createdAt: true },
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
  });
  res.json(users);
});

router.get('/me', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, apartment: true, block: true, role: true },
  });
  res.json(user);
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, email, password, apartment, block, role } = req.body;
  if (!name || !email || !password || !apartment) {
    return res.status(400).json({ error: 'Campos obrigatórios: name, email, password, apartment' });
  }
  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: 'E-mail já cadastrado' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, apartment, block, role: role || 'RESIDENT' },
      select: { id: true, name: true, email: true, apartment: true, block: true, role: true },
    });
    res.status(201).json(user);
  } catch {
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  const { name, email, apartment, block, role } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { name, email, apartment, block, role },
      select: { id: true, name: true, email: true, apartment: true, block: true, role: true },
    });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id) return res.status(400).json({ error: 'Não é possível remover seu próprio usuário' });
  await prisma.user.delete({ where: { id } });
  res.json({ message: 'Usuário removido' });
});

module.exports = router;
