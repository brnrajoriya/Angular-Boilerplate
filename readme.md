Angular Ready To Go Boilerplate by Brn.Rajoriya

** UI Features
* Material And Bootstrap Configurations

** Application Features
* CRUD Dummy Implementation - With Http Api's, Sorting, Headers Solution 
* Authentication Guard & Service
* Login / Registration / Forgot / Reset Components
* File Upload - Images / Videos Upload with Form Data
* Staging Environment Setup
* JWT Intercepter Helper
* Error Intercepter Helper
* Model interfaces 
* Separate Modules
* Separate Services
* Separate Router Module

## Prerequisites

* Node - v8.11.3
* NPM - v6.4.0
* Angular CLI - v7.1.4

# Note - The System User Should have permission to change in Prerequisites Folders 

## Installation

* npm install  // It will install all the dependencies 
* ng serve -o  // It will open browser with localhost:4200
* ng build     // It will create build with local mode - Set from `\src\environments\environment.ts`
* ng build --configuration=stage  // It will build the app with Staging mode - Set from `\src\environments\environment.stage.ts`
* ng build --prod    // It will create build with production mode - Set from `\src\environments\environment.prod.ts`

## Create New Component\Service\route

## Model/Service
* ng g service _services/dummy
and new Model in _models folder


## CRUD View & Controller / HTML,CSS,TS
* ng g component _components/dummy/all
* ng g component _components/dummy/create
* ng g component _components/dummy/edit
* ng g component _components/dummy/show


## create a new index.ts file under _components/dummy folder
* export all classes

	`export * from './all/all.component';`

	`export * from './create/create.component';`

	`export * from './edit/edit.component';`

	`export * from './show/show.component';`


## New Route 

	`{ path: 'dummies', canActivate: [AuthGuard],
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
	},`