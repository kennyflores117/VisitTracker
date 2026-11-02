import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VisitList } from './visit-list/visit-list';

@Component({
  imports: [RouterOutlet, VisitList],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('visit-tracker-ui');
}
