import { Component } from '@angular/core';
import { PanelComponent } from './components/panel/panel';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PanelComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'FrontendAngular';
}
