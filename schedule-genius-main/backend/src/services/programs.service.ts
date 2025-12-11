import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import type { Program, ProgramInsert } from '../types/database';

export class ProgramsService {
  async getAll(): Promise<Program[]> {
    const sql = 'SELECT * FROM programs ORDER BY name';
    const results = await query<Program[]>(sql);
    return results;
  }

  async getById(id: number): Promise<Program> {
    const sql = 'SELECT * FROM programs WHERE id = ?';
    const results = await query<Program[]>(sql, [id]);
    
    if (results.length === 0) {
      throw new AppError('Program not found', 404);
    }
    
    return results[0];
  }

  async create(programData: ProgramInsert): Promise<Program> {
    const sql = `
      INSERT INTO programs (name, level)
      VALUES (?, ?)
    `;
    
    const result = await query<{ insertId: number }>(sql, [
      programData.name,
      programData.level || null,
    ]);

    return this.getById(result.insertId);
  }

  async update(id: number, programData: Partial<ProgramInsert>): Promise<Program> {
    const updates: string[] = [];
    const values: any[] = [];

    if (programData.name !== undefined) {
      updates.push('name = ?');
      values.push(programData.name);
    }
    if (programData.level !== undefined) {
      updates.push('level = ?');
      values.push(programData.level);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    values.push(id);
    const sql = `UPDATE programs SET ${updates.join(', ')} WHERE id = ?`;
    
    await query(sql, values);
    return this.getById(id);
  }

  async delete(id: number): Promise<void> {
    const result = await query<{ affectedRows: number }>(
      'DELETE FROM programs WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      throw new AppError('Program not found', 404);
    }
  }
}
