// pages/api/vision-board/index.ts
import { prisma } from '../../../lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const memberstackId = req.headers.authorization?.split(' ')[1];
  
  if (!memberstackId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const items = await prisma.vision_board_items.findMany({
          where: { memberstack_id: memberstackId },
          orderBy: { z_index: 'asc' }
        });
        return res.status(200).json(items);

      case 'POST':
        const newItem = await prisma.vision_board_items.create({
          data: {
            memberstack_id: memberstackId,
            image_url: req.body.image_url,
            x_position: req.body.x_position,
            y_position: req.body.y_position,
            width: req.body.width,
            height: req.body.height,
            z_index: req.body.z_index,
            board_color: req.body.board_color
          }
        });
        return res.status(201).json(newItem);

      case 'PUT':
        const updatedItem = await prisma.vision_board_items.update({
          where: {
            id: parseInt(req.body.id),
            memberstack_id: memberstackId
          },
          data: {
            x_position: req.body.x_position,
            y_position: req.body.y_position,
            width: req.body.width,
            height: req.body.height,
            z_index: req.body.z_index,
            board_color: req.body.board_color
          }
        });
        return res.status(200).json(updatedItem);

      case 'DELETE':
        await prisma.vision_board_items.delete({
          where: {
            id: parseInt(req.body.id),
            memberstack_id: memberstackId
          }
        });
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
