import { Component } from '@angular/core';
import { ButtonComponent } from "../../shared/button/button.component";
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ButtonComponent, RouterLink, RouterModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  logo: string = '/logo.png';
  banner: string = '/banner.png';
}
