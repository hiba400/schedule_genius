import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import type { Room, RoomInsert } from '../types/database';

export class RoomsService {
  async getAll(): Promise<Room[]> {
    const sql = 'SELECT * FROM rooms ORDER BY name';
    const results = await query<Room[]>(sql);
    return results;
  }

  async getById(id: number): Promise<Room> {
    const sql = 'SELECT * FROM rooms WHERE id = ?';
    const results = await query<Room[]>(sql, [id]);
    
    if (results.length === 0) {
      throw new AppError('Room not found', 404);
    }
    
    return results[0];
  }

  async create(roomData: RoomInsert): Promise<Room> {
    // Vérifier l'unicité du nom
    const existing = await query<Room[]>(
      'SELECT id FROM rooms WHERE name = ?',
      [roomData.name]
    );
    
    if (existing.length > 0) {
      throw new AppError('Room name already exists', 400);
    }

    const sql = `
      INSERT INTO rooms (name, type, capacity, equipment)
      VALUES (?, ?, ?, ?)
    `;
    
    const result = await query<{ insertId: number }>(sql, [
      roomData.name,
      roomData.type || null,
      roomData.capacity || 0,
      roomData.equipment || null,
    ]);

    return this.getById(result.insertId);
  }

  async update(id: number, roomData: Partial<RoomInsert>): Promise<Room> {
    // Si on met à jour le nom, vérifier l'unicité
    if (roomData.name) {
      const existing = await query<Room[]>(
        'SELECT id FROM rooms WHERE name = ? AND id != ?',
        [roomData.name, id]
      );
      
      if (existing.length > 0) {
        throw new AppError('Room name already exists', 400);
      }
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (roomData.name !== undefined) {
      updates.push('name = ?');
      values.push(roomData.name);
    }
    if (roomData.type !== undefined) {
      updates.push('type = ?');
      values.push(roomData.type);
    }
    if (roomData.capacity !== undefined) {
      updates.push('capacity = ?');
      values.push(roomData.capacity);
    }
    if (roomData.equipment !== undefined) {
      updates.push('equipment = ?');
      values.push(roomData.equipment);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    values.push(id);
    const sql = `UPDATE rooms SET ${updates.join(', ')} WHERE id = ?`;
    
    await query(sql, values);
    return this.getById(id);
  }

  async delete(id: number): Promise<void> {
    const result = await query<{ affectedRows: number }>(
      'DELETE FROM rooms WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      throw new AppError('Room not found', 404);
    }
  }
}
