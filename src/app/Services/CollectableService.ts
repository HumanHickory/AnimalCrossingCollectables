// src/app/services/collectable.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Collectable } from '../Models/Collectable.model';
import { MonthEnum } from '../Enums/MonthsEnum.enum';
import { CollectableTypeEnum } from '../Enums/CollectableTypeEnum.enum';
import Papa from 'papaparse';

@Injectable({ providedIn: 'root' })
export class CollectableService {

  constructor(private http: HttpClient) {}

  //SOURCE OF TRUTH
  //https://nookipedia.com/wiki/Bug/New_Horizons

  async getBugs(): Promise<Collectable[]> {
    const csvText = await this.http
      .get('/assets/Bugs.csv', { responseType: 'text' })
      .toPromise();

    const parsed = Papa.parse(csvText!, { header: true, skipEmptyLines: true });
    const rows: any[] = parsed.data as any[];

    return rows.map(row => this.toCollectable(row, CollectableTypeEnum.Bug)) ?? [];
  }  
  
  async getFish(): Promise<Collectable[]> {
    const csvText = await this.http
      .get('/assets/Fish.csv', { responseType: 'text' })
      .toPromise();

    const parsed = Papa.parse(csvText!, { header: true, skipEmptyLines: true });
    const rows: any[] = parsed.data as any[];

    return rows.map(row => this.toCollectable(row, CollectableTypeEnum.Fish)) ?? [];
  }  
  
  async getSeaCreatures(): Promise<Collectable[]> {
    const csvText = await this.http
      .get('/assets/SeaCreatures.csv', { responseType: 'text' })
      .toPromise();

    const parsed = Papa.parse(csvText!, { header: true, skipEmptyLines: true });
    const rows: any[] = parsed.data as any[];

    return rows.map(row => this.toCollectable(row, CollectableTypeEnum.SeaCreature)) ?? [];
  }
  
 private toCollectable(row: any, collectableType:  CollectableTypeEnum): Collectable {
    // Map month columns (Jan–Dec with 'x' to indicate availability)
    const monthsNorthern: MonthEnum[] = [];
    Object.keys(row).forEach(key => {
      const monthKey = key.trim();
      if (MonthEnum[monthKey as keyof typeof MonthEnum] &&
          row[monthKey]?.toString().toLowerCase() === 'x') {
        monthsNorthern.push(
          MonthEnum[monthKey as keyof typeof MonthEnum]
        );
      }
    });

    return {
      collectableType: collectableType,
      name: row['Name'] ?? '',
      sellPrice: Number(row['Sell Price'] ?? 0),
      location: row['Location'] ?? '',
      weather: row['Weather'] ?? '',
      shadowSize: row['Shadow Size'],
      timeStart: Number(row['Start Time'] ?? 0),
      timeEnd: Number(row['End Time'] ?? 0),      
      secondTimeStart: Number(row['Second Start Time']),
      secondTimeEnd: Number(row['Second End Time']),
      monthsNorthernHem: monthsNorthern,
      notes: row['Notes'],
    };
  }
}
