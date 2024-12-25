import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderLumoappComponent } from './header-lumoapp.component';

describe('HeaderLumoappComponent', () => {
  let component: HeaderLumoappComponent;
  let fixture: ComponentFixture<HeaderLumoappComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderLumoappComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderLumoappComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
