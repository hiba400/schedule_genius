import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import type { Professor, ProfessorInsert, Availability, AvailabilityInsert } from '../types/database';

export class ProfessorsService {
  async getAll(): Promise<Professor[]> {
    const sql = 'SELECT * FROM professors ORDER BY name';
    const results = await query<Professor[]>(sql);
    return results;
  }

  async getById(id: number): Promise<Professor> {
    const sql = 'SELECT * FROM professors WHERE id = ?';
    const results = await query<Professor[]>(sql, [id]);
    
    if (results.length === 0) {
      throw new AppError('Professor not found', 404);
    }
    
    return results[0];
  }

  async create(professorData: ProfessorInsert): Promise<Professor> {
    // Vérifier l'unicité de l'email
    const existing = await query<Professor[]>(
      'SELECT id FROM professors WHERE email = ?',
      [professorData.email]
    );
    
    if (existing.length > 0) {
      throw new AppError('Professor email already exists', 400);
    }

    const sql = `
      INSERT INTO professors (name, email, specialties, max_hours)
      VALUES (?, ?, ?, ?)
    `;
    
    const result = await query<{ insertId: number }>(sql, [
      professorData.name,
      professorData.email,
      professorData.specialties || null,
      professorData.max_hours || 0,
    ]);

    return this.getById(result.insertId);
  }

  async update(id: number, professorData: Partial<ProfessorInsert>): Promise<Professor> {
    // Si on met à jour l'email, vérifier l'unicité
    if (professorData.email) {
      const existing = await query<Professor[]>(
        'SELECT id FROM professors WHERE email = ? AND id != ?',
        [professorData.email, id]
      );
      
      if (existing.length > 0) {
        throw new AppError('Professor email already exists', 400);
      }
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (professorData.name !== undefined) {
      updates.push('name = ?');
      values.push(professorData.name);
    }
    if (professorData.email !== undefined) {
      updates.push('email = ?');
      values.push(professorData.email);
    }
    if (professorData.specialties !== undefined) {
      updates.push('specialties = ?');
      values.push(professorData.specialties);
    }
    if (professorData.max_hours !== undefined) {
      updates.push('max_hours = ?');
      values.push(professorData.max_hours);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    values.push(id);
    const sql = `UPDATE professors SET ${updates.join(', ')} WHERE id = ?`;
    
    await query(sql, values);
    return this.getById(id);
  }

  async delete(id: number): Promise<void> {
    const result = await query<{ affectedRows: number }>(
      'DELETE FROM professors WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      throw new AppError('Professor not found', 404);
    }
  }

  async getAvailability(professorId: number): Promise<Availability[]> {
    const sql = `
      SELECT * FROM availability 
      WHERE professor_id = ?
      ORDER BY day_of_week, slot_index
    `;
    const results = await query<Availability[]>(sql, [professorId]);
    return results;
  }

  async updateAvailability(
    professorId: number,
    availability: Array<{ day_of_week: number; slot_index: number; available: boolean }>
  ): Promise<void> {
    // Supprimer les anciennes disponibilités
    await query('DELETE FROM availability WHERE professor_id = ?', [professorId]);

    // Insérer les nouvelles
    if (availability.length > 0) {
      const placeholders = availability.map(() => '(?, ?, ?, ?)').join(', ');
      const values = availability.flatMap(a => [
        professorId,
        a.day_of_week,
        a.slot_index,
        a.available ? 1 : 0,
      ]);

      const sql = `
        INSERT INTO availability (professor_id, day_of_week, slot_index, available)
        VALUES ${placeholders}
      `;
      
      await query(sql, values);
    }
  }
}
