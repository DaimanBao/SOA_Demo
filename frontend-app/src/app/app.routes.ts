import { Routes } from '@angular/router';

import { Dashboard } from './components/dashboard/dashboard';
import { Sinhvien } from './components/sinhvien/sinhvien';
import { Detai } from './components/detai/detai';
import { Dangky } from './components/dangky/dangky';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  {
    path: 'dashboard',
    component: Dashboard
  },

  {
    path: 'sinhvien',
    component: Sinhvien
  },

  {
    path: 'detai',
    component: Detai
  },

  {
    path: 'dangky',
    component: Dangky
  }

];