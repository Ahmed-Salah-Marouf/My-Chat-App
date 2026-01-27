import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'chat',
        pathMatch: 'full'
    },
    {
        path: 'chat',
        loadComponent: () => import('./features/chat/chat-layout/chat-layout.component')
            .then(m => m.ChatLayoutComponent)
    }
];
