import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DesktopComponent } from './modules/desktop/desktop.component';
import { GlobalStateDataSource } from './state/global-state.datasource';
import { ButtonComponent } from './shared/components/button/button.component';
import { ActionBarComponent } from './common/action-bar/action-bar.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    DesktopComponent,
    ActionBarComponent,
    ButtonComponent,
    ToastComponent,
  ],
  providers: [GlobalStateDataSource],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'digi-angular';

  globalState = inject(GlobalStateDataSource);

  async ngOnInit() {
    await this.globalState.connect();
  }
}
