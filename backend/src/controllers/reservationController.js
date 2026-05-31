const prisma = require('../utils/prisma');

async function list(req, res) {
  const where = req.user.role === 'ADMIN' ? {} : { userId: req.user.id };
  const reservations = await prisma.reservation.findMany({
    where,
    include: { space: true, user: { select: { name: true, apartment: true, block: true } } },
    orderBy: { date: 'asc' },
  });
  res.json(reservations);
}

async function getBySpace(req, res) {
  const { spaceId } = req.params;
  const { date } = req.query;
  const where = { spaceId: Number(spaceId), status: { not: 'CANCELLED' } };
  if (date) where.date = new Date(date);

  const reservations = await prisma.reservation.findMany({ where, select: { date: true, startTime: true, endTime: true, status: true } });
  res.json(reservations);
}

async function create(req, res) {
  const { spaceId, date, startTime, endTime, guests, notes } = req.body;
  if (!spaceId || !date || !startTime || !endTime) {
    return res.status(400).json({ error: 'spaceId, date, startTime e endTime são obrigatórios' });
  }

  const conflict = await prisma.reservation.findFirst({
    where: {
      spaceId: Number(spaceId),
      date: new Date(date),
      status: { not: 'CANCELLED' },
      OR: [
        { startTime: { lte: startTime }, endTime: { gt: startTime } },
        { startTime: { lt: endTime }, endTime: { gte: endTime } },
        { startTime: { gte: startTime }, endTime: { lte: endTime } },
      ],
    },
  });

  if (conflict) return res.status(409).json({ error: 'Horário já reservado para este espaço' });

  const reservation = await prisma.reservation.create({
    data: { userId: req.user.id, spaceId: Number(spaceId), date: new Date(date), startTime, endTime, guests: Number(guests) || 1, notes },
    include: { space: true },
  });
  res.status(201).json(reservation);
}

async function updateStatus(req, res) {
  const { status } = req.body;
  const reservation = await prisma.reservation.findUnique({ where: { id: Number(req.params.id) } });

  if (!reservation) return res.status(404).json({ error: 'Reserva não encontrada' });
  if (req.user.role !== 'ADMIN' && reservation.userId !== req.user.id) {
    return res.status(403).json({ error: 'Sem permissão' });
  }

  const updated = await prisma.reservation.update({
    where: { id: Number(req.params.id) },
    data: { status },
  });
  res.json(updated);
}

module.exports = { list, getBySpace, create, updateStatus };
