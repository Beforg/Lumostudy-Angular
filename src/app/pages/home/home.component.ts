import { Component } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  home01: string = "/home-01.png"
}
