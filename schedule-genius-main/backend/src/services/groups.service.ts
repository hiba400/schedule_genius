import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import type { Group, GroupInsert } from '../types/database';

export class GroupsService {
  async getAll(): Promise<Group[]> {
    const sql = 'SELECT * FROM groups ORDER BY name';
    const results = await query<Group[]>(sql);
    return results;
  }

  async getById(id: number): Promise<Group> {
    const sql = 'SELECT * FROM groups WHERE id = ?';
    const results = await query<Group[]>(sql, [id]);
    
    if (results.length === 0) {
      throw new AppError('Group not found', 404);
    }
    
    return results[0];
  }

  async getByProgram(programId: number): Promise<Group[]> {
    const sql = 'SELECT * FROM groups WHERE program_id = ? ORDER BY name';
    const results = await query<Group[]>(sql, [programId]);
    return results;
  }

  async create(groupData: GroupInsert): Promise<Group> {
    // Vérifier que le programme existe
    const program = await query<{ id: number }[]>(
      'SELECT id FROM programs WHERE id = ?',
      [groupData.program_id]
    );
    
    if (program.length === 0) {
      throw new AppError('Program not found', 400);
    }

    const sql = `
      INSERT INTO groups (program_id, name, size)
      VALUES (?, ?, ?)
    `;
    
    const result = await query<{ insertId: number }>(sql, [
      groupData.program_id,
      groupData.name,
      groupData.size || 0,
    ]);

    return this.getById(result.insertId);
  }

  async update(id: number, groupData: Partial<GroupInsert>): Promise<Group> {
    // Si on met à jour program_id, vérifier qu'il existe
    if (groupData.program_id !== undefined) {
      const program = await query<{ id: number }[]>(
        'SELECT id FROM programs WHERE id = ?',
        [groupData.program_id]
      );
      
      if (program.length === 0) {
        throw new AppError('Program not found', 400);
      }
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (groupData.program_id !== undefined) {
      updates.push('program_id = ?');
      values.push(groupData.program_id);
    }
    if (groupData.name !== undefined) {
      updates.push('name = ?');
      values.push(groupData.name);
    }
    if (groupData.size !== undefined) {
      updates.push('size = ?');
      values.push(groupData.size);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    values.push(id);
    const sql = `UPDATE groups SET ${updates.join(', ')} WHERE id = ?`;
    
    await query(sql, values);
    return this.getById(id);
  }

  async delete(id: number): Promise<void> {
    const result = await query<{ affectedRows: number }>(
      'DELETE FROM groups WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      throw new AppError('Group not found', 404);
    }
  }
}
