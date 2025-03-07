import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AuthComponent } from './pages/auth/auth.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeLumoappComponent } from './pages/home-lumoapp/home-lumoapp.component';
import { AuthGuard } from './service/auth.guard';
import { EstudarLumoappComponent } from './pages/estudar-lumoapp/estudar-lumoapp.component';
import { MateriasLumoappComponent } from './pages/materias-lumoapp/materias-lumoapp.component';
import { CronogramaComponent } from './pages/cronograma/cronograma.component';
import { HistoricoComponent } from './pages/historico/historico.component';
import { CanDeactivateGuard } from './utils/candeactivateguard';
import { ProfileComponent } from './pages/profile/profile.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

export const routes: Routes = [
    {path: 'home', component: HomeComponent},
    {path: 'auth', component: AuthComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'app/home', component: HomeLumoappComponent,canActivate: [AuthGuard]},
    {path: 'app/estudar', component: EstudarLumoappComponent, canActivate: [AuthGuard], canDeactivate: [CanDeactivateGuard]},
    {path: 'app/materias', component: MateriasLumoappComponent, canActivate: [AuthGuard]},
    {path: 'app/cronograma', component: CronogramaComponent, canActivate: [AuthGuard]},
    {path: 'app/historico', component: HistoricoComponent, canActivate: [AuthGuard]},
    {path: 'app/profile', component: ProfileComponent, canActivate: [AuthGuard]},
    {path: 'auth/reset-password/:token', component: ResetPasswordComponent},
    {path: '', redirectTo: 'home', pathMatch: 'full'}
];
