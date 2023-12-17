import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstanceComponent } from './instance.component';

describe('InstanceComponent', () => {
  let component: InstanceComponent;
  let fixture: ComponentFixture<InstanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstanceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get first parapraph of description when title and description are separated by new line', () => {
    const desc = '## SPARK NYGC WGS batch 1 \n' +
    'Genotypes were derived using the NYGC pipeline from whole-genome sequencing for 2,629 individuals from 645 SPARK families.' +
    'NYGC generated the whole-genome data from DNA extracted from saliva.' +
    '\n\n' +
    'Genotypes were derived using the NYGC pipeline from whole-genome sequencing for 2,629 individuals from 645 SPARK families.' +
    'NYGC generated the whole-genome data from DNA extracted from saliva.'

    const result = component.getFirstParagraph(desc);
    expect(result).toBe('Genotypes were derived using the NYGC pipeline from whole-genome sequencing for 2,629 individuals from 645 SPARK families.' +
    'NYGC generated the whole-genome data from DNA extracted from saliva.');
  });

  it('should get first parapraph of description when title and description are separated by empty line', () => {
    const desc = '## SPARK NYGC WGS batch 1 \n\n' +
    'Genotypes were derived using the NYGC pipeline from whole-genome sequencing for 2,629 individuals from 645 SPARK families.' +
    'NYGC generated the whole-genome data from DNA extracted from saliva.' +
    '\n\n' +
    'Genotypes were derived using the NYGC pipeline from whole-genome sequencing for 2,629 individuals from 645 SPARK families.' +
    'NYGC generated the whole-genome data from DNA extracted from saliva.'

    const result = component.getFirstParagraph(desc);
    expect(result).toBe('Genotypes were derived using the NYGC pipeline from whole-genome sequencing for 2,629 individuals from 645 SPARK families.' +
    'NYGC generated the whole-genome data from DNA extracted from saliva.');
  });

  it('should get first parapraph of description when there is no title', () => {
    const desc =
    'Genotypes were derived using the NYGC pipeline from whole-genome sequencing for 2,629 individuals from 645 SPARK families.' +
    'NYGC generated the whole-genome data from DNA extracted from saliva.' +
    '\n\n' +
    'Genotypes were derived using the NYGC pipeline from whole-genome sequencing for 2,629 individuals from 645 SPARK families.' +
    'NYGC generated the whole-genome data from DNA extracted from saliva.'

    const result = component.getFirstParagraph(desc);
    expect(result).toBe('Genotypes were derived using the NYGC pipeline from whole-genome sequencing for 2,629 individuals from 645 SPARK families.' +
    'NYGC generated the whole-genome data from DNA extracted from saliva.');
  });
});
