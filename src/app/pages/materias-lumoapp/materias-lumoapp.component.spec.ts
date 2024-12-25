import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MateriasLumoappComponent } from './materias-lumoapp.component';

describe('MateriasLumoappComponent', () => {
  let component: MateriasLumoappComponent;
  let fixture: ComponentFixture<MateriasLumoappComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MateriasLumoappComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MateriasLumoappComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
