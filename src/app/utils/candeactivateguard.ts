import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { EstudarLumoappComponent } from '../pages/estudar-lumoapp/estudar-lumoapp.component';

@Injectable({
  providedIn: 'root'
})
export class CanDeactivateGuard implements CanDeactivate<EstudarLumoappComponent> {
  canDeactivate(component: EstudarLumoappComponent): boolean {
    if (component.isSessaoAtiva) {
      return confirm('Você tem uma sessão de estudo em andamento. Tem certeza de que deseja sair?');
    }
    return true;
  }
}