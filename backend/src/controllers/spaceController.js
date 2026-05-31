const prisma = require('../utils/prisma');

async function list(req, res) {
  const spaces = await prisma.space.findMany({ where: { active: true } });
  res.json(spaces);
}

async function getById(req, res) {
  const space = await prisma.space.findUnique({ where: { id: Number(req.params.id) } });
  if (!space) return res.status(404).json({ error: 'Espaço não encontrado' });
  res.json(space);
}

async function create(req, res) {
  const { name, description, capacity, imageUrl, rules } = req.body;
  if (!name || !capacity) return res.status(400).json({ error: 'Nome e capacidade são obrigatórios' });

  const space = await prisma.space.create({ data: { name, description, capacity: Number(capacity), imageUrl, rules } });
  res.status(201).json(space);
}

async function update(req, res) {
  const { name, description, capacity, imageUrl, rules, active } = req.body;
  const space = await prisma.space.update({
    where: { id: Number(req.params.id) },
    data: { name, description, capacity: capacity ? Number(capacity) : undefined, imageUrl, rules, active },
  });
  res.json(space);
}

async function remove(req, res) {
  await prisma.space.update({ where: { id: Number(req.params.id) }, data: { active: false } });
  res.json({ message: 'Espaço desativado' });
}

module.exports = { list, getById, create, update, remove };
