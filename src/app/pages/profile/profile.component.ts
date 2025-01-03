import { Component } from '@angular/core';
import { HeaderLumoappComponent } from "../../components/header-lumoapp/header-lumoapp.component";
import { MenuLumoappComponent } from "../../components/menu-lumoapp/menu-lumoapp.component";
import { ButtonComponent } from "../../shared/button/button.component";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [HeaderLumoappComponent, MenuLumoappComponent, ButtonComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

}
