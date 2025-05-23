import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitialSetupComponent } from './initial-setup.component';

describe('InitialSetupComponent', () => {
  let component: InitialSetupComponent;
  let fixture: ComponentFixture<InitialSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitialSetupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitialSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
