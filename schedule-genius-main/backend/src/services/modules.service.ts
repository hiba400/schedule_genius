import pool, { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import type { Module, ModuleInsert } from '../types/database';

export class ModulesService {
  async getAll(): Promise<Module[]> {
    const sql = `
      SELECT m.*, p.name as program_name
      FROM modules m
      LEFT JOIN programs p ON m.program_id = p.id
      ORDER BY m.name
    `;
    const results = await query<Module[]>(sql);
    return results;
  }

  async getById(id: number): Promise<Module> {
    const sql = 'SELECT * FROM modules WHERE id = ?';
    const results = await query<Module[]>(sql, [id]);
    
    if (results.length === 0) {
      throw new AppError('Module not found', 404);
    }
    
    return results[0];
  }

  async create(moduleData: ModuleInsert): Promise<Module> {
    // Vérifier l'unicité du code
    const existing = await query<Module[]>(
      'SELECT id FROM modules WHERE code = ?',
      [moduleData.code]
    );
    
    if (existing.length > 0) {
      throw new AppError('Module code already exists', 400);
    }

    const sql = `
      INSERT INTO modules (name, code, type, nature, hours_cm, hours_td, hours_tp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query<{ insertId: number }>(sql, [
      moduleData.name,
      moduleData.code,
      moduleData.type || null,
      moduleData.nature || null,
      moduleData.hours_cm || 0,
      moduleData.hours_td || 0,
      moduleData.hours_tp || 0,
    ]);

    return this.getById(result.insertId);
  }

  async update(id: number, moduleData: Partial<ModuleInsert>): Promise<Module> {
    // Si on met à jour le code, vérifier l'unicité
    if (moduleData.code) {
      const existing = await query<Module[]>(
        'SELECT id FROM modules WHERE code = ? AND id != ?',
        [moduleData.code, id]
      );
      
      if (existing.length > 0) {
        throw new AppError('Module code already exists', 400);
      }
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (moduleData.name !== undefined) {
      updates.push('name = ?');
      values.push(moduleData.name);
    }
    if (moduleData.code !== undefined) {
      updates.push('code = ?');
      values.push(moduleData.code);
    }
    if (moduleData.type !== undefined) {
      updates.push('type = ?');
      values.push(moduleData.type);
    }
    if (moduleData.nature !== undefined) {
      updates.push('nature = ?');
      values.push(moduleData.nature);
    }
    if (moduleData.hours_cm !== undefined) {
      updates.push('hours_cm = ?');
      values.push(moduleData.hours_cm);
    }
    if (moduleData.hours_td !== undefined) {
      updates.push('hours_td = ?');
      values.push(moduleData.hours_td);
    }
    if (moduleData.hours_tp !== undefined) {
      updates.push('hours_tp = ?');
      values.push(moduleData.hours_tp);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    values.push(id);
    const sql = `UPDATE modules SET ${updates.join(', ')} WHERE id = ?`;
    
    await query(sql, values);
    return this.getById(id);
  }

  async delete(id: number): Promise<void> {
    const result = await query<{ affectedRows: number }>(
      'DELETE FROM modules WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      throw new AppError('Module not found', 404);
    }
  }
}
