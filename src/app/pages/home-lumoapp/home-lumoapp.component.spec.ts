import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeLumoappComponent } from './home-lumoapp.component';

describe('HomeLumoappComponent', () => {
  let component: HomeLumoappComponent;
  let fixture: ComponentFixture<HomeLumoappComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeLumoappComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeLumoappComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
