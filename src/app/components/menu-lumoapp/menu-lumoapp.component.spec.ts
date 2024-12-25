import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuLumoappComponent } from './menu-lumoapp.component';

describe('MenuLumoappComponent', () => {
  let component: MenuLumoappComponent;
  let fixture: ComponentFixture<MenuLumoappComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuLumoappComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuLumoappComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
