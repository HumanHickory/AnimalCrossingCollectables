import { Component, computed, effect, inject, resource, signal } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { CollectableService } from '../../Services/CollectableService';
import { Collectable } from '../../Models/Collectable.model';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MonthEnum } from '../../Enums/MonthsEnum.enum';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { CollectableTypeEnum } from '../../Enums/CollectableTypeEnum.enum';
import { ResultsComponent } from '../results-component/results-component';
import { TimeFilterEnum } from '../../Enums/TimeFilterEnum.enum';

@Component({
  selector: 'app-search-component',
  imports: [
    SelectModule,
    CommonModule,
    ButtonModule,
    TableModule,
    CardModule,
    CheckboxModule,
    TabsModule,
    FormsModule,
    ResultsComponent,
  ],
  templateUrl: './search-component.html',
  styleUrls: ['./search-component.scss'],
})
export class SearchComponent {
  private readonly collectableService = inject(CollectableService);
  readonly availableBlurb = signal<string>('');
  readonly showOnlyMissing = signal<boolean>(false);
  readonly showItsRaining = signal<boolean>(false);
  readonly timeFilter = signal<TimeFilterEnum>(TimeFilterEnum.RightNow);

  readonly bugHeaders = signal<string[]>(['Name', 'Time', 'Location', 'Weather', 'Months']);
  readonly fishHeaders = signal<string[]>(['Name', 'Time', 'Location', 'Shadow Size', 'Notes', 'Months']);
  readonly seaCreatureHeaders = signal<string[]>(['Name', 'Time', 'Shadow Size', 'Months']);

  readonly bugsResource = resource<Collectable[], unknown>({
    loader: () => this.collectableService.getBugs(),
  });

  readonly fishResource = resource<Collectable[], unknown>({
    loader: () => this.collectableService.getFish(),
  });

  readonly seaCreaturesResource = resource<Collectable[], unknown>({
    loader: () => this.collectableService.getSeaCreatures(),
  });

  readonly bugs = computed<Collectable[]>(() => this.bugsResource.value() ?? []);
  readonly fish = computed<Collectable[]>(() => this.fishResource.value() ?? []);
  readonly seaCreatures = computed<Collectable[]>(() => this.seaCreaturesResource.value() ?? []);

  getCollectables(timeFilter: TimeFilterEnum) {
    this.timeFilter.set(timeFilter);
  }



  availableBugs = computed<Collectable[]>(() => {
    if (!this.bugs()) return [];
    return this.getAvailableCollectables(this.bugs());
  });

  availableFish = computed<Collectable[]>(() => {
    if (!this.fish()) return [];
    return this.getAvailableCollectables(this.fish());
  });

  availableSeaCreatures = computed<Collectable[]>(() => {
    if (!this.seaCreatures()) return [];
    return this.getAvailableCollectables(this.seaCreatures());
  });

    private getAvailableCollectables(available: Collectable[]){
     const now = new Date();
    const currentMonth = (now.getMonth() + 1) as MonthEnum;
    const currentHour = now.getHours();

    const nextMonth = currentMonth == MonthEnum.Dec ? MonthEnum.Jan : (+currentMonth + 1) as MonthEnum;

    if(this.timeFilter() == TimeFilterEnum.ThisMonth)
        available = available.filter((x) => x.monthsNorthernHem.includes(currentMonth));
    else if (this.timeFilter() == TimeFilterEnum.RightNow)
        available = available.filter((x) => x.monthsNorthernHem.includes(currentMonth) && this.isActiveNow(x, currentHour));

    available.forEach((x) => (x.months = this.monthAvailability(x)));
    //check both this month and next month becuase in All view, we only want the alert if they're available this month but not next month
    available.forEach((x) =>  x.isLastMonth = x.monthsNorthernHem.includes(currentMonth) && !x.monthsNorthernHem.includes(nextMonth));

    return available ?? [];
  }

  private isActiveNow(collectable: Collectable, hour: number): boolean {
    // if timeStart===timeEnd (0) → available all day
    if (collectable.timeStart === 0 && collectable.timeEnd === 0) return true;

    // some bugs have overnight spans (e.g. 19 → 4)
    if (collectable.timeStart > collectable.timeEnd)
      return hour >= collectable.timeStart || hour < collectable.timeEnd;

    return hour >= collectable.timeStart && hour < collectable.timeEnd;
  }

  monthAvailability(bug: Collectable): string {
    const allMonths: { label: string; value: MonthEnum }[] = [
      { label: 'Jan', value: MonthEnum.Jan },
      { label: 'Feb', value: MonthEnum.Feb },
      { label: 'Mar', value: MonthEnum.Mar },
      { label: 'Apr', value: MonthEnum.Apr },
      { label: 'May', value: MonthEnum.May },
      { label: 'Jun', value: MonthEnum.Jun },
      { label: 'July', value: MonthEnum.Jul },
      { label: 'Aug', value: MonthEnum.Aug },
      { label: 'Sept', value: MonthEnum.Sep },
      { label: 'Oct', value: MonthEnum.Oct },
      { label: 'Nov', value: MonthEnum.Nov },
      { label: 'Dec', value: MonthEnum.Dec },
    ];

    return allMonths
      .map((m) => {
        if(!bug.monthsNorthernHem.includes(m.value))
          return '';
        return `${m.label} `;
      })
      .join('');
  }


}
