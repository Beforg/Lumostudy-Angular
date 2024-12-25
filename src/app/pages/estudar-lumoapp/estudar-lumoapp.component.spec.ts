import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstudarLumoappComponent } from './estudar-lumoapp.component';

describe('EstudarLumoappComponent', () => {
  let component: EstudarLumoappComponent;
  let fixture: ComponentFixture<EstudarLumoappComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstudarLumoappComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstudarLumoappComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
