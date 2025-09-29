import { CollectableTypeEnum } from "../Enums/CollectableTypeEnum.enum";
import { MonthEnum } from "../Enums/MonthsEnum.enum";

export interface Collectable {
    collectableType: CollectableTypeEnum,
    name: string;
    sellPrice: number;
    location?: string;
    weather?: string;
    shadowSize?: string;
    timeStart: number;
    timeEnd: number;    
    secondTimeStart?: number;
    secondTimeEnd?: number;
    monthsNorthernHem: MonthEnum[],
    notes?: string;
    months?: string;
    isLastMonth?: boolean;
}