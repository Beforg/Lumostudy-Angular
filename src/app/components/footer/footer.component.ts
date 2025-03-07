import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  github: string = '/logo-github.png';
  logo: string = '/logo4.png';
  
   openLink = (link: string) => {
    window.open(link, '_blank');
  }
}
