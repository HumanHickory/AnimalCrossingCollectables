import { Component, computed, effect, input, signal } from '@angular/core';
import { Collectable } from '../../Models/Collectable.model';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { FormsModule } from '@angular/forms';
import { CollectableTypeEnum } from '../../Enums/CollectableTypeEnum.enum';
import { TimeFilterEnum } from '../../Enums/TimeFilterEnum.enum';

@Component({
  selector: 'app-results-component',
  imports: [
    SelectModule,
    CommonModule,
    ButtonModule,
    TableModule,
    CardModule,
    CheckboxModule,
    TabsModule,
    FormsModule
  ],
  templateUrl: './results-component.html',
  styleUrl: './results-component.scss',
})
export class ResultsComponent {
  availableOptions = input<Collectable[]>([]);
  tableHeaders = input.required<string[]>();
  typeEnum = input<CollectableTypeEnum>(CollectableTypeEnum.Bug);
  showOnlyMissing = input.required<boolean>();
  showItsRaining = input.required<boolean>();
  timeFilter = input.required<TimeFilterEnum>();

  readonly selectedCollectables = signal<Collectable[]>([]);
  readonly selectedBugs = signal<Collectable[]>(this.loadBugsFromStorage());
  readonly selectedFish = signal<Collectable[]>(this.loadFishFromStorage());
  readonly selectedSeaCreatures = signal<Collectable[]>(this.loadSeaCreaturesFromStorage());
  readonly loadedSelectedCollectables = signal<boolean>(false);

  constructor() {
    //this is successfully getting the values from local storage!
    this.selectedBugs.set(this.loadBugsFromStorage());
    this.selectedFish.set(this.loadFishFromStorage());
    this.selectedSeaCreatures.set(this.loadSeaCreaturesFromStorage());

    //for god knows what reason, type and available options are not coming over right away (I tried everything and gave up so now we have this)
    //so when type changes, we set the selected collectable to whatever the type is. Type shouldn't change after that (just once for each page)
    effect(() => {
      const type = this.typeEnum();

      switch (type) {
        case CollectableTypeEnum.Bug:
          this.selectedCollectables.set(this.selectedBugs());
          break;
        case CollectableTypeEnum.Fish:
          this.selectedCollectables.set(this.selectedFish());
          break;
        default:
          this.selectedCollectables.set(this.selectedSeaCreatures());
      }
      this.loadedSelectedCollectables.set(true);
    });

    //when the page first loads, available options and type enum aren't available, so we don't want to mess with local storage
    //until we know that they're set and correct (not just default values)
    //once it has been set, then we can watch for changes to selected collectables, and update local storage as we go
    effect(() => {
      if (this.availableOptions().length == 0 || this.loadedSelectedCollectables() === false)
        return;

      let current = this.selectedCollectables();

      if (this.typeEnum() == CollectableTypeEnum.Bug) {
        this.selectedBugs.set(current);
        localStorage.setItem('selectedBugs', JSON.stringify(current));
      } else if (this.typeEnum() == CollectableTypeEnum.Fish) {
        localStorage.setItem('selectedFish', JSON.stringify(current));
        this.selectedFish.set(current);
      } else {
        this.selectedSeaCreatures.set(current);
        localStorage.setItem('selectedSeaCreatures', JSON.stringify(current));
      }
    });
  }

  private loadBugsFromStorage(): Collectable[] {
    const saved = localStorage.getItem('selectedBugs');
    try {
      return saved ? (JSON.parse(saved) as Collectable[]) : [];
    } catch {
      return [];
    }
  }

  private loadFishFromStorage(): Collectable[] {
    const saved = localStorage.getItem('selectedFish');
    try {
      return saved ? (JSON.parse(saved) as Collectable[]) : [];
    } catch {
      return [];
    }
  }

  private loadSeaCreaturesFromStorage(): Collectable[] {
    const saved = localStorage.getItem('selectedSeaCreatures');
    try {
      return saved ? (JSON.parse(saved) as Collectable[]) : [];
    } catch {
      return [];
    }
  }

  readonly displayedOptions = computed<Collectable[]>(() => {
    if (!this.availableOptions()) return [];

    let options = this.availableOptions();

    if (this.showOnlyMissing()) {
      let selected;
      if (this.typeEnum() == CollectableTypeEnum.Bug) selected = this.selectedBugs();
      else if (this.typeEnum() == CollectableTypeEnum.Fish) selected = this.selectedFish();
      else selected = this.selectedSeaCreatures();

        options = options.filter((av) => !selected.some((sel) => sel.name === av.name));
    }

    if(this.showItsRaining()){
        if (this.typeEnum() == CollectableTypeEnum.Bug){
          options = options.filter((x) => !x.weather?.startsWith('Any except rain'));
          options = options.filter((x) => !x.weather?.startsWith('Rain only'));
        }
       else if (this.typeEnum() == CollectableTypeEnum.Fish)
        options = options.filter((x) => !x.notes?.startsWith('Rain'));
    }

    

    return options ?? [];
  });

  readonly availableBlurb = computed<string>(() => {
    if (!this.availableOptions()) return '';
    let timeString = '';
    switch (this.timeFilter()) {
      case TimeFilterEnum.All:
        timeString = 'total';
        break;
      case TimeFilterEnum.ThisMonth:
        timeString = 'this month';
        break;
      case TimeFilterEnum.RightNow:
        timeString = 'right now';
        break;
    }

    let options = this.availableOptions();

    const caughtNow = this.availableOptions().filter((av) =>
      this.selectedCollectables().some((sel) => sel.name === av.name)
    ).length;

    let animalType = '';
    if (this.typeEnum() == CollectableTypeEnum.Bug) animalType = 'bugs';
    else if (this.typeEnum() == CollectableTypeEnum.Fish) animalType = 'fish';
    else animalType = 'sea creatures';

    if (this.showOnlyMissing() === true) {
      let selected;
      if (this.typeEnum() == CollectableTypeEnum.Bug) selected = this.selectedBugs();
      else if (this.typeEnum() == CollectableTypeEnum.Fish) selected = this.selectedFish();
      else selected = this.selectedSeaCreatures();

      options = options.filter((av) => !selected.some((sel) => sel.name === av.name));
      return `There are ${options.length} ${animalType} available ${timeString} that you have not caught yet.`;
    } else
      return (
        `There are ${options.length} ${animalType} available ${timeString}. ` +
        `You have caught ${caughtNow} of them.`
      );
  });

  toDate(hour: number): Date {
    const d = new Date();
    d.setHours(hour, 0, 0, 0);
    return d;
  }


}
