import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterComponent, LoginComponent, ForgotPasswordComponent, ResetPasswordComponent } from './_components/auth/index';
import { HomeComponent } from './_components/home/home.component';
import { AuthGuard } from './_guards/auth.guard';
import { AllDummyComponent, CreateDummyComponent, EditDummyComponent, ShowDummyComponent } from './_components/dummy/index';

const appRoutes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password/:token', component: ResetPasswordComponent },
    { path: 'dummies', canActivate: [AuthGuard],
    	children: [
    		{ path: '', redirectTo: 'all', pathMatch: 'full' },
			{ path: 'all', 
				children: [
		    		{ path: '', redirectTo: '1', pathMatch: 'full' },
					{ path: ':page_no', component: AllDummyComponent },
				]
			},
			{ path: 'create', component: CreateDummyComponent },
			{ path: 'edit/:id', component: EditDummyComponent },
			{ path: 'show/:id', component: ShowDummyComponent }
		]
	},
    { path: '', component: HomeComponent  },
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);