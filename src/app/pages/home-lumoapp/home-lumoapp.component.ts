import { Component } from '@angular/core';
import { HeaderLumoappComponent } from "../../components/header-lumoapp/header-lumoapp.component";
import { MenuLumoappComponent } from "../../components/menu-lumoapp/menu-lumoapp.component";

@Component({
  selector: 'app-home-lumoapp',
  standalone: true,
  imports: [HeaderLumoappComponent, MenuLumoappComponent],
  templateUrl: './home-lumoapp.component.html',
  styleUrl: './home-lumoapp.component.css'
})
export class HomeLumoappComponent {

}
