import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { AllDummyComponent, CreateDummyComponent, EditDummyComponent, ShowDummyComponent } from '../_components/dummy/index';

@NgModule({
  imports: [
  	CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  declarations: [
  	AllDummyComponent,
    CreateDummyComponent,
    EditDummyComponent,
    ShowDummyComponent
  ]
})
export class CrudModule { }
