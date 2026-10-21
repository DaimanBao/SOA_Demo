
import { Routes } from '@angular/router';

import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { Sinhvien } from './components/sinhvien/sinhvien';
import { Detai } from './components/detai/detai';
import { Dangky } from './components/dangky/dangky';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },
  {
    path: 'sinhvien',
    component: Sinhvien,
    canActivate: [authGuard]
  },
  {
    path: 'detai',
    component: Detai,
    canActivate: [authGuard]
  },
  {
    path: 'dangky',
    component: Dangky,
    canActivate: [authGuard]
  }
];
